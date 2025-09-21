import { NextResponse } from "next/server";
import { getUserOrganizations } from "@/lib/org";
import { Supermemory } from "supermemory";

const client = new Supermemory({
  apiKey: process.env.SUPERMEMORY_API_KEY!,
});

export async function POST() {
  try {
    const orgs = await getUserOrganizations();
    if (orgs.length === 0) {
      return NextResponse.json({ success: false, message: "No organization found" }, { status: 400 });
    }

    const orgId = orgs[0].org_id;
    
    // Use localhost for development, or environment variable for production
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUrl = `${baseUrl}/api/google-drive/callback`;

    console.log('Creating Google Drive connection with redirect URL:', redirectUrl);

    // Create Google Drive connection using Supermemory API
    const connection = await client.connections.create('google-drive', {
      redirectUrl: redirectUrl,
      containerTags: [`org_id-${orgId}`, 'gdrive-sync'],
      documentLimit: 3000,
      metadata: {
        source: 'google-drive',
        org_id: orgId,
        department: 'knowledge-base'
      }
    });

    console.log('Google Drive connection created:', connection.id);
    console.log('Auth link:', connection.authLink);
    console.log('Expires in:', connection.expiresIn);

    return NextResponse.json({
      success: true,
      message: "Google Drive connection created",
      authLink: connection.authLink,
      connectionId: connection.id,
      expiresIn: connection.expiresIn
    });
  } catch (error) {
    console.error("Google Drive connect error:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
