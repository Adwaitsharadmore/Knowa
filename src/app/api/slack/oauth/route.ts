import { type NextRequest, NextResponse } from "next/server"
import { exchangeCodeForToken, getTeamInfo } from "@/lib/slack/auth"
import { prisma } from "@/lib/database/client"
import { encrypt } from "@/lib/security/encryption"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    if (error) {
      return NextResponse.redirect(new URL(`/integrations/slack?error=${error}`, request.url))
    }

    if (!code) {
      return NextResponse.redirect(new URL("/integrations/slack?error=missing_code", request.url))
    }

    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(code)
    const teamInfo = await getTeamInfo(tokenData.access_token)

    // Create or update workspace
    const workspace = await prisma.workspace.upsert({
      where: { slackTeamId: teamInfo.team.id },
      update: {
        name: teamInfo.team.name,
        slackAccessToken: encrypt(tokenData.access_token),
        slackBotToken: encrypt(tokenData.bot_user_access_token),
        slackBotUserId: tokenData.bot_user_id,
        updatedAt: new Date(),
      },
      create: {
        name: teamInfo.team.name,
        slackTeamId: teamInfo.team.id,
        slackAccessToken: encrypt(tokenData.access_token),
        slackBotToken: encrypt(tokenData.bot_user_access_token),
        slackBotUserId: tokenData.bot_user_id,
        settings: {
          autoRespond: true,
          confidenceThreshold: 0.7,
          maxResponseLength: 2000,
        },
      },
    })

    return NextResponse.redirect(new URL("/integrations/slack?success=true", request.url))
  } catch (error) {
    console.error("Slack OAuth error:", error)
    return NextResponse.redirect(new URL("/integrations/slack?error=oauth_failed", request.url))
  }
}
