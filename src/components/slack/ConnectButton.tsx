"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle } from "lucide-react"
import { useState } from "react"

interface ConnectButtonProps {
  workspaceId?: string
  isConnected?: boolean
  onConnect?: () => void
  variant?: "default" | "reconnect"
  disabled?: boolean
  teamName?: string
}

export function SlackConnectButton({
  workspaceId,
  isConnected = false,
  onConnect,
  variant = "default",
  disabled = false,
  teamName,
}: ConnectButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleConnect = async () => {
    if (disabled || isLoading) return

    setIsLoading(true)
    try {
      // Generate OAuth URL and redirect
      const params = new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_SLACK_CLIENT_ID!,
        scope: [
          "app_mentions:read",
          "channels:history",
          "channels:read",
          "chat:write",
          "groups:history",
          "groups:read",
          "im:history",
          "im:read",
          "im:write",
          "users:read",
        ].join(","),
        redirect_uri: `${window.location.origin}/api/slack/oauth`,
        state: btoa(
          JSON.stringify({
            workspaceId,
            returnUrl: window.location.pathname,
            timestamp: Date.now(),
            nonce: Math.random().toString(36).substring(2),
          }),
        ),
      })

      const oauthUrl = `https://slack.com/oauth/v2/authorize?${params.toString()}`

      if (onConnect) {
        onConnect()
      }

      window.location.href = oauthUrl
    } catch (error) {
      console.error("Failed to initiate Slack OAuth:", error)
      setIsLoading(false)
    }
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <span className="text-sm font-medium">Connected{teamName ? ` to ${teamName}` : ""}</span>
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Active
        </Badge>
      </div>
    )
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={disabled || isLoading}
      className="bg-slack text-white hover:bg-slack-light"
      size="lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52-2.523c0-1.393 1.135-2.528 2.52-2.528h2.52v2.528c0 1.388-1.127 2.523-2.52 2.523zm0-6.33H2.522c-1.393 0-2.522-1.135-2.522-2.528S1.129 3.78 2.522 3.78h2.52c1.385 0 2.52 1.135 2.52 2.527s-1.135 2.528-2.52 2.528z" />
            <path d="M8.847 15.165c0-1.393 1.135-2.528 2.528-2.528s2.527 1.135 2.527 2.528v6.305c0 1.393-1.134 2.528-2.527 2.528s-2.528-1.135-2.528-2.528v-6.305z" />
            <path d="M8.847 5.042a2.528 2.528 0 0 1 2.528-2.52c1.393 0 2.527 1.127 2.527 2.52v2.52h-2.527a2.528 2.528 0 0 1-2.528-2.52zm6.33 0V2.522c0-1.393 1.135-2.522 2.528-2.522s2.528 1.129 2.528 2.522v2.52c0 1.385-1.135 2.52-2.528 2.52s-2.528-1.135-2.528-2.52z" />
            <path d="M15.177 8.847c1.393 0 2.528 1.135 2.528 2.528s-1.135 2.527-2.528 2.527H8.872c-1.393 0-2.528-1.134-2.528-2.527s1.135-2.528 2.528-2.528h6.305z" />
            <path d="M18.958 8.847a2.528 2.528 0 0 1 2.52 2.528c0 1.393-1.127 2.527-2.52 2.527h-2.52V11.375c0-1.393 1.127-2.528 2.52-2.528zm0 6.33h2.52c1.393 0 2.522 1.135 2.522 2.528s-1.129 2.528-2.522 2.528h-2.52c-1.393 0-2.52-1.135-2.52-2.528s1.127-2.528 2.52-2.528z" />
          </svg>
          {variant === "reconnect" ? "Reconnect to Slack" : "Add to Slack"}
        </>
      )}
    </Button>
  )
}
