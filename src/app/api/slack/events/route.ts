// app/api/slack/events/route.ts
import { NextRequest, NextResponse } from "next/server";
import { WebClient } from "@slack/web-api";
import { verifySlackSignature } from "@/lib/slack-verify";

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

// Needed to access raw body in Vercel/Next.js
export const dynamic = "force-dynamic";

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
    const ev = payload.event;

    // Only respond to app mentions
    if (ev.type === "app_mention") {
      const text = ev.text || "";

      await slack.chat.postMessage({
        channel: ev.channel,
        thread_ts: ev.thread_ts ?? ev.ts,
        text: `👋 You mentioned me and said: "${text} message from Knowa!!!!"`,
      });
    }
  }

  // Always ack to Slack
  return new NextResponse(null, { status: 200 });
}

export async function GET() {
  return new NextResponse("ok", { status: 200 });
}
