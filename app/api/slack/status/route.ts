import { NextResponse } from "next/server"

export async function GET() {
  // Mock data - replace with actual Slack API calls
  const slackStatus = {
    connected: true,
    workspaceName: "Acme Corp",
    botUserId: "U1234567890",
    installedChannels: [
      { id: "C1234567890", name: "general" },
      { id: "C0987654321", name: "engineering" },
      { id: "C1122334455", name: "support" },
    ],
    recentQueries: [
      {
        id: "q1",
        question: "What is our vacation policy?",
        channel: "general",
        user: "sarah.chen",
        timestamp: "2024-01-15T14:30:00Z",
      },
    ],
  }

  return NextResponse.json(slackStatus)
}
