import { NextResponse } from "next/server"

export async function GET() {
  // Mock data - replace with actual database queries
  const stats = {
    totalDocuments: 1247,
    slackQueries: 3429,
    activeUsers: 89,
    successRate: 94.2,
    documentProcessingProgress: 68,
    integrationStatus: {
      slack: {
        connected: true,
        botInstalled: true,
        activeChannels: 12,
      },
      ai: {
        modelOnline: true,
        vectorDbReady: true,
      },
    },
  }

  return NextResponse.json(stats)
}
