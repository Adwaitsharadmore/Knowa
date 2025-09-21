// app/api/slack/provision/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { WebClient } from "@slack/web-api";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // server only
);

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const orgId = url.searchParams.get("orgId"); // pass this from your /start, or resolve by the logged-in user

  if (!code || !orgId) {
    return NextResponse.redirect("/integrations/slack?error=missing_params");
  }

  // 1) Exchange code for tokens (this returns a USER token in authed_user.access_token)
  const web = new WebClient();
  const oauth = await web.oauth.v2.access({
    client_id: process.env.SLACK_CLIENT_ID!,
    client_secret: process.env.SLACK_CLIENT_SECRET!,
    code,
    redirect_uri: process.env.SLACK_PROVISION_REDIRECT_URI!,
  });

  const userToken = oauth.authed_user?.access_token; // xoxp-…
  const installerUserId = oauth.authed_user?.id ?? null;
  const teamId = oauth.team?.id ?? null;
  const enterpriseId = (oauth.enterprise as any)?.id ?? null;

  if (!userToken || !teamId) {
    return NextResponse.redirect("/integrations/slack?error=missing_token_or_team");
  }

  // 2) Optional: team metadata for UI
  let teamName: string | null = null;
  let teamDomain: string | null = null;
  try {
    const uweb = new WebClient(userToken);
    const t = (await uweb.team.info()) as any;
    teamName = t?.team?.name ?? null;
    teamDomain = t?.team?.domain ?? null;
  } catch {}

  // 3) Insert/Upsert encrypted grant
  //    We set a per-session GUC `app.enc_key` so SQL can call pgp_sym_encrypt()
  const encKey = process.env.ENC_KEY!;
  const sql = `
    select set_config('app.enc_key', $1, true);

    insert into public.provisioning_grants
      (org_id, team_id, enterprise_id, installer_user_id, team_domain, team_name, encrypted_user_token, updated_at)
    values
      ($2, $3, $4, $5, $6, $7, pgp_sym_encrypt($8, current_setting('app.enc_key')), now())
    on conflict (team_id) do update set
      org_id = excluded.org_id,
      enterprise_id = excluded.enterprise_id,
      installer_user_id = excluded.installer_user_id,
      team_domain = excluded.team_domain,
      team_name = excluded.team_name,
      encrypted_user_token = excluded.encrypted_user_token,
      updated_at = now();
  `;

  const { error } = await supabase.rpc("exec_sql", {
    sql,
    params: [encKey, orgId, teamId, enterpriseId, installerUserId, teamDomain, teamName, userToken]
  });

  // If you don’t have a generic exec_sql RPC, do this instead with PostgREST:
  // await supabase.from('provisioning_grants').upsert({
  //   org_id: orgId,
  //   team_id: teamId,
  //   enterprise_id: enterpriseId,
  //   installer_user_id: installerUserId,
  //   team_domain: teamDomain,
  //   team_name: teamName,
  //   // do client-side encryption to bytea buffer here if you prefer
  // });

  if (error) {
    console.error(error);
    return NextResponse.redirect("/integrations/slack?error=db_write_failed");
  }

  return NextResponse.redirect(`/integrations/slack?connected=1&team=${teamId}`);
}
