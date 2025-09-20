import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot, FileText, MessageSquare, Shield, Zap, Users } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Knowledge Copilot</span>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary">Beta</Badge>
            <Button asChild>
              <Link href="/integrations/slack">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-24 text-center">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Enterprise Knowledge
              <span className="text-primary"> Copilot</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Connect your Slack workspace, upload company knowledge, and get accurate, source-backed answers instantly.
              Built for teams that need reliable information.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild className="text-lg">
              <Link href="/integrations/slack">
                <MessageSquare className="mr-2 h-5 w-5" />
                Add to Slack
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg bg-transparent">
              <Link href="/knowledge/upload">
                <FileText className="mr-2 h-5 w-5" />
                Upload Knowledge
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight">Everything you need for enterprise knowledge</h2>
            <p className="mt-4 text-lg text-muted-foreground">Powerful features designed for modern teams</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <MessageSquare className="h-10 w-10 text-primary" />
                <CardTitle>Slack Integration</CardTitle>
                <CardDescription>
                  Native Slack bot with channel-specific knowledge and memory across conversations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• OAuth 2.0 authentication</li>
                  <li>• Channel-specific responses</li>
                  <li>• Direct message support</li>
                  <li>• Persistent memory</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <FileText className="h-10 w-10 text-primary" />
                <CardTitle>Knowledge Management</CardTitle>
                <CardDescription>
                  Upload documents, URLs, and text with intelligent processing and retrieval
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Multiple file formats</li>
                  <li>• URL content extraction</li>
                  <li>• Container-based tagging</li>
                  <li>• Processing status tracking</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-primary" />
                <CardTitle>Enterprise Security</CardTitle>
                <CardDescription>AES-256 encryption, rate limiting, and comprehensive audit logging</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Token encryption</li>
                  <li>• Request verification</li>
                  <li>• Rate limiting</li>
                  <li>• Audit trails</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-10 w-10 text-primary" />
                <CardTitle>RAG-Powered Answers</CardTitle>
                <CardDescription>
                  Accurate responses with source citations using advanced retrieval technology
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Source-backed responses</li>
                  <li>• Contextual understanding</li>
                  <li>• Citation tracking</li>
                  <li>• Confidence scoring</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary" />
                <CardTitle>Team Management</CardTitle>
                <CardDescription>Workspace-level controls with channel permissions and user memory</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Workspace isolation</li>
                  <li>• Channel permissions</li>
                  <li>• User preferences</li>
                  <li>• Admin controls</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Bot className="h-10 w-10 text-primary" />
                <CardTitle>BYOSA Support</CardTitle>
                <CardDescription>
                  Bring Your Own Slack App for enterprise customers with custom requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Custom app manifests</li>
                  <li>• White-label deployment</li>
                  <li>• Enterprise controls</li>
                  <li>• Custom branding</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/50">
        <div className="container py-24 text-center">
          <div className="mx-auto max-w-2xl space-y-8">
            <h2 className="text-3xl font-bold tracking-tight">Ready to transform your team's knowledge?</h2>
            <p className="text-lg text-muted-foreground">
              Get started in minutes. Connect your Slack workspace and upload your first documents.
            </p>
            <Button size="lg" asChild className="text-lg">
              <Link href="/integrations/slack">Start Free Trial</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center space-x-2">
              <Bot className="h-6 w-6 text-primary" />
              <span className="font-semibold">Knowledge Copilot</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2025 Enterprise Knowledge Copilot. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
