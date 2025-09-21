// app/integrations/slack/next-steps/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Copy,
  Link as LinkIcon,
  MessageSquare,
  Shield,
  Zap,
} from "lucide-react";
import header from "@/components/layout/header";

const WEBHOOK_URL = "https://daa4fbe52398.ngrok-free.app/api/slack/events";

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  }
  return (
      <div className="space-y-1">
          
      <label className="text-sm font-medium">{label}</label>
      <div className="flex items-center gap-2">
        <input
          readOnly
          className="w-full rounded-md border px-3 py-2 text-sm"
          value={value}
        />
        <Button
          type="button"
          variant="secondary"
          onClick={onCopy}
          className="gap-2"
        >
          <Copy className="h-4 w-4" />
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
    </div>
  );
}

export default function SlackNextStepsPage() {
  const params = useSearchParams();
  const orgId = params.get("orgId") || "";

  return (
    <div className="container max-w-full py-8">
      <header />
      <div className="space-y-8">
        {/* Header */}
        <div className="text-start space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Finish Slack Setup
          </h1>
          <p className="text-lg text-muted-foreground">
            Almost done! Follow these steps to complete the integration for your
            workspace.
          </p>
        </div>

        {/* Webhook URL */}
        <Card className="border-2">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slack/10">
              <LinkIcon className="h-8 w-8 text-slack" />
            </div>
            <CardTitle className="text-xl">Event Subscription URL</CardTitle>
            <CardDescription>
              Paste this URL in your Slack app settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <CopyField label="Request URL" value={WEBHOOK_URL} />
            <p className="text-sm text-muted-foreground">
              In Slack:{" "}
              <span className="font-medium">
                Your App → Event Subscriptions
              </span>{" "}
              → Turn ON → paste the URL above into{" "}
              <span className="font-medium">Request URL</span>. Slack will
              verify it automatically.
            </p>
          </CardContent>
        </Card>

        {/* Scopes / Permissions */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">Required Permissions</CardTitle>
            <CardDescription>
              Grant these scopes so the bot can read mentions and reply.
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

        {/* Checklist */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Checklist</CardTitle>
            <CardDescription>
              Follow these steps in your Slack app settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  1
                </span>
                Go to{" "}
                <span className="font-medium">OAuth &amp; Permissions</span> and
                add the scopes above, then{" "}
                <span className="font-medium">Reinstall App</span>.
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  2
                </span>
                Open <span className="font-medium">Event Subscriptions</span>,
                turn ON, and paste the{" "}
                <span className="font-medium">Request URL</span> shown above.
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  3
                </span>
                Under{" "}
                <span className="font-medium">Subscribe to bot events</span>,
                add <code className="bg-black/5 px-1 rounded">app_mention</code>
                . Save.
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  4
                </span>
                Invite the bot to a channel and mention it:{" "}
                <code className="bg-black/5 px-1 rounded">@YourBot hello</code>.
              </li>
            </ol>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                onClick={() =>
                  window.open("https://api.slack.com/apps", "_blank")
                }
                className="gap-2"
              >
                <Shield className="h-4 w-4" />
                Open Slack App Dashboard
              </Button>
              <Button
                variant="secondary"
                onClick={() => window.open("slack://open", "_self")}
                className="gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Open Slack
              </Button>
            </div>
            {orgId && (
              <p className="mt-4 text-xs text-muted-foreground">
                Connected to organization:{" "}
                <span className="font-medium">{orgId}</span>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Tips */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg">Test Quickly</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                After saving, mention the bot in any channel. You should see a
                “Working…” reply followed by an answer.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                <CardTitle className="text-lg">Troubleshooting</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1 text-sm">
                <li>
                  Make sure Event Subscriptions is ON and the Request URL
                  verified.
                </li>
                <li>Ensure scopes saved + app reinstalled.</li>
                <li>Invite the bot to the channel you’re testing.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
