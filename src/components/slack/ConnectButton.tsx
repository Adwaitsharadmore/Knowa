// components/slack/ConnectButton.tsx
"use client";
import { Button } from "@/components/ui/button";

export function SlackConnectButton({
  orgId,
  disabled,
}: {
  orgId?: string;
  disabled?: boolean;
}) {
  const start = () => {
    const params = new URLSearchParams();
    if (orgId) params.set("orgId", orgId);
    window.location.href = `/api/slack/provision/start?${params.toString()}`;
  };

  return (
    <Button size="lg" onClick={start} disabled={disabled}>
      Add to Slack
    </Button>
  );
}
