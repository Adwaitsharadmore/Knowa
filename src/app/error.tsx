"use client"

import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="container flex min-h-screen items-center justify-center">
      <div className="text-center space-y-6">
        <AlertTriangle className="mx-auto h-24 w-24 text-destructive" />
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Something went wrong!</h1>
          <p className="text-lg text-muted-foreground">An error occurred while loading this page.</p>
        </div>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  )
}
