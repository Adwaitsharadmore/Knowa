import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Bot,
  FileText,
  MessageSquare,
  Shield,
  Zap,
  Users,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function HomePage() {
  // Redirect to dashboard if user is authenticated, otherwise show landing page
  // For now, we'll show the landing page and let users navigate to auth
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-primary" />
              <span className="text-xl font-semibold text-balance">
                Enterprise Knowledge Copilot
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost">Sign in</Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="outline">Sign up</Button>
              </Link>
              <Link href="/dashboard">
                <Button>
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="py-20 px-6">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-6">
            Slack-First RAG System
          </Badge>
          <h1 className="text-5xl font-bold mb-6 text-balance">
            Transform your company knowledge into
            <span className="text-primary"> intelligent answers</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
            Connect your Slack workspace, upload company documents, and get
            accurate AI-powered answers with citations directly in your
            channels.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8">
                Start Building <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/integrations">
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 bg-transparent"
              >
                View Integrations
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-card/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-balance">
              Everything you need for enterprise knowledge
            </h2>
            <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
              Built for Slack admins who want to provide instant, accurate
              answers to their teams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <MessageSquare className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Slack Integration</CardTitle>
                <CardDescription>
                  Seamless OAuth setup with your Slack workspace. No technical
                  setup required.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <FileText className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Document Management</CardTitle>
                <CardDescription>
                  Upload PDFs, docs, and text files. Automatic processing and
                  indexing for instant retrieval.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <Bot className="h-12 w-12 text-primary mb-4" />
                <CardTitle>AI-Powered Answers</CardTitle>
                <CardDescription>
                  Get accurate responses with source citations. Powered by
                  advanced RAG technology.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Enterprise Security</CardTitle>
                <CardDescription>
                  End-to-end encryption, audit logs, and compliance-ready
                  security features.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Team Management</CardTitle>
                <CardDescription>
                  Manage workspace access, user permissions, and channel
                  configurations.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Analytics & Insights</CardTitle>
                <CardDescription>
                  Track usage, popular queries, and knowledge gaps with detailed
                  analytics.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <Card className="max-w-2xl mx-auto border-primary/20 bg-primary/5">
            <CardHeader className="pb-8">
              <CardTitle className="text-3xl mb-4 text-balance">
                Ready to get started?
              </CardTitle>
              <CardDescription className="text-lg text-pretty">
                Connect your Slack workspace and start building your knowledge
                base in minutes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard">
                <Button size="lg" className="text-lg px-8">
                  Launch Dashboard <Zap className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
