import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Create demo workspace
  const demoWorkspace = await prisma.workspace.upsert({
    where: { slackTeamId: "T1234567890" },
    update: {},
    create: {
      slackTeamId: "T1234567890",
      teamName: "Demo Workspace",
      teamDomain: "demo-workspace",
      botUserId: "U1234567890",
      isActive: true,
      settings: {
        enableMemory: true,
        defaultContainerTags: ["general"],
        maxFileSize: 50 * 1024 * 1024, // 50MB
      },
    },
  })

  console.log("✅ Created demo workspace:", demoWorkspace.id)

  // Add sample channels
  const channels = [
    {
      channelId: "C1234567890",
      name: "general",
      isPrivate: false,
      isEnabled: true,
      containerTags: ["general", "public"],
    },
    {
      channelId: "C0987654321",
      name: "engineering",
      isPrivate: false,
      isEnabled: true,
      containerTags: ["engineering", "tech"],
    },
    {
      channelId: "G1111111111",
      name: "leadership",
      isPrivate: true,
      isEnabled: false,
      containerTags: ["leadership", "private"],
    },
  ]

  for (const channel of channels) {
    await prisma.channel.upsert({
      where: {
        workspaceId_channelId: {
          workspaceId: demoWorkspace.id,
          channelId: channel.channelId,
        },
      },
      update: {},
      create: {
        ...channel,
        workspaceId: demoWorkspace.id,
        lastActivity: new Date(),
      },
    })
  }

  console.log("✅ Created sample channels")

  // Insert test documents
  const documents = [
    {
      title: "Company Handbook",
      type: "PDF" as const,
      source: "handbook.pdf",
      containerTags: ["general", "hr"],
      status: "COMPLETED" as const,
      size: 2048000,
      mimeType: "application/pdf",
      uploadedBy: "U1234567890",
      metadata: {
        pages: 45,
        language: "en",
        extractedText: true,
      },
    },
    {
      title: "API Documentation",
      type: "URL" as const,
      source: "https://api.example.com/docs",
      containerTags: ["engineering", "docs"],
      status: "PROCESSING" as const,
      uploadedBy: "U0987654321",
      metadata: {
        lastCrawled: new Date().toISOString(),
        depth: 3,
      },
    },
    {
      title: "Meeting Notes - Q4 Planning",
      type: "TEXT" as const,
      containerTags: ["leadership", "planning"],
      status: "COMPLETED" as const,
      uploadedBy: "U1111111111",
      metadata: {
        wordCount: 1250,
        attendees: ["John Doe", "Jane Smith", "Bob Johnson"],
      },
    },
  ]

  for (const doc of documents) {
    await prisma.document.create({
      data: {
        ...doc,
        workspaceId: demoWorkspace.id,
      },
    })
  }

  console.log("✅ Created test documents")

  // Create sample user memories
  const memories = [
    {
      userId: "U1234567890",
      content: "Prefers detailed technical explanations",
      containerTags: ["user-preference"],
      metadata: { type: "preference", confidence: 0.9 },
    },
    {
      userId: "U0987654321",
      content: "Working on the new authentication system",
      containerTags: ["current-project"],
      metadata: { type: "context", project: "auth-v2" },
    },
  ]

  for (const memory of memories) {
    await prisma.userMemory.create({
      data: {
        ...memory,
        workspaceId: demoWorkspace.id,
      },
    })
  }

  console.log("✅ Created user memories")

  // Create audit log entries
  const auditLogs = [
    {
      userId: "U1234567890",
      action: "workspace.connected",
      target: demoWorkspace.id,
      details: { method: "oauth", scopes: ["bot", "channels:read"] },
      ipAddress: "192.168.1.1",
      userAgent: "Slack/1.0",
    },
    {
      userId: "U1234567890",
      action: "document.uploaded",
      target: "handbook.pdf",
      details: { size: 2048000, type: "PDF" },
      ipAddress: "192.168.1.1",
    },
    {
      action: "channel.enabled",
      target: "C1234567890",
      details: { channelName: "general", containerTags: ["general", "public"] },
    },
  ]

  for (const log of auditLogs) {
    await prisma.auditLog.create({
      data: {
        ...log,
        workspaceId: demoWorkspace.id,
      },
    })
  }

  console.log("✅ Created audit log entries")

  // Set up rate limit entries for testing
  await prisma.rateLimitEntry.create({
    data: {
      key: "slack:events:T1234567890",
      count: 5,
      resetAt: new Date(Date.now() + 3600000), // 1 hour from now
    },
  })

  console.log("✅ Created rate limit entries")

  console.log("🎉 Database seeded successfully!")
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
