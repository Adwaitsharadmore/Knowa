import { SLACK_API_BASE_URL } from "./constants"

export interface SlackApiResponse<T = any> {
  ok: boolean
  error?: string
  response_metadata?: {
    next_cursor?: string
    scopes?: string[]
    acceptedScopes?: string[]
  }
  data?: T
}

export interface SlackChannel {
  id: string
  name: string
  is_private: boolean
  is_member: boolean
  is_archived: boolean
  num_members?: number
  topic?: {
    value: string
    creator: string
    last_set: number
  }
  purpose?: {
    value: string
    creator: string
    last_set: number
  }
}

export interface SlackUser {
  id: string
  name: string
  real_name: string
  display_name: string
  email?: string
  is_bot: boolean
  is_admin: boolean
  is_owner: boolean
  profile: {
    image_24: string
    image_32: string
    image_48: string
    image_72: string
    image_192: string
    image_512: string
  }
}

export interface SlackMessage {
  type: string
  subtype?: string
  text: string
  user: string
  ts: string
  channel: string
  thread_ts?: string
  bot_id?: string
  app_id?: string
}

export class SlackApiClient {
  private baseUrl = SLACK_API_BASE_URL
  private token: string

  constructor(token: string) {
    this.token = token
  }

  private async makeRequest<T = any>(
    endpoint: string,
    options: {
      method?: string
      body?: any
      headers?: Record<string, string>
    } = {},
  ): Promise<SlackApiResponse<T>> {
    const url = `${this.baseUrl}/${endpoint}`
    const { method = "GET", body, headers = {} } = options

    const requestHeaders = {
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
      ...headers,
    }

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          ok: false,
          error: data.error || `HTTP ${response.status}`,
        }
      }

      return {
        ok: data.ok,
        error: data.error,
        response_metadata: data.response_metadata,
        data,
      }
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Network error",
      }
    }
  }

  // OAuth methods
  async exchangeCodeForToken(code: string, clientId: string, clientSecret: string, redirectUri: string) {
    const response = await fetch(`${this.baseUrl}/oauth.v2.access`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    })

    return await response.json()
  }

  // Team/Workspace methods
  async getTeamInfo() {
    return this.makeRequest("team.info")
  }

  async getAuthTest() {
    return this.makeRequest("auth.test")
  }

  // Channel methods
  async getChannelsList(cursor?: string, limit = 200) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      exclude_archived: "true",
      types: "public_channel,private_channel",
    })

    if (cursor) {
      params.append("cursor", cursor)
    }

    return this.makeRequest<{
      channels: SlackChannel[]
      response_metadata?: { next_cursor?: string }
    }>(`conversations.list?${params}`)
  }

  async getChannelInfo(channelId: string) {
    return this.makeRequest<{ channel: SlackChannel }>(`conversations.info?channel=${channelId}`)
  }

  async joinChannel(channelId: string) {
    return this.makeRequest("conversations.join", {
      method: "POST",
      body: { channel: channelId },
    })
  }

  async leaveChannel(channelId: string) {
    return this.makeRequest("conversations.leave", {
      method: "POST",
      body: { channel: channelId },
    })
  }

  // User methods
  async getUserInfo(userId: string) {
    return this.makeRequest<{ user: SlackUser }>(`users.info?user=${userId}`)
  }

  async getUsersList(cursor?: string, limit = 200) {
    const params = new URLSearchParams({
      limit: limit.toString(),
    })

    if (cursor) {
      params.append("cursor", cursor)
    }

    return this.makeRequest<{
      members: SlackUser[]
      response_metadata?: { next_cursor?: string }
    }>(`users.list?${params}`)
  }

  // Message methods
  async postMessage(options: {
    channel: string
    text?: string
    blocks?: any[]
    attachments?: any[]
    thread_ts?: string
    reply_broadcast?: boolean
    unfurl_links?: boolean
    unfurl_media?: boolean
  }) {
    return this.makeRequest("chat.postMessage", {
      method: "POST",
      body: options,
    })
  }

  async updateMessage(options: {
    channel: string
    ts: string
    text?: string
    blocks?: any[]
    attachments?: any[]
  }) {
    return this.makeRequest("chat.update", {
      method: "POST",
      body: options,
    })
  }

  async deleteMessage(channel: string, ts: string) {
    return this.makeRequest("chat.delete", {
      method: "POST",
      body: { channel, ts },
    })
  }

  async postEphemeral(options: {
    channel: string
    user: string
    text?: string
    blocks?: any[]
    attachments?: any[]
  }) {
    return this.makeRequest("chat.postEphemeral", {
      method: "POST",
      body: options,
    })
  }

  // File methods
  async uploadFile(options: {
    channels?: string
    content?: string
    file?: Buffer
    filename?: string
    filetype?: string
    initial_comment?: string
    thread_ts?: string
    title?: string
  }) {
    const formData = new FormData()

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === "file" && Buffer.isBuffer(value)) {
          formData.append(key, new Blob([value]), options.filename || "file")
        } else {
          formData.append(key, value.toString())
        }
      }
    })

    const response = await fetch(`${this.baseUrl}/files.upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: formData,
    })

    return await response.json()
  }

  // App methods
  async getAppInfo() {
    return this.makeRequest("apps.info")
  }

  // Bot methods
  async getBotInfo(botId: string) {
    return this.makeRequest(`bots.info?bot=${botId}`)
  }
}

// Helper functions
export function createSlackClient(token: string): SlackApiClient {
  return new SlackApiClient(token)
}

export function isSlackError(response: SlackApiResponse): response is SlackApiResponse & { ok: false; error: string } {
  return !response.ok && !!response.error
}

export function formatSlackMessage(
  text: string,
  options: {
    bold?: boolean
    italic?: boolean
    code?: boolean
    blockquote?: boolean
    strikethrough?: boolean
  } = {},
) {
  let formatted = text

  if (options.bold) formatted = `*${formatted}*`
  if (options.italic) formatted = `_${formatted}_`
  if (options.code) formatted = `\`${formatted}\``
  if (options.blockquote) formatted = `> ${formatted}`
  if (options.strikethrough) formatted = `~${formatted}~`

  return formatted
}

export function createSlackBlocks(
  content: {
    type: "section" | "divider" | "context" | "actions"
    text?: string
    markdown?: boolean
    elements?: any[]
    accessory?: any
  }[],
) {
  return content.map((block) => {
    switch (block.type) {
      case "section":
        return {
          type: "section",
          text: block.text
            ? {
                type: block.markdown ? "mrkdwn" : "plain_text",
                text: block.text,
              }
            : undefined,
          accessory: block.accessory,
        }
      case "divider":
        return { type: "divider" }
      case "context":
        return {
          type: "context",
          elements: block.elements || [],
        }
      case "actions":
        return {
          type: "actions",
          elements: block.elements || [],
        }
      default:
        return block
    }
  })
}
