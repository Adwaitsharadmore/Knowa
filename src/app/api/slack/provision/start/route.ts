// app/api/slack/provision/start/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get("tenantId") ?? "";
  const state = crypto.randomBytes(16).toString("hex");

  // Persist state→tenant mapping in your DB/kv to validate later
  // await kv.set(`slack:state:${state}`, { tenantId }, { ex: 600 });

  const params = new URLSearchParams({
    client_id: process.env.SLACK_CLIENT_ID!,
    // Request **user token** scopes for manifest control-plane:
    user_scope: "app_configurations:write,app_configurations:read",
    redirect_uri: process.env.SLACK_PROVISION_REDIRECT_URI!, // e.g. https://api.example.com/api/slack/provision/callback
    state, // CSRF + carry tenantId via kv
  });

  return NextResponse.redirect(`https://slack.com/oauth/v2/authorize?${params.toString()}`);
}
