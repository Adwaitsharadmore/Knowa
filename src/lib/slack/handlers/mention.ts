import type { SlackApiClient } from "../api"
import type { SlackEvent } from "./events"
import { searchKnowledge } from "../../supermemory/rag"
import { getUserMemories, saveUserMemory, createAuditLog } from "../../database/operations"
import { extractMentionText } from "./events"

export async function handleAppMention(
  event: SlackEvent,
  slackClient: SlackApiClient,
  workspaceId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, channel, text, ts, thread_ts } = event

    if (!user || !channel || !text) {
      return { success: false, error: "Missing required event data" }
    }

    // Extract the actual question from the mention
    const botUserId = process.env.SLACK_BOT_USER_ID!
    const question = extractMentionText(text, botUserId)

    if (!question) {
      await slackClient.postMessage({
        channel,
        thread_ts: thread_ts || ts,
        text: "Hi! I'm here to help answer questions. Just mention me with your question!",
      })
      return { success: true }
    }

    // Send typing indicator
    await slackClient.postMessage({
      channel,
      thread_ts: thread_ts || ts,
      text: "🤔 Let me search for that information...",
    })

    // Get user memories for context
    const userMemories = await getUserMemories(workspaceId, user)
    const userContext = userMemories.map((m) => m.content).join("\n")

    // Search knowledge base
    const searchResults = await searchKnowledge({
      query: question,
      containerTags: [], // Will be filtered by channel tags
      userContext,
      limit: 5,
    })

    // Generate response
    let responseText = ""
    let blocks: any[] = []

    if (searchResults.results.length > 0) {
      const topResult = searchResults.results[0]

      responseText = `Here's what I found:\n\n${topResult.content}`

      blocks = [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Answer to: "${question}"*\n\n${topResult.content}`,
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
              text: `📄 *Source:* ${topResult.source} | *Confidence:* ${Math.round(topResult.score * 100)}%`,
            },
          ],
        },
      ]

      // Add additional sources if available
      if (searchResults.results.length > 1) {
        const additionalSources = searchResults.results.slice(1, 3)
        const sourcesList = additionalSources.map((r) => `• <${r.source}|${r.title || "Document"}>`).join("\n")

        blocks.push({
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Additional sources:*\n${sourcesList}`,
          },
        })
      }
    } else {
      responseText = `I couldn't find specific information about "${question}" in the knowledge base. You might want to:\n\n• Try rephrasing your question\n• Check if the relevant documents have been uploaded\n• Contact your admin to add more knowledge sources`

      blocks = [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `I couldn't find specific information about *"${question}"* in the knowledge base.`,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "You might want to:\n• Try rephrasing your question\n• Check if relevant documents have been uploaded\n• Contact your admin to add more knowledge sources",
          },
        },
      ]
    }

    // Send the response
    await slackClient.postMessage({
      channel,
      thread_ts: thread_ts || ts,
      text: responseText,
      blocks,
      unfurl_links: false,
      unfurl_media: false,
    })

    // Save interaction as user memory
    await saveUserMemory({
      workspaceId,
      userId: user,
      content: `Asked: "${question}"`,
      containerTags: ["interaction", "question"],
      metadata: {
        type: "interaction",
        channel,
        timestamp: ts,
        hasAnswer: searchResults.results.length > 0,
      },
    })

    // Log the interaction
    await createAuditLog({
      workspaceId,
      userId: user,
      action: "bot.question_answered",
      target: channel,
      details: {
        question,
        results_count: searchResults.results.length,
        confidence: searchResults.results[0]?.score || 0,
        response_length: responseText.length,
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Error handling app mention:", error)

    // Send error message to user
    try {
      await slackClient.postMessage({
        channel: event.channel!,
        thread_ts: event.thread_ts || event.ts,
        text: "Sorry, I encountered an error while processing your question. Please try again later.",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "⚠️ *Sorry, I encountered an error while processing your question.*\n\nPlease try again later or contact your administrator if the problem persists.",
            },
          },
        ],
      })
    } catch (sendError) {
      console.error("Failed to send error message:", sendError)
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
