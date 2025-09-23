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
import { supabaseServer } from "@/lib/supabase-server";

export default async function HomePage() {
  // Check if user is authenticated
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
            <div className="relative w-8 h-8">
            <img
              src="/knowa-logo.svg"
              alt="Knowa Logo"
              className="w-full h-full object-contain"
            />
          </div>
              <span className="text-xl font-semibold text-balance">
              Knowa
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm text-muted-foreground">
                    Welcome, {user.email}
                  </span>
                  <Link href="/dashboard">
                    <Button>Dashboard </Button>
                  </Link>
                  <form action="/api/auth/logout" method="post">
                    <Button variant="ghost" type="submit">
                      Sign out
                    </Button>
                  </form>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <section className="py-20 px-6">
        <div className="container mx-auto text-center max-w-5xl text-7xl">
          {user ? (
            <>
              <Badge variant="secondary" className="mb-6">
                Welcome back!
              </Badge>
              <h1 className="font-bold mb-6 text-balance">
                Ready to continue building your
                <span className="text-primary"> knowledge base?</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
                Access your dashboard to manage documents, view analytics, and
                configure your Slack integration.
              </p>
              <div className="flex items-center justify-center space-x-4">
                <Link href="/dashboard">
                  <Button size="lg" className="text-lg px-8">
                    Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/integrations">
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-lg px-8 bg-transparent"
                  >
                    Manage Integrations
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <>
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
                <Link href="/auth/signup">
                  <Button size="lg" className="text-lg px-8">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
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
            </>
          )}
        </div>
      </section>

      <section className="py-20 px-6 bg-card/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-balance">
              Your company's knowledge, anytime you work
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
                <CardTitle>We got Supermemory</CardTitle>
                <CardDescription>
                  Fast, accurate, and secure.
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

      {!user && (
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
                <Link href="/auth/signup">
                  <Button size="lg" className="text-lg px-8">
                    Sign Up Now <Zap className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      )}
    </div>
  );
}
