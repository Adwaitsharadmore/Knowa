// // app/api/slack/events/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { WebClient } from "@slack/web-api";
// import { supabaseServer } from "@/lib/supabase-server";
// import { ragQuery } from "@/lib/supermemory/rag";

// export const dynamic = "force-dynamic";

// function stripBotMention(text: string, botUserId?: string) {
//   if (!botUserId) return text;
//   const botMention = `<@${botUserId}>`;
//   return text.replace(new RegExp(botMention, "g"), "").trim();
// }

// async function getInstallByTeam(teamId: string) {
//   const supabase = await supabaseServer();

//   const { data, error } = await supabase
//     .from("slack_team_org_links")
//     .select("*")
//     .eq("team_id", teamId)
//     .maybeSingle();
//   if (error || !data) return null;
//   return data;
// }


// export async function POST(req: NextRequest) {
//   const rawBody = await req.text();
//   const timestamp = req.headers.get("x-slack-request-timestamp") || "";
//   const signature = req.headers.get("x-slack-signature") || "";

//   // We need payload to discover team_id so we can get the right signing secret
//   let payload: any;
//   try {
//     payload = JSON.parse(rawBody);
//   } catch {
//     return new NextResponse("Bad payload", { status: 400 });
//   }

//   const teamId = payload.team_id || payload?.event?.team;
//   const install = teamId ? await getInstallByTeam(teamId) : null;

//   if (payload.type === "url_verification") {
//     return NextResponse.json({ challenge: payload.challenge });
//   }

//   // Build Slack client with the right BYO token
//   let botToken = install?.bot_token || ""; // fallback single-tenant
//   if (!botToken) return new NextResponse("No bot token for workspace", { status: 400 });

//   const slack = new WebClient(botToken);

//   if (payload.type === "event_callback") {
//     const ev = payload.event;

//     if (ev?.type === "app_mention") {
//       const botUserId: string | undefined = payload?.authorizations?.[0]?.user_id;
//       const org_id: string = install?.org_id;

//       const rawText = String(ev.text ?? "");
//       const query = stripBotMention(rawText, botUserId) || "(no text)";

//       slack.chat.postMessage({
//         channel: ev.channel,
//         thread_ts: ev.thread_ts ?? ev.ts,
//         text: "⏳ Working on your query…",
//       }).catch(() => {});

//       try {
//         const answer = await ragQuery(query, org_id);
//         await slack.chat.postMessage({
//           channel: ev.channel,
//           thread_ts: ev.thread_ts ?? ev.ts,
//           text: `✅ ${answer}`,
//         });
//       } catch (err: any) {
//         const msg = err?.message || err?.data?.error || "unexpected error";
//         await slack.chat.postMessage({
//           channel: ev.channel,
//           thread_ts: ev.thread_ts ?? ev.ts,
//           text: `❌ Sorry, something went wrong: ${msg}`,
//         }).catch(() => {});
//       }
//     }
//   }

//   return new NextResponse(null, { status: 200 });
// }

// export async function GET() {
//   return new NextResponse("ok", { status: 200 });
// }




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
  const { data } = await supabase
    .from("slack_team_org_links")
    .select("*")
    .eq("team_id", teamId)
    .maybeSingle();
  return data || null;
}

async function seenEvent(eventId: string) {
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("slack_event_dedup")
    .select("event_id")
    .eq("event_id", eventId)
    .maybeSingle();
  return !!data;
}

// async function markEvent(eventId: string) {
//   const supabase = await supabaseServer();
//   // Table has event_id (PK) and created_at with a TTL policy / cron to clean rows older than ~15 min
//   try {
//     await supabase
//       .from("slack_event_dedup")
//       .insert({ event_id: eventId, created_at: new Date().toISOString() })
//       .throwOnError(); // makes Supabase throw instead of returning { error }
//   } catch (e) {
//     // swallow/log — duplicate keys are expected under races
//     console.warn("markEvent failed:", e);
//   }
// }

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  // Early exit: Slack URL verification
  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new NextResponse("Bad payload", { status: 400 });
  }
  if (payload.type === "url_verification") {
    return NextResponse.json({ challenge: payload.challenge });
  }

  // Early exit: ignore Slack retries
  const retryNum = req.headers.get("x-slack-retry-num");
  if (retryNum) {
    return new NextResponse(null, { status: 200 });
  }

  const teamId = payload.team_id || payload?.event?.team;
  const install = teamId ? await getInstallByTeam(teamId) : null;
  const botToken = install?.bot_token || "";
  if (!botToken) return new NextResponse("No bot token for workspace", { status: 400 });

  // Deduplicate by event_id
  // const eventId: string | undefined = payload?.event_id;
  // if (eventId && (await seenEvent(eventId))) {
  //   return new NextResponse(null, { status: 200 });
  // }
  // if (eventId) await markEvent(eventId);

  // ACK immediately so Slack won't retry
  const ack = new NextResponse(null, { status: 200 });

  // Do the heavy work asynchronously (fire-and-forget)
  (async () => {
    try {
      const slack = new WebClient(botToken);
      if (payload.type === "event_callback") {
        const ev = payload.event;
        if (ev?.type === "app_mention") {
          const botUserId: string | undefined = payload?.authorizations?.[0]?.user_id;
          const org_id: string = install?.org_id;
          const rawText = String(ev.text ?? "");
          const query = stripBotMention(rawText, botUserId) || "(no text)";
          

          // Optional: ephemeral “working…” or skip to a single final message
          await slack.chat.postMessage({
            channel: ev.channel,
            thread_ts: ev.thread_ts ?? ev.ts,
            text: "⏳ Working on your query…",
          }).catch(() => {});

          const answer = await ragQuery(query, org_id);
          await slack.chat.postMessage({
            channel: ev.channel,
            thread_ts: ev.thread_ts ?? ev.ts,
            text: `✅ ${answer}`,
          });
        }
      }
    } catch (err: any) {
      // Best-effort error reporting (can't modify the HTTP response anymore)
      try {
        const slack = new WebClient(botToken);
        const ev = payload?.event;
        if (ev?.channel) {
          const msg = err?.message || err?.data?.error || "unexpected error";
          await slack.chat.postMessage({
            channel: ev.channel,
            thread_ts: ev.thread_ts ?? ev.ts,
            text: `❌ Sorry, something went wrong: ${msg}`,
          });
        }
      } catch {}
    }
  })();

  return ack;
}

export async function GET() {
  return new NextResponse("ok", { status: 200 });
}
