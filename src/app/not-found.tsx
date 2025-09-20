import { Button } from "@/components/ui/button"
import { Bot } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="container flex min-h-screen items-center justify-center">
      <div className="text-center space-y-6">
        <Bot className="mx-auto h-24 w-24 text-muted-foreground" />
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
          <p className="text-lg text-muted-foreground">The page you're looking for doesn't exist.</p>
        </div>
        <Button asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </div>
  )
}
