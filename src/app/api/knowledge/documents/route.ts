import { NextResponse } from "next/server";
import { getUserOrganizations } from "@/lib/org";
import { Supermemory } from "supermemory";

const client = new Supermemory({
  apiKey: process.env.SUPERMEMORY_API_KEY!,
});

// GET method to fetch documents
export async function GET() {
  try {
    const smResult = await client.documents.list();

    const documents = smResult.memories?.map((doc) => ({
      id: doc.id,
      name: doc.title,
      uploadedAt: new Date(doc.createdAt).toLocaleDateString(),
    })) || [];

    return NextResponse.json(documents);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Helper function to get file type from filename
function getFileType(filename: string): string {
  const extension = filename.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "pdf": return "PDF";
    case "doc":
    case "docx": return "Word";
    case "txt": return "Text";
    case "md": return "Markdown";
    default: return "Document";
  }
}

export async function POST(request: Request) {
  try {
    const orgId = await getUserOrganizations();

    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ success: false, message: "Missing file" }, { status: 400 });

    const metadata = JSON.parse(formData.get("metadata") as string);

    const sm = await client.documents.uploadFile({
      file,
      containerTags: `org_id-${orgId[0].org_id}`,
      // metadata: metadata,
    });

    return NextResponse.json({ success: true, result: sm });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message ?? "Unknown error" }, { status: 500 });
  }
}
