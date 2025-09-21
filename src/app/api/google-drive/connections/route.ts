import { NextResponse } from "next/server";
import { getUserOrganizations } from "@/lib/org";
import { Supermemory } from "supermemory";

const client = new Supermemory({
  apiKey: process.env.SUPERMEMORY_API_KEY!,
});

export async function GET() {
  try {
    const orgs = await getUserOrganizations();
    if (orgs.length === 0) {
      return NextResponse.json({ success: false, message: "No organization found" }, { status: 400 });
    }

    const orgId = orgs[0].org_id;

    // List Google Drive connections for this organization
    const connections = await client.connections.list({
      containerTags: [`org_id-${orgId}`, 'gdrive-sync']
    });

    // Filter for Google Drive connections and format response
    const gdriveConnections = connections
      .filter(conn => conn.provider === 'google-drive')
      .map(conn => ({
        id: conn.id,
        provider: conn.provider,
        email: conn.email || 'Unknown',
        createdAt: conn.createdAt,
        documentLimit: conn.documentLimit || 3000,
        status: 'active' // Supermemory doesn't provide status, assume active if listed
      }));

    return NextResponse.json({
      success: true,
      connections: gdriveConnections
    });
  } catch (error) {
    console.error("Google Drive connections error:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
