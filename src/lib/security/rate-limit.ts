import { type NextRequest, NextResponse } from "next/server"

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

const RATE_LIMITS = {
  "/api/slack/events": { requests: 100, window: 60 * 1000 }, // 100 requests per minute
  "/api/auth": { requests: 10, window: 60 * 1000 }, // 10 requests per minute
  "/api/knowledge": { requests: 50, window: 60 * 1000 }, // 50 requests per minute
  default: { requests: 60, window: 60 * 1000 }, // 60 requests per minute
}

export async function rateLimit(request: NextRequest): Promise<NextResponse | null> {
  const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown"
  const { pathname } = request.nextUrl

  // Determine rate limit based on path
  let limit = RATE_LIMITS.default
  for (const [path, pathLimit] of Object.entries(RATE_LIMITS)) {
    if (path !== "default" && pathname.startsWith(path)) {
      limit = pathLimit
      break
    }
  }

  const key = `${ip}:${pathname}`
  const now = Date.now()

  // Clean up expired entries
  if (store[key] && now > store[key].resetTime) {
    delete store[key]
  }

  // Initialize or increment counter
  if (!store[key]) {
    store[key] = {
      count: 1,
      resetTime: now + limit.window,
    }
  } else {
    store[key].count++
  }

  // Check if limit exceeded
  if (store[key].count > limit.requests) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.requests.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": Math.ceil(store[key].resetTime / 1000).toString(),
        },
      },
    )
  }

  return null
}
