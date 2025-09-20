import type { SlackApiClient } from "../api"
import { handleAppMention } from "./mention"
import { handleDirectMessage } from "./dm"
import { createAuditLog } from "../../database/operations"

export interface SlackEvent {
  type: string
  user?: string
  channel?: string
  ts?: string
  text?: string
  thread_ts?: string
  bot_id?: string
  app_id?: string
  subtype?: string
  [key: string]: any
}

export interface SlackEventPayload {
  token: string
  team_id: string
  api_app_id: string
  event: SlackEvent
  type: "event_callback"
  event_id: string
  event_time: number
  authorizations?: Array<{
    enterprise_id?: string
    team_id: string
    user_id: string
    is_bot: boolean
    is_enterprise_install: boolean
  }>
}

export async function handleSlackEvent(
  payload: SlackEventPayload,
  slackClient: SlackApiClient,
  workspaceId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { event, team_id, event_id } = payload

    // Log the event
    await createAuditLog({
      workspaceId,
      userId: event.user,
      action: `slack.event.${event.type}`,
      target: event.channel || event_id,
      details: {
        event_id,
        team_id,
        event_type: event.type,
        timestamp: payload.event_time,
      },
    })

    // Route to appropriate handler
    switch (event.type) {
      case "app_mention":
        return await handleAppMention(event, slackClient, workspaceId)

      case "message":
        // Only handle direct messages (DMs)
        if (event.channel?.startsWith("D") && !event.bot_id) {
          return await handleDirectMessage(event, slackClient, workspaceId)
        }
        return { success: true }

      case "member_joined_channel":
        return await handleMemberJoinedChannel(event, slackClient, workspaceId)

      case "channel_created":
      case "channel_deleted":
      case "channel_rename":
        return await handleChannelChange(event, slackClient, workspaceId)

      default:
        console.log(`Unhandled event type: ${event.type}`)
        return { success: true }
    }
  } catch (error) {
    console.error("Error handling Slack event:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

async function handleMemberJoinedChannel(
  event: SlackEvent,
  slackClient: SlackApiClient,
  workspaceId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if the bot was added to a channel
    if (event.user === process.env.SLACK_BOT_USER_ID) {
      // Send welcome message
      await slackClient.postMessage({
        channel: event.channel!,
        text: "👋 Hi! I'm your Knowledge Copilot. I can help answer questions using your company's knowledge base. Just mention me with your question!",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "👋 *Hi! I'm your Knowledge Copilot.*\n\nI can help answer questions using your company's knowledge base. Here's how to get started:",
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "• *Mention me* with your question: `@Knowledge Copilot What's our vacation policy?`\n• *Send me a DM* for private questions\n• I'll provide answers with source citations when possible",
            },
          },
          {
            type: "divider",
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: "💡 *Tip:* The more specific your question, the better I can help!",
              },
            ],
          },
        ],
      })

      // Log the bot addition
      await createAuditLog({
        workspaceId,
        action: "bot.added_to_channel",
        target: event.channel,
        details: {
          channel_id: event.channel,
          added_by: event.inviter,
        },
      })
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to handle member joined",
    }
  }
}

async function handleChannelChange(
  event: SlackEvent,
  slackClient: SlackApiClient,
  workspaceId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Log channel changes for audit purposes
    await createAuditLog({
      workspaceId,
      action: `channel.${event.type}`,
      target: event.channel?.id || event.channel,
      details: {
        channel_id: event.channel?.id || event.channel,
        channel_name: event.channel?.name,
        created_by: event.creator,
        old_name: event.old_name,
        new_name: event.name,
      },
    })

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to handle channel change",
    }
  }
}

export function extractMentionText(text: string, botUserId: string): string {
  // Remove the bot mention from the text
  const mentionPattern = new RegExp(`<@${botUserId}>`, "g")
  return text.replace(mentionPattern, "").trim()
}

export function shouldIgnoreEvent(event: SlackEvent): boolean {
  // Ignore bot messages
  if (event.bot_id || event.app_id) {
    return true
  }

  // Ignore message subtypes we don't care about
  const ignoredSubtypes = [
    "bot_message",
    "channel_join",
    "channel_leave",
    "channel_topic",
    "channel_purpose",
    "message_changed",
    "message_deleted",
  ]

  if (event.subtype && ignoredSubtypes.includes(event.subtype)) {
    return true
  }

  return false
}
