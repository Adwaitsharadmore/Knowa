import { NextRequest, NextResponse } from "next/server";
import { getUserOrganizations } from "@/lib/org";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Use localhost for development, or environment variable for production
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (error) {
      console.error('Google OAuth error:', error);
      return NextResponse.redirect(`${baseUrl}/dashboard?tab=gdrive&error=oauth_error`);
    }

    if (!code || !state) {
      return NextResponse.redirect(`${baseUrl}/dashboard?tab=gdrive&error=missing_params`);
    }

    // Verify the state parameter matches our org_id
    const orgs = await getUserOrganizations();
    if (orgs.length === 0) {
      return NextResponse.redirect(`${baseUrl}/dashboard?tab=gdrive&error=no_org`);
    }

    const expectedOrgId = orgs[0].org_id;
    if (state !== expectedOrgId) {
      console.error('State mismatch:', state, 'expected:', expectedOrgId);
      return NextResponse.redirect(`${baseUrl}/dashboard?tab=gdrive&error=state_mismatch`);
    }

    // The connection should be automatically established by Supermemory
    // after the OAuth callback, so we just redirect back to dashboard
    console.log('Google OAuth callback successful for org:', expectedOrgId);
    
    return NextResponse.redirect(`${baseUrl}/dashboard?tab=gdrive&success=connected`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${baseUrl}/dashboard?tab=gdrive&error=callback_error`);
  }
}
