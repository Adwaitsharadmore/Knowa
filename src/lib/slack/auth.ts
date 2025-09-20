import { SLACK_SCOPES } from "./constants"
import { encrypt, decrypt } from "../security/encryption"

export interface SlackOAuthState {
  workspaceId?: string
  returnUrl?: string
  timestamp: number
  nonce: string
}

export interface SlackOAuthTokens {
  access_token: string
  token_type: string
  scope: string
  bot_user_id: string
  app_id: string
  team: {
    id: string
    name: string
  }
  enterprise?: {
    id: string
    name: string
  }
  authed_user: {
    id: string
    scope: string
    access_token: string
    token_type: string
  }
}

export function generateOAuthUrl(options: {
  clientId: string
  redirectUri: string
  scopes?: string[]
  state?: SlackOAuthState
  userScopes?: string[]
}) {
  const { clientId, redirectUri, scopes = SLACK_SCOPES.BOT, state, userScopes } = options

  const params = new URLSearchParams({
    client_id: clientId,
    scope: scopes.join(","),
    redirect_uri: redirectUri,
  })

  if (userScopes?.length) {
    params.append("user_scope", userScopes.join(","))
  }

  if (state) {
    params.append("state", encodeState(state))
  }

  return `https://slack.com/oauth/v2/authorize?${params.toString()}`
}

export function encodeState(state: SlackOAuthState): string {
  return Buffer.from(JSON.stringify(state)).toString("base64url")
}

export function decodeState(encodedState: string): SlackOAuthState | null {
  try {
    const decoded = Buffer.from(encodedState, "base64url").toString("utf-8")
    const state = JSON.parse(decoded) as SlackOAuthState

    // Validate state structure
    if (!state.timestamp || !state.nonce) {
      return null
    }

    // Check if state is not too old (5 minutes)
    const maxAge = 5 * 60 * 1000 // 5 minutes
    if (Date.now() - state.timestamp > maxAge) {
      return null
    }

    return state
  } catch {
    return null
  }
}

export function generateNonce(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export async function encryptTokens(tokens: SlackOAuthTokens): Promise<{
  botToken: string
  userToken: string
  metadata: string
}> {
  const botToken = await encrypt(tokens.access_token)
  const userToken = await encrypt(tokens.authed_user.access_token)
  const metadata = await encrypt(
    JSON.stringify({
      bot_user_id: tokens.bot_user_id,
      app_id: tokens.app_id,
      team: tokens.team,
      enterprise: tokens.enterprise,
      scopes: tokens.scope,
      user_scopes: tokens.authed_user.scope,
    }),
  )

  return { botToken, userToken, metadata }
}

export async function decryptTokens(encrypted: {
  botToken: string
  userToken: string
  metadata: string
}): Promise<{
  botAccessToken: string
  userAccessToken: string
  botUserId: string
  appId: string
  team: { id: string; name: string }
  enterprise?: { id: string; name: string }
  scopes: string
  userScopes: string
}> {
  const botAccessToken = await decrypt(encrypted.botToken, 1)
  const userAccessToken = await decrypt(encrypted.userToken, 1)
  const metadataStr = await decrypt(encrypted.metadata, 1)
  const metadata = JSON.parse(metadataStr)

  return {
    botAccessToken,
    userAccessToken,
    botUserId: metadata.bot_user_id,
    appId: metadata.app_id,
    team: metadata.team,
    enterprise: metadata.enterprise,
    scopes: metadata.scopes,
    userScopes: metadata.user_scopes,
  }
}

export function validateScopes(requiredScopes: string[], grantedScopes: string): boolean {
  const granted = grantedScopes.split(",").map((s) => s.trim())
  return requiredScopes.every((scope) => granted.includes(scope))
}

export function hasRequiredBotScopes(grantedScopes: string): boolean {
  const required = ["app_mentions:read", "chat:write", "channels:read", "groups:read", "im:read", "im:write"]
  return validateScopes(required, grantedScopes)
}

export function parseSlackUserId(text: string): string | null {
  const match = text.match(/<@([UW][A-Z0-9]+)(\|[^>]+)?>/)
  return match ? match[1] : null
}

export function parseSlackChannelId(text: string): string | null {
  const match = text.match(/<#([CG][A-Z0-9]+)(\|[^>]+)?>/)
  return match ? match[1] : null
}

export function isDirectMessage(channelId: string): boolean {
  return channelId.startsWith("D")
}

export function isPrivateChannel(channelId: string): boolean {
  return channelId.startsWith("G")
}

export function isPublicChannel(channelId: string): boolean {
  return channelId.startsWith("C")
}
