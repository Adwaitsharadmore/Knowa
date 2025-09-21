// app/api/slack/events/route.ts
import { NextRequest, NextResponse } from "next/server";
import { WebClient } from "@slack/web-api";
import { verifySlackSignature } from "@/lib/slack-verify";
import { supabaseServer } from "@/lib/supabase-server";
import { openSecret } from "@/lib/crypto/secrets";
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
    .from("slack_installs")
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

  // Verify signature with the BYO install's signing secret (fallback to env if you also support a single-tenant app)
  const candidates: string[] = [];
  if (install?.signing_secret_cipher) {
    candidates.push(openSecret(install.signing_secret_cipher));
  }
  if (process.env.SLACK_SIGNING_SECRET) {
    candidates.push(process.env.SLACK_SIGNING_SECRET);
  }

  const ok = candidates.some((secret) =>
    verifySlackSignature({ signingSecret: secret, body: rawBody, timestamp, signature })
  );
  if (!ok) return new NextResponse("Bad signature", { status: 401 });

  if (payload.type === "url_verification") {
    // (Optional) store api_app_id for stronger future lookups
    if (install && payload.api_app_id && !install.api_app_id) {
      const supabase = await supabaseServer();
      await supabase
        .from("slack_installs")
        .update({ api_app_id: payload.api_app_id })
        .eq("id", install.id);
    }
    return NextResponse.json({ challenge: payload.challenge });
  }

  // Build Slack client with the right BYO token
  let botToken = process.env.SLACK_BOT_TOKEN || ""; // fallback single-tenant
  if (install?.bot_token_cipher) {
    botToken = openSecret(install.bot_token_cipher);
  }
  if (!botToken) return new NextResponse("No bot token for workspace", { status: 400 });

  const slack = new WebClient(botToken);

  if (payload.type === "event_callback") {
    const ev = payload.event;

    if (ev?.type === "app_mention") {
      const botUserId: string | undefined = install?.bot_user_id || payload?.authorizations?.[0]?.user_id;
      const org_id: string = install?.org_id;
      console.log("org_id", org_id);

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
