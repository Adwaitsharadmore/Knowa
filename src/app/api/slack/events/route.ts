// app/api/slack/events/route.ts
import { NextRequest, NextResponse } from "next/server";
import { WebClient } from "@slack/web-api";
import { supabaseServer } from "@/lib/supabase-server";
import { ragQuery } from "@/lib/supermemory/rag";

export const dynamic = "force-dynamic";

function stripBotMention(text: string, botUserId?: string) {
  if (!botUserId) return text;
  const botMention = `<@${botUserId}>`;
  return text.replace(new RegExp(botMention, "g"), "").trim();
}

async function getInstallByTeam(teamId: string) {
  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("slack_team_org_links")
    .select("*")
    .eq("team_id", teamId)
    .maybeSingle();
  if (error || !data) return null;
  return data;
}


export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const timestamp = req.headers.get("x-slack-request-timestamp") || "";
  const signature = req.headers.get("x-slack-signature") || "";

  // We need payload to discover team_id so we can get the right signing secret
  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new NextResponse("Bad payload", { status: 400 });
  }

  const teamId = payload.team_id || payload?.event?.team;
  const install = teamId ? await getInstallByTeam(teamId) : null;

  if (payload.type === "url_verification") {
    return NextResponse.json({ challenge: payload.challenge });
  }

  // Build Slack client with the right BYO token
  let botToken = install?.bot_token || ""; // fallback single-tenant
  if (!botToken) return new NextResponse("No bot token for workspace", { status: 400 });

  const slack = new WebClient(botToken);

  if (payload.type === "event_callback") {
    const ev = payload.event;

    if (ev?.type === "app_mention") {
      const botUserId: string | undefined = payload?.authorizations?.[0]?.user_id;
      const org_id: string = install?.org_id;

      const rawText = String(ev.text ?? "");
      const query = stripBotMention(rawText, botUserId) || "(no text)";

      slack.chat.postMessage({
        channel: ev.channel,
        thread_ts: ev.thread_ts ?? ev.ts,
        text: "⏳ Working on your query…",
      }).catch(() => {});

      try {
        const answer = await ragQuery(query, org_id);
        await slack.chat.postMessage({
          channel: ev.channel,
          thread_ts: ev.thread_ts ?? ev.ts,
          text: `✅ ${answer}`,
        });
      } catch (err: any) {
        const msg = err?.message || err?.data?.error || "unexpected error";
        await slack.chat.postMessage({
          channel: ev.channel,
          thread_ts: ev.thread_ts ?? ev.ts,
          text: `❌ Sorry, something went wrong: ${msg}`,
        }).catch(() => {});
      }
    }
  }

  return new NextResponse(null, { status: 200 });
}

export async function GET() {
  return new NextResponse("ok", { status: 200 });
}
