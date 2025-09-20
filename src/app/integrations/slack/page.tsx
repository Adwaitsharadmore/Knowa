import { SlackConnectButton } from "@/components/slack/ConnectButton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, MessageSquare, Shield, Zap } from "lucide-react"

export default function SlackIntegrationPage() {
  return (
    <div className="container max-w-4xl py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Connect Your Slack Workspace</h1>
          <p className="text-lg text-muted-foreground">
            Add the Knowledge Copilot bot to your Slack workspace and start getting intelligent answers from your
            company's knowledge base.
          </p>
        </div>

        {/* Connection Card */}
        <Card className="border-2">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slack/10">
              <MessageSquare className="h-8 w-8 text-slack" />
            </div>
            <CardTitle className="text-xl">Slack Integration</CardTitle>
            <CardDescription>Connect your Slack workspace to enable the Knowledge Copilot bot</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <SlackConnectButton />
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>
                By connecting, you authorize Knowledge Copilot to access your Slack workspace.
                <br />
                We only request the minimum permissions needed to function.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg">Smart Responses</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Get accurate answers with source citations from your knowledge base. The bot understands context and
                provides relevant information.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Secure & Private</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                All data is encrypted and workspace-isolated. Your information stays within your organization's
                boundaries.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                <CardTitle className="text-lg">Memory & Context</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                The bot remembers your preferences and conversation context across days, providing personalized
                assistance.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-lg">Multiple Channels</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Works in public channels, private channels, and direct messages. Configure which channels have access to
                specific knowledge.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Permissions Info */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">Required Permissions</CardTitle>
            <CardDescription>Knowledge Copilot requests these permissions to function properly:</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  app_mentions:read
                </Badge>
                <span className="text-sm text-muted-foreground">Respond when mentioned</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  chat:write
                </Badge>
                <span className="text-sm text-muted-foreground">Send messages and replies</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  channels:read
                </Badge>
                <span className="text-sm text-muted-foreground">Access public channels</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  im:read
                </Badge>
                <span className="text-sm text-muted-foreground">Read direct messages</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  users:read
                </Badge>
                <span className="text-sm text-muted-foreground">Get user information</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  groups:read
                </Badge>
                <span className="text-sm text-muted-foreground">Access private channels</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">What happens next?</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  1
                </span>
                <span>Click "Add to Slack" and authorize the app</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  2
                </span>
                <span>Choose which channels the bot can access</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  3
                </span>
                <span>Upload your knowledge documents</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  4
                </span>
                <span>Start asking questions and get intelligent answers!</span>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
