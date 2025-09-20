import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/database/client"

export async function GET(request: NextRequest) {
  try {
    const userRole = request.headers.get("x-user-role")

    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const workspaces = await prisma.workspace.findMany({
      include: {
        _count: {
          select: {
            users: true,
            documents: true,
            channels: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ workspaces })
  } catch (error) {
    console.error("Workspaces fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch workspaces" }, { status: 500 })
  }
}
