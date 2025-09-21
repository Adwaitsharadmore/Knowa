import { NextResponse } from "next/server";
import { getUserOrganizations } from "@/lib/org";

export async function GET() {
  try {
    const orgs = await getUserOrganizations();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    return NextResponse.json({
      success: true,
      debug: {
        orgId: orgs.length > 0 ? orgs[0].org_id : 'No organization found',
        baseUrl: baseUrl,
        callbackUrl: `${baseUrl}/api/google-drive/callback`,
        environment: process.env.NODE_ENV,
        hasSupermemoryKey: !!process.env.SUPERMEMORY_API_KEY
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
