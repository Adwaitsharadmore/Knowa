import type { SlackApiClient } from "../api"
import type { SlackEvent } from "./events"
import { searchKnowledge } from "../../supermemory/rag"
import { getUserMemories, saveUserMemory, createAuditLog } from "../../database/operations"

export async function handleDirectMessage(
  event: SlackEvent,
  slackClient: SlackApiClient,
  workspaceId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, channel, text, ts, thread_ts } = event

    if (!user || !channel || !text) {
      return { success: false, error: "Missing required event data" }
    }

    // Ignore empty messages or commands
    if (!text.trim() || text.startsWith("/")) {
      return { success: true }
    }

    // Send typing indicator
    await slackClient.postMessage({
      channel,
      text: "🤔 Let me search for that information...",
    })

    // Get user memories for personalized context
    const userMemories = await getUserMemories(workspaceId, user)
    const userContext = userMemories.map((m) => m.content).join("\n")

    // Search knowledge base with user context
    const searchResults = await searchKnowledge({
      query: text,
      containerTags: ["general"], // DMs get general knowledge
      userContext,
      limit: 3,
    })

    let responseText = ""
    let blocks: any[] = []

    if (searchResults.results.length > 0) {
      const topResult = searchResults.results[0]

      responseText = `Here's what I found about "${text}":\n\n${topResult.content}`

      blocks = [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Here's what I found:*\n\n${topResult.content}`,
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

      // Add follow-up suggestions
      if (searchResults.results.length > 1) {
        blocks.push({
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Related topics you might be interested in:*",
          },
        })

        const suggestions = searchResults.results
          .slice(1, 3)
          .map((r) => `• ${r.title || "Related information"}`)
          .join("\n")

        blocks.push({
          type: "section",
          text: {
            type: "mrkdwn",
            text: suggestions,
          },
        })
      }

      // Add helpful actions
      blocks.push({
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "👍 Helpful",
            },
            value: "helpful",
            action_id: "feedback_helpful",
          },
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "👎 Not helpful",
            },
            value: "not_helpful",
            action_id: "feedback_not_helpful",
          },
        ],
      })
    } else {
      responseText = `I couldn't find specific information about "${text}" in the knowledge base. Let me know if you'd like me to search for something else, or you can contact your admin to add more knowledge sources.`

      blocks = [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `I couldn't find specific information about *"${text}"* in the knowledge base.`,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "💡 *Try:*\n• Asking a more specific question\n• Using different keywords\n• Checking if the information has been uploaded",
          },
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "🔄 Try different search",
              },
              value: "retry_search",
              action_id: "retry_search",
            },
          ],
        },
      ]
    }

    // Send the response
    await slackClient.postMessage({
      channel,
      text: responseText,
      blocks,
      unfurl_links: false,
      unfurl_media: false,
    })

    // Save the interaction as user memory
    await saveUserMemory({
      workspaceId,
      userId: user,
      content: `DM Question: "${text}"`,
      containerTags: ["dm", "interaction"],
      metadata: {
        type: "dm_interaction",
        timestamp: ts,
        hasAnswer: searchResults.results.length > 0,
        confidence: searchResults.results[0]?.score || 0,
      },
    })

    // Update user preferences based on interaction
    if (searchResults.results.length > 0) {
      const topicTags = searchResults.results[0].containerTags || []
      if (topicTags.length > 0) {
        await saveUserMemory({
          workspaceId,
          userId: user,
          content: `Interested in topics: ${topicTags.join(", ")}`,
          containerTags: ["preference", "topics"],
          metadata: {
            type: "preference",
            topics: topicTags,
            confidence: 0.7,
          },
        })
      }
    }

    // Log the DM interaction
    await createAuditLog({
      workspaceId,
      userId: user,
      action: "bot.dm_answered",
      target: channel,
      details: {
        question: text,
        results_count: searchResults.results.length,
        confidence: searchResults.results[0]?.score || 0,
        response_length: responseText.length,
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Error handling direct message:", error)

    // Send error message to user
    try {
      await slackClient.postMessage({
        channel: event.channel!,
        text: "Sorry, I encountered an error while processing your message. Please try again later.",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "⚠️ *Sorry, I encountered an error.*\n\nPlease try again later or contact your administrator if the problem persists.",
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
