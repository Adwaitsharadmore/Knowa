import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/database/client"

export async function GET(request: NextRequest) {
  try {
    const userRole = request.headers.get("x-user-role")

    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const [totalWorkspaces, totalDocuments, totalQueries, recentActivity] = await Promise.all([
      prisma.workspace.count(),
      prisma.document.count(),
      prisma.userMemory.count(),
      prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { email: true },
          },
        },
      }),
    ])

    // Get query stats for the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const queryStats = await prisma.userMemory.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      _count: true,
    })

    return NextResponse.json({
      overview: {
        totalWorkspaces,
        totalDocuments,
        totalQueries,
        activeWorkspaces: await prisma.workspace.count({
          where: {
            updatedAt: {
              gte: thirtyDaysAgo,
            },
          },
        }),
      },
      queryStats,
      recentActivity,
    })
  } catch (error) {
    console.error("Analytics fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
