// Slack API constants and configuration
export const SLACK_API_BASE_URL = "https://slack.com/api"

export const SLACK_SCOPES = {
  BOT: [
    "app_mentions:read",
    "channels:history",
    "channels:read",
    "chat:write",
    "groups:history",
    "groups:read",
    "im:history",
    "im:read",
    "im:write",
    "mpim:history",
    "mpim:read",
    "users:read",
    "files:read",
    "files:write",
  ],
  USER: ["channels:read", "groups:read", "im:read", "mpim:read"],
} as const

export const SLACK_EVENTS = {
  APP_MENTION: "app_mention",
  MESSAGE_IM: "message",
  MEMBER_JOINED_CHANNEL: "member_joined_channel",
  CHANNEL_CREATED: "channel_created",
  CHANNEL_DELETED: "channel_deleted",
  CHANNEL_RENAME: "channel_rename",
} as const

export const SLACK_COLORS = {
  SUCCESS: "#2eb886",
  WARNING: "#de9e31",
  DANGER: "#e01563",
  INFO: "#36c5f0",
} as const

export const RATE_LIMITS = {
  SLACK_API: {
    TIER_1: 1, // 1 request per minute (posting messages)
    TIER_2: 20, // 20 requests per minute (most methods)
    TIER_3: 50, // 50 requests per minute (simple methods)
    TIER_4: 100, // 100 requests per minute (very simple methods)
  },
  EVENTS: {
    MAX_PER_HOUR: 30000,
    MAX_PER_MINUTE: 500,
  },
} as const

export const MESSAGE_LIMITS = {
  MAX_LENGTH: 4000,
  MAX_ATTACHMENTS: 100,
  MAX_BLOCKS: 50,
} as const
