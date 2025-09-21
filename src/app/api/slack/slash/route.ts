import { NextRequest, NextResponse } from "next/server";
import { WebClient } from "@slack/web-api";
import { verifySlackSignature } from "@/lib/slack-verify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

export async function POST(req: NextRequest) {
  const rawBody = await req.text(); // keep raw for signature base string
  const timestamp = req.headers.get("x-slack-request-timestamp");
  const signature = req.headers.get("x-slack-signature");
  const secret = process.env.SLACK_SIGNING_SECRET || "";
  const contentType = req.headers.get("content-type") || "";

  if (!verifySlackSignature({ signingSecret: secret, body: rawBody, timestamp, signature })) {
    return new NextResponse("Bad signature", { status: 401 });
  }

  // 1) Events / Interactivity URL verification (JSON)
  // Slack sends: { "type": "url_verification", "challenge": "..." }
  if (contentType.includes("application/json") || rawBody.trim().startsWith("{")) {
    try {
      const json = JSON.parse(rawBody);
      if (json?.type === "url_verification" && json?.challenge) {
        return NextResponse.json({ challenge: json.challenge });
      }
    } catch {
      // fall through if it wasn't valid JSON
    }
  }

  // 2) Slash command or interactivity (form-encoded)
  // Slack may send ssl_check=1 pings to verify reachability — just 200 OK.
  const params = new URLSearchParams(rawBody);
  if (params.get("ssl_check") === "1") {
    return new NextResponse("ok", { status: 200 });
  }

  // ---- Slash command echo (basic test) ----
  const userText = (params.get("text") || "").trim();
  // const channel = params.get("channel_id") || ""; // if you prefer posting a message later

  return NextResponse.json({
    response_type: "ephemeral",
    text: userText ? `You said: "${userText}"` : "Send me some text after /ask",
  });

  // Or post a message explicitly:
  // await slack.chat.postMessage({ channel, text: `You said: "${userText || "(no text)"}"` });
  // return new NextResponse(null, { status: 200 });
}

export async function GET() {
  return new NextResponse("ok", { status: 200 });
}
