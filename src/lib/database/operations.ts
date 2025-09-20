import { prisma } from "./client"
import type { Workspace } from "@prisma/client"

// Workspace operations
export async function createWorkspace(data: {
  slackTeamId: string
  teamName: string
  teamDomain?: string
  botUserId?: string
  botAccessToken?: string
  userAccessToken?: string
  appId?: string
  settings?: any
}) {
  return await prisma.workspace.create({
    data: {
      ...data,
      settings: data.settings || {},
    },
  })
}

export async function getWorkspaceBySlackTeamId(slackTeamId: string) {
  return await prisma.workspace.findUnique({
    where: { slackTeamId },
    include: {
      channels: true,
      documents: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      _count: {
        select: {
          channels: true,
          documents: true,
          memories: true,
        },
      },
    },
  })
}

export async function updateWorkspace(id: string, data: Partial<Workspace>) {
  return await prisma.workspace.update({
    where: { id },
    data,
  })
}

// Channel operations
export async function enableChannels(
  workspaceId: string,
  channels: Array<{
    channelId: string
    name: string
    isPrivate: boolean
    containerTags: string[]
  }>,
) {
  const operations = channels.map((channel) =>
    prisma.channel.upsert({
      where: {
        workspaceId_channelId: {
          workspaceId,
          channelId: channel.channelId,
        },
      },
      update: {
        isEnabled: true,
        containerTags: channel.containerTags,
        lastActivity: new Date(),
      },
      create: {
        workspaceId,
        channelId: channel.channelId,
        name: channel.name,
        isPrivate: channel.isPrivate,
        isEnabled: true,
        containerTags: channel.containerTags,
        lastActivity: new Date(),
      },
    }),
  )

  return await Promise.all(operations)
}

export async function getEnabledChannels(workspaceId: string) {
  return await prisma.channel.findMany({
    where: {
      workspaceId,
      isEnabled: true,
    },
    orderBy: { name: "asc" },
  })
}

// Document operations
export async function createDocument(data: {
  workspaceId: string
  title: string
  type: string
  source?: string
  containerTags: string[]
  metadata?: any
  size?: number
  mimeType?: string
  uploadedBy?: string
  supermemoryId?: string
}) {
  return await prisma.document.create({
    data: {
      ...data,
      type: data.type as any,
      metadata: data.metadata || {},
    },
  })
}

export async function updateDocumentStatus(
  id: string,
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED",
  error?: string,
  supermemoryId?: string,
) {
  return await prisma.document.update({
    where: { id },
    data: {
      status,
      error,
      supermemoryId,
      updatedAt: new Date(),
    },
  })
}

export async function getDocuments(
  workspaceId: string,
  options: {
    containerTags?: string[]
    status?: string
    limit?: number
    offset?: number
  } = {},
) {
  const where: any = { workspaceId }

  if (options.containerTags?.length) {
    where.containerTags = {
      hasSome: options.containerTags,
    }
  }

  if (options.status) {
    where.status = options.status
  }

  return await prisma.document.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: options.limit || 50,
    skip: options.offset || 0,
  })
}

// User memory operations
export async function saveUserMemory(data: {
  workspaceId: string
  userId: string
  content: string
  containerTags: string[]
  metadata?: any
}) {
  return await prisma.userMemory.upsert({
    where: {
      workspaceId_userId_content: {
        workspaceId: data.workspaceId,
        userId: data.userId,
        content: data.content,
      },
    },
    update: {
      containerTags: data.containerTags,
      metadata: data.metadata || {},
      updatedAt: new Date(),
    },
    create: {
      ...data,
      metadata: data.metadata || {},
    },
  })
}

export async function getUserMemories(workspaceId: string, userId: string) {
  return await prisma.userMemory.findMany({
    where: {
      workspaceId,
      userId,
    },
    orderBy: { updatedAt: "desc" },
  })
}

// Audit log operations
export async function createAuditLog(data: {
  workspaceId: string
  userId?: string
  action: string
  target?: string
  details?: any
  ipAddress?: string
  userAgent?: string
}) {
  return await prisma.auditLog.create({
    data: {
      ...data,
      details: data.details || {},
    },
  })
}

export async function getAuditLogs(
  workspaceId: string,
  options: {
    userId?: string
    action?: string
    limit?: number
    offset?: number
  } = {},
) {
  const where: any = { workspaceId }

  if (options.userId) {
    where.userId = options.userId
  }

  if (options.action) {
    where.action = options.action
  }

  return await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: options.limit || 100,
    skip: options.offset || 0,
  })
}

// Rate limiting operations
export async function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = new Date()
  const resetAt = new Date(now.getTime() + windowMs)

  const entry = await prisma.rateLimitEntry.upsert({
    where: { key },
    update: {
      count: {
        increment: 1,
      },
    },
    create: {
      key,
      count: 1,
      resetAt,
    },
  })

  // Reset if window has expired
  if (entry.resetAt < now) {
    await prisma.rateLimitEntry.update({
      where: { key },
      data: {
        count: 1,
        resetAt,
      },
    })
    return { allowed: true, remaining: limit - 1, resetAt }
  }

  const allowed = entry.count <= limit
  const remaining = Math.max(0, limit - entry.count)

  return { allowed, remaining, resetAt: entry.resetAt }
}

// Cleanup operations
export async function cleanupExpiredRateLimits() {
  const now = new Date()
  const result = await prisma.rateLimitEntry.deleteMany({
    where: {
      resetAt: {
        lt: now,
      },
    },
  })
  return result.count
}

export async function cleanupOldAuditLogs(daysToKeep = 90) {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

  const result = await prisma.auditLog.deleteMany({
    where: {
      createdAt: {
        lt: cutoffDate,
      },
    },
  })
  return result.count
}
