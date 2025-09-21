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

    // Get current settings
    const settings = await client.settings.get();

    return NextResponse.json({
      success: true,
      settings: {
        googleDriveCustomKeyEnabled: settings.googleDriveCustomKeyEnabled || false,
        googleDriveClientId: settings.googleDriveClientId || null,
        shouldLLMFilter: settings.shouldLLMFilter || false,
        filterPrompt: settings.filterPrompt || null,
        includeItems: settings.includeItems || {},
        excludeItems: settings.excludeItems || {}
      }
    });
  } catch (error) {
    console.error("Google Drive settings error:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const orgs = await getUserOrganizations();
    if (orgs.length === 0) {
      return NextResponse.json({ success: false, message: "No organization found" }, { status: 400 });
    }

    const body = await request.json();
    const {
      googleDriveCustomKeyEnabled,
      googleDriveClientId,
      googleDriveClientSecret,
      shouldLLMFilter,
      filterPrompt,
      includeItems,
      excludeItems
    } = body;

    // Update settings using Supermemory API
    const updatedSettings = await client.settings.update({
      googleDriveCustomKeyEnabled,
      googleDriveClientId,
      googleDriveClientSecret,
      shouldLLMFilter,
      filterPrompt,
      includeItems,
      excludeItems
    });

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
      settings: updatedSettings
    });
  } catch (error) {
    console.error("Google Drive settings update error:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
