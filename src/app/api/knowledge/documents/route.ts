import { NextResponse } from "next/server";
import { getUserDefaultOrgId } from "@/lib/org";

// GET method to fetch documents
export async function GET() {
  try {
    // Call Supermemory API to get documents
    const response = await fetch("https://api.supermemory.ai/v3/documents", {
      method: "GET",
      headers: { "Authorization": `Bearer ${process.env.SUPERMEMORY_API_KEY}` },
    });

    if (!response.ok) {
      return NextResponse.json({ success: false, message: "Supermemory API error" }, { status: 502 });
    }

    const smResult = await response.json();
    
    // Transform the data to match our Doc type
    const documents = smResult.documents?.map((doc: any) => ({
      id: doc.id,
      name: doc.name || doc.filename,
      size: formatFileSize(doc.size || 0),
      uploadedAt: new Date(doc.created_at || doc.uploaded_at).toLocaleDateString(),
      status: doc.status === 'processed' ? 'processed' : 'processing',
      type: doc.type || getFileType(doc.name || doc.filename),
    })) || [];

    return NextResponse.json(documents);
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Helper function to get file type from filename
function getFileType(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'pdf': return 'PDF';
    case 'doc':
    case 'docx': return 'Word';
    case 'txt': return 'Text';
    case 'md': return 'Markdown';
    default: return 'Document';
  }
}

export async function POST(request: Request) {
  try {
    const orgId = await getUserDefaultOrgId();

    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ success: false, message: "Missing file" }, { status: 400 });

    const smForm = new FormData();
    smForm.append("file", file, file.name);
    smForm.append("containerTags", JSON.stringify([`org-${orgId}`]));

    const resp = await fetch("https://api.supermemory.ai/v3/documents/file", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.SUPERMEMORY_API_KEY}` },
      body: smForm,
    });

    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json({ success: false, message: text || "Supermemory API error" }, { status: 502 });
    }

    const sm = await resp.json();
    return NextResponse.json({ success: true, result: sm });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message ?? "Unknown error" }, { status: 500 });
  }
}