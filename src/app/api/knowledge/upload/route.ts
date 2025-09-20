import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/database/client"
import { uploadToSupermemory } from "@/lib/supermemory/client"
import { extractTextFromFile } from "@/lib/supermemory/formats"

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    const workspaceId = request.headers.get("x-workspace-id")

    if (!userId || !workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const title = formData.get("title") as string
    const description = formData.get("description") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Extract text content from file
    const content = await extractTextFromFile(file)

    // Upload to Supermemory
    const supermemoryId = await uploadToSupermemory({
      title: title || file.name,
      content,
      metadata: {
        filename: file.name,
        fileType: file.type,
        fileSize: file.size,
        uploadedBy: userId,
        workspaceId,
      },
    })

    // Save document record to database
    const document = await prisma.document.create({
      data: {
        title: title || file.name,
        filename: file.name,
        fileType: file.type,
        fileSize: file.size,
        content,
        supermemoryId,
        workspaceId,
        uploadedById: userId,
        status: "PROCESSED",
      },
    })

    return NextResponse.json({
      id: document.id,
      title: document.title,
      filename: document.filename,
      status: document.status,
      uploadedAt: document.createdAt,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Failed to upload document" }, { status: 500 })
  }
}
