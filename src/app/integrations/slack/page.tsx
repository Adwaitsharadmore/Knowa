// app/integrations/slack/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { SlackConnectButton } from "@/components/slack/ConnectButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, MessageSquare, Shield, Zap } from "lucide-react";
import { useRouter } from "next/navigation"; 

type Org = { id: string; name: string };

export default function SlackIntegrationPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [orgId, setOrgId] = useState<string>("");
const router = useRouter();
  // mode: "oauth" | "byo"
  const [mode, setMode] = useState<"oauth" | "byo">("oauth");

  // BYO fields
  const [botToken, setBotToken] = useState("");
  const [signingSecret, setSigningSecret] = useState("");
  const [appToken, setAppToken] = useState(""); // optional (Socket Mode)
  const [teamId, setTeamId] = useState(""); // optional but helpful

  const [submitStatus, setSubmitStatus] = useState<null | {
    ok: boolean;
    msg: string;
  }>(null);
  const disabled =
    loading || !orgId || (mode === "byo" && (!botToken || !signingSecret));

  useEffect(() => {
    (async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserEmail(user?.email ?? null);

      // fetch orgs for the signed-in user
      const { data, error } = await supabase
        .from("org_members")
        .select("org_id, organizations!inner(id, name)")
        .eq("user_id", user?.id ?? "")
        .order("created_at", { ascending: true });

      if (!error && data) {
        const mapped = data.map((r: any) => ({
          id: r.organizations.id,
          name: r.organizations.name,
        })) as Org[];
        setOrgs(mapped);
        if (mapped.length > 0) setOrgId(mapped[0].id);
      }
      setLoading(false);
    })();
  }, []);

  async function submitBYO() {
    setSubmitStatus(null);
    try {
      const res = await fetch("/api/slack/byo/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          botToken,
          signingSecret,
          appToken: appToken || null,
          teamId: teamId || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setSubmitStatus({
          ok: false,
          msg: json?.error ?? "Failed to connect Slack (BYO)",
        });
      } else {
        setSubmitStatus({ ok: true, msg: "Slack app connected successfully!" });
        setBotToken("");
        setSigningSecret("");
        setAppToken("");
        setTeamId("");
        router.push(`/integrations/slack/next-steps?orgId=${orgId}`);
      }
    } catch (e: any) {
      setSubmitStatus({ ok: false, msg: e?.message ?? "Network error" });
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">
            Connect Your Slack Workspace
          </h1>
          <p className="text-lg text-muted-foreground">
            Add the Knowledge Copilot bot to your Slack workspace and start
            getting intelligent answers from your company's knowledge base.
          </p>
        </div>

        {/* Connect Form */}
        <Card className="border-2">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slack/10">
              <MessageSquare className="h-8 w-8 text-slack" />
            </div>
            <CardTitle className="text-xl">Slack Integration</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Signed-in user */}
            <div className="text-center text-sm text-muted-foreground">
              {loading ? (
                "Loading your account…"
              ) : userEmail ? (
                <>
                  Signed in as <span className="font-medium">{userEmail}</span>
                </>
              ) : (
                "Not signed in"
              )}
            </div>

            {/* Mode toggle */}
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setMode("byo")}
                className={`rounded-md border px-3 py-1.5 text-sm ${
                  mode === "byo"
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-muted-foreground/30"
                }`}
              >
                Connect Your Own Slack App
              </button>
            </div>

            {/* OAuth mode */}
            {mode === "oauth" && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  We’ll request minimal user scopes to provision your tenant app
                  via Slack’s App Manifest API.
                </p>
                <div className="flex justify-center">
                  {/* Pass orgId so backend associates the install */}
                  <SlackConnectButton orgId={orgId} />
                </div>
              </div>
            )}

            {/* BYO mode */}
            {mode === "byo" && (
              <div className="mx-auto max-w-xl space-y-4">
                <div>
                  <label className="text-sm font-medium">
                    Bot Token <span className="text-red-600">*</span>
                  </label>
                  <input
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="xoxb-***"
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    From Slack → Your App → OAuth & Permissions.
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Signing Secret <span className="text-red-600">*</span>
                  </label>
                  <input
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="********"
                    value={signingSecret}
                    onChange={(e) => setSigningSecret(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    From Slack → Your App → Basic Information.
                  </p>
                </div>

                <div className="flex justify-center">
                  <Button size="lg" onClick={submitBYO} disabled={disabled}>
                    Connect with Provided Credentials
                  </Button>
                </div>

                {submitStatus && (
                  <p
                    className={`text-center text-sm ${
                      submitStatus.ok ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {submitStatus.msg}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        {/* Permissions Info (unchanged) */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">Required Permissions</CardTitle>
            <CardDescription>
              Knowledge Copilot requests these permissions to function properly:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  app_mentions:read
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Respond when mentioned
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  chat:write
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Send messages and replies
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  channels:read
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Access public channels
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  im:read
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Read direct messages
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  users:read
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Get user information
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  groups:read
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Access private channels
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Features Grid (unchanged) */}
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
                Get accurate answers with source citations from your knowledge
                base. The bot understands context and provides relevant
                information.
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
                All data is encrypted and workspace-isolated. Your information
                stays within your organization's boundaries.
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
                The bot remembers your preferences and conversation context
                across days, providing personalized assistance.
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
                Works in public channels, private channels, and direct messages.
                Configure which channels have access to specific knowledge.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Next Steps (unchanged) */}
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
  );
}
