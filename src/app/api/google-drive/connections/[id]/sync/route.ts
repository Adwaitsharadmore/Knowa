import { NextResponse } from "next/server";
import { getUserOrganizations } from "@/lib/org";
import { Supermemory } from "supermemory";

const client = new Supermemory({
  apiKey: process.env.SUPERMEMORY_API_KEY!,
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const orgs = await getUserOrganizations();
    if (orgs.length === 0) {
      return NextResponse.json({ success: false, message: "No organization found" }, { status: 400 });
    }

    const connectionId = params.id;
    const orgId = orgs[0].org_id;

    console.log(`Triggering manual sync for connection: ${connectionId}`);

    // Trigger manual sync using Supermemory API
    await client.connections.import('google-drive', {
      containerTags: [`org_id-${orgId}`, 'gdrive-sync']
    });

    return NextResponse.json({
      success: true,
      message: "Manual sync initiated successfully",
      connectionId: connectionId
    });
  } catch (error) {
    console.error("Google Drive sync error:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
