import { type NextRequest, NextResponse } from "next/server"
import { verifySlackRequest } from "@/lib/slack/verify"
import { handleSlackEvent } from "@/lib/slack/handlers/events"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-slack-signature")
    const timestamp = request.headers.get("x-slack-request-timestamp")

    // Verify request is from Slack
    if (!verifySlackRequest(body, signature, timestamp)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event = JSON.parse(body)

    // Handle URL verification challenge
    if (event.type === "url_verification") {
      return NextResponse.json({ challenge: event.challenge })
    }

    // Handle events
    if (event.type === "event_callback") {
      await handleSlackEvent(event.event)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Slack events error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
