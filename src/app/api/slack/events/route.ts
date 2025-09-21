// app/api/slack/events/route.ts
import { NextRequest, NextResponse } from "next/server";
import { WebClient } from "@slack/web-api";
import { verifySlackSignature } from "@/lib/slack-verify";
import { getUserOrganizations } from "@/lib/org";
import { ragQuery } from "@/lib/supermemory/rag";

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

// Needed to access raw body in Vercel/Next.js
export const dynamic = "force-dynamic";

function stripBotMention(text: string, botUserId?: string): string {
  if (!botUserId) return text;
  const botMention = `<@${botUserId}>`;
  return text.replace(new RegExp(botMention, 'g'), '').trim();
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const timestamp = req.headers.get("x-slack-request-timestamp") || "";
  const signature = req.headers.get("x-slack-signature") || "";

  if (!verifySlackSignature({ 
    signingSecret: process.env.SLACK_SIGNING_SECRET || "", 
    body: rawBody, 
    timestamp, 
    signature 
  })) {
    return new NextResponse("Bad signature", { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  console.log("payload", payload);
  
  // Slack URL verification (handshake)
  if (payload.type === "url_verification") {
    return NextResponse.json({ challenge: payload.challenge });
  }

  // Handle events
  if (payload.type === "event_callback") {
    if (payload.event?.type === "app_mention") {
      const botUserId: string | undefined = payload?.authorizations?.[0]?.user_id;
      const org_id = "org_id-763675dc-db08-4a55-ae2e-5b303c847b5a";

      const rawText = String(payload.event.text ?? "");
      const query = stripBotMention(rawText, botUserId) || "(no text)";

      // 1) Immediately tell the user we're working (DON'T await)
      slack.chat
        .postMessage({
          channel: payload.event.channel,
          thread_ts: payload.event.thread_ts ?? payload.event.ts,
          text: "⏳ Working on your query…",
        })
        .catch((e) => console.error("postMessage (working…) failed:", e?.data || e));

      // 2) Fire-and-forget the heavy work, then post the final answer
      (async () => {
        try {
          const answer = await ragQuery(query, org_id);
          await slack.chat.postMessage({
            channel: payload.event.channel,
            thread_ts: payload.event.thread_ts ?? payload.event.ts,
            text: `✅ ${answer}`,
          });
        } catch (err: any) {
          const msg = err?.message || err?.data?.error || "unexpected error";
          await slack.chat
            .postMessage({
              channel: payload.event.channel,
              thread_ts: payload.event.thread_ts ?? payload.event.ts,
              text: `❌ Sorry, something went wrong: ${msg}`,
            })
            .catch(() => {});
        }
      })();
    }
  }

  // Always return a response
  return new NextResponse(null, { status: 200 });
}


export async function GET() {
return new NextResponse("ok", { status: 200 });
}