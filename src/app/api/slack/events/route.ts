// // app/api/slack/events/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { WebClient } from "@slack/web-api";
// import { verifySlackSignature } from "@/lib/slack-verify";
// import { Supermemory } from "supermemory"; // your SDK/wrapper

// const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

// const client = new Supermemory({
//   apiKey: process.env.SUPERMEMORY_API_KEY!,
// });

// export async function POST(req: NextRequest) {
//   const rawBody = await req.text();
//   const ts = req.headers.get("x-slack-request-timestamp");
//   const sig = req.headers.get("x-slack-signature");
//   const secret = process.env.SLACK_SIGNING_SECRET || "";

//   if (!verifySlackSignature({ signingSecret: secret, body: rawBody, timestamp: ts, signature: sig })) {
//     return new NextResponse("Bad signature", { status: 401 });
//   }

//   const payload = JSON.parse(rawBody);

//   // URL verification handshake
//   if (payload.type === "url_verification") {
//     return NextResponse.json({ challenge: payload.challenge });
//   }

//   if (payload.type === "event_callback") {
//     const ev = payload.event;

//     // ignore our own bot messages
//     if (ev.subtype === "bot_message") return new NextResponse(null, { status: 200 });

//     // respond in app mentions or DMs (if you subscribe to message.im)
//     const isAppMention = ev.type === "app_mention";
//     const isDM = ev.type === "message" && ev.channel_type === "im";
//     if (!isAppMention && !isDM) return new NextResponse(null, { status: 200 });

//     // -------- 1) resolve org_id (prefer ?org_id=...) --------
//     const { searchParams } = new URL(req.url);
//     const orgId = "ord_id-763675dc-db08-4a55-ae2e-5b303c847b5a";

//     // -------- 2) build query (strip "<@BOTID>") --------------
//     const botUserId: string | undefined = payload?.authorizations?.[0]?.user_id;
//     const query = stripBotMention((ev.text || "").trim(), botUserId);

//     // guard: empty query (user only @mentioned)
//     const q = query || "hello";

//     // -------- 3) Supermemory search --------------------------
//     let replyText = "";
//     let blocks: any[] | undefined;

//     try {
//       const sr = await client.search.memories({
//         q,
//         containerTag: orgId,      // <— critical: tenant isolation
//         threshold: 0.7,
//         limit: 5,
//       });

//       const items = Array.isArray(sr?.results) ? sr.results : [];
//       const top = items[0];

//       if (!top) {
//         replyText = "I couldn’t find anything relevant yet. Try rephrasing or add more docs.";
//       } else {
//         const sim = typeof top.similarity === "number" ? top.similarity.toFixed(2) : "—";
//         const docs = Array.isArray(top.documents) ? top.documents : [];

//         // nice Slack blocks + text fallback
//         blocks = [
//           {
//             type: "section",
//             text: {
//               type: "mrkdwn",
//               text: `*Answer* for \`${escapeInline(q)}\`:\n${truncate(top.memory, 1200)}`,
//             },
//           },
//           {
//             type: "context",
//             elements: [
//               { type: "mrkdwn", text: `similarity: *${sim}* • source: *${top?.metadata?.source ?? "—"}*` },
//             ],
//           },
//         ];

//         if (docs.length) {
//           const fields = docs.slice(0, 4).map((d: any) => ({
//             type: "mrkdwn",
//             text: `*${d.title || "Document"}*\n_${d.type || "doc"}_ • ${d?.metadata?.category ?? "uncategorized"}`,
//           }));
//           blocks.push({ type: "section", fields });
//         }

//         replyText = top.memory; // plain-text fallback
//       }
//     } catch (e: any) {
//       replyText = `Search error: ${e?.message || "unknown"}`;
//     }

//     // -------- 4) respond to Slack ----------------------------
//     await slack.chat.postMessage({
//       channel: ev.channel,
//       thread_ts: ev.thread_ts, // reply in thread if available
//       text: replyText,
//       ...(blocks ? { blocks } : {}),
//     });
//   }

//   return new NextResponse(null, { status: 200 });
// }

// export async function GET() {
//   return new NextResponse("ok", { status: 200 });
// }

// /* ---------------- helpers ---------------- */

// function stripBotMention(text: string, botUserId?: string) {
//   if (!text) return "";
//   if (botUserId) {
//     const mention = new RegExp(`^\\s*<@${botUserId}>\\s*`, "i");
//     return text.replace(mention, "").trim();
//   }
//   return text.replace(/^<@[^>]+>\s*/i, "").trim();
// }

// function truncate(s: string, n: number) {
//   if (!s) return "";
//   return s.length > n ? s.slice(0, n - 1) + "…" : s;
// }

// function escapeInline(s: string) {
//   return s.replace(/[`*_<>\[\]]/g, "\\$&");
// }



import { NextRequest, NextResponse } from "next/server";
import { WebClient } from "@slack/web-api";
import { verifySlackSignature } from "@/lib/slack-verify";

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

// Optional: mark as dynamic to ensure raw body is available in all deploy targets
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const rawBody = await req.text(); // IMPORTANT: raw body for signature check
  const timestamp = req.headers.get("x-slack-request-timestamp");
  const signature = req.headers.get("x-slack-signature");
  const secret = process.env.SLACK_SIGNING_SECRET || "";

  if (!verifySlackSignature({ signingSecret: secret, body: rawBody, timestamp, signature })) {
    return new NextResponse("Bad signature", { status: 401 });
  }

  const payload = JSON.parse(rawBody);

  // 1) Slack URL verification handshake
  if (payload.type === "url_verification") {
    return NextResponse.json({ challenge: payload.challenge });
  }

  // 2) Handle events
  if (payload.type === "event_callback") {
    const ev = payload.event;

    // ignore our own bot's posts to avoid loops
    if (ev.subtype === "bot_message") return new NextResponse(null, { status: 200 });

    const isMention = ev.type === "app_mention";
    const isDM = ev.type === "message" && ev.channel_type === "im";
    if (!isMention && !isDM) return new NextResponse(null, { status: 200 });

    const botUserId: string | undefined = payload?.authorizations?.[0]?.user_id;
    const text = String(ev.text ?? "");
    const query = stripBotMention(text, botUserId) || "(no text)";

    // 3) Simple echo reply
    await slack.chat.postMessage({
      channel: ev.channel,
      thread_ts: ev.thread_ts, // reply in thread if present
      text: `You said: "${query}"`,
    });
  }

  return new NextResponse(null, { status: 200 });
}

export async function GET() {
  return new NextResponse("ok", { status: 200 });
}

/* helpers */
function stripBotMention(text: string, botUserId?: string) {
  if (!text) return "";
  if (botUserId) {
    const mention = new RegExp(`^\\s*<@${botUserId}>\\s*`, "i");
    return text.replace(mention, "").trim();
  }
  // generic: strip a leading <@UXXXX>
  return text.replace(/^<@[^>]+>\s*/i, "").trim();
}
