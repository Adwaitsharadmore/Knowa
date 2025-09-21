import { NextResponse } from "next/server";
import { getUserOrganizations } from "@/lib/org";
import { Supermemory } from "supermemory";

const client = new Supermemory({
  apiKey: process.env.SUPERMEMORY_API_KEY!,
});

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const orgs = await getUserOrganizations();
    if (orgs.length === 0) {
      return NextResponse.json({ success: false, message: "No organization found" }, { status: 400 });
    }

    const connectionId = params.id;
    console.log(`Deleting Google Drive connection: ${connectionId}`);

    // Delete connection using Supermemory API
    const result = await client.connections.deleteByID(connectionId);

    return NextResponse.json({
      success: true,
      message: "Connection deleted successfully",
      connectionId: result.id
    });
  } catch (error) {
    console.error("Google Drive delete error:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
