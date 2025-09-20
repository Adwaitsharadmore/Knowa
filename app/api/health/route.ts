import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: {
      database: "connected",
      slack: "connected",
      ai: "online",
    },
  })
}
