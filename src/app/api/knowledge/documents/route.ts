import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/database/client"

export async function GET(request: NextRequest) {
  try {
    const workspaceId = request.headers.get("x-workspace-id")
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search")

    if (!workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const where = {
      workspaceId,
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { filename: { contains: search, mode: "insensitive" } },
        ],
      }),
    }

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        include: {
          uploadedBy: {
            select: { id: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.document.count({ where }),
    ])

    return NextResponse.json({
      documents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Documents fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 })
  }
}
