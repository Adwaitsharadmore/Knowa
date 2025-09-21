import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { WebClient } from "@slack/web-api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orgId, botToken, signingSecret, appToken, teamId } = body || {};

    console.log("BYO connect request:", { orgId, botToken: botToken ? "***" : "missing", signingSecret: signingSecret ? "***" : "missing" });

    if (!orgId || !botToken || !signingSecret) {
      return NextResponse.json({ error: "orgId, botToken, and signingSecret are required" }, { status: 400 });
    }

    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Ensure the caller is a member of the org
    const { data: membership } = await supabase
      .from("org_members").select("org_id").eq("org_id", orgId).eq("user_id", user.id).single();
    if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Verify bot token by calling auth.test
  try {
    const slack = new WebClient(botToken);
    const test = await slack.auth.test();
    // prefer returned team info if not provided
    const resolvedTeamId = teamId || (test?.team_id as string) || null;
    const botUserId = test?.user_id as string;

    if (!resolvedTeamId) {
      return NextResponse.json({ error: "Could not determine team ID" }, { status: 400 });
    }

    // For now, just verify the token works - no database storage
    console.log("Slack token verified:", {
      teamId: resolvedTeamId,
      botUserId: botUserId,
      teamName: test?.team
    });


      const { data: existing } = await supabase
  .from("slack_team_org_links")
  .select("org_id")
  .eq("team_id", resolvedTeamId)
  .maybeSingle();

if (existing && existing.org_id !== orgId) {
  return NextResponse.json(
    { error: "This Slack workspace is already linked to another organization." },
    { status: 409 }
  );
}

const { error: linkErr } = await supabase.from("slack_team_org_links").upsert({
  team_id: resolvedTeamId,
  org_id: orgId,
  created_by: user.id,
  source: "byo",
});

if (linkErr) {
  return NextResponse.json({ error: "Failed to link workspace to organization" }, { status: 500 });
}

return NextResponse.json({
  ok: true,
  message: "Slack token verified & workspace linked",
  teamId: resolvedTeamId,
  botUserId,
  teamName: test?.team,
});
  } catch (e: any) {
    console.error("BYO connect error:", e);
    return NextResponse.json({ error: `Verification failed: ${e?.data?.error || e?.message || "unknown"}` }, { status: 400 });
  }
  } catch (error: any) {
    console.error("BYO connect general error:", error);
    return NextResponse.json({ error: `Internal server error: ${error?.message || "unknown"}` }, { status: 500 });
  }
}
