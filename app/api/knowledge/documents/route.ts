import { NextResponse } from "next/server"

export async function GET() {
  // Mock data - replace with actual database queries
  const documents = [
    {
      id: "1",
      name: "Employee Handbook 2024.pdf",
      size: "2.4 MB",
      uploadedAt: "2024-01-15T10:30:00Z",
      status: "processed",
      type: "pdf",
    },
    {
      id: "2",
      name: "API Documentation.md",
      size: "856 KB",
      uploadedAt: "2024-01-14T15:45:00Z",
      status: "processing",
      type: "markdown",
    },
  ]

  return NextResponse.json(documents)
}

export async function POST() {
  // Mock upload response - replace with actual file processing
  return NextResponse.json({
    success: true,
    message: "Document uploaded successfully",
    documentId: "doc_" + Date.now(),
  })
}
