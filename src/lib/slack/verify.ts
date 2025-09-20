import crypto from "crypto"

export interface SlackRequestVerification {
  isValid: boolean
  timestamp: number
  body: string
}

export function verifySlackRequest(
  signingSecret: string,
  headers: {
    "x-slack-signature"?: string
    "x-slack-request-timestamp"?: string
  },
  body: string,
): SlackRequestVerification {
  const signature = headers["x-slack-signature"]
  const timestamp = headers["x-slack-request-timestamp"]

  if (!signature || !timestamp) {
    return {
      isValid: false,
      timestamp: 0,
      body,
    }
  }

  const timestampNum = Number.parseInt(timestamp, 10)
  const now = Math.floor(Date.now() / 1000)

  // Request is too old (more than 5 minutes)
  if (Math.abs(now - timestampNum) > 300) {
    return {
      isValid: false,
      timestamp: timestampNum,
      body,
    }
  }

  // Create signature
  const baseString = `v0:${timestamp}:${body}`
  const expectedSignature = `v0=${crypto.createHmac("sha256", signingSecret).update(baseString).digest("hex")}`

  // Compare signatures using timing-safe comparison
  const isValid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))

  return {
    isValid,
    timestamp: timestampNum,
    body,
  }
}

export function createSlackSignature(signingSecret: string, timestamp: string, body: string): string {
  const baseString = `v0:${timestamp}:${body}`
  return `v0=${crypto.createHmac("sha256", signingSecret).update(baseString).digest("hex")}`
}

export function validateSlackChallenge(body: any): string | null {
  if (body && typeof body.challenge === "string" && body.type === "url_verification") {
    return body.challenge
  }
  return null
}

export function isSlackRetry(headers: { "x-slack-retry-num"?: string }): boolean {
  return !!headers["x-slack-retry-num"]
}

export function getSlackRetryCount(headers: { "x-slack-retry-num"?: string }): number {
  const retryNum = headers["x-slack-retry-num"]
  return retryNum ? Number.parseInt(retryNum, 10) : 0
}

export function shouldIgnoreRetry(headers: { "x-slack-retry-num"?: string }, maxRetries = 3): boolean {
  const retryCount = getSlackRetryCount(headers)
  return retryCount > maxRetries
}
