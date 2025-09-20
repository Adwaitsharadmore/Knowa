import type { NextRequest } from "next/server"
import { authMiddleware } from "./lib/auth/middleware"
import { addSecurityHeaders } from "./lib/security/headers"

export async function middleware(request: NextRequest) {
  // Apply authentication middleware
  const authResponse = await authMiddleware(request)

  // Add security headers to all responses
  return addSecurityHeaders(authResponse)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}
