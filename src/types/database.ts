import type { Workspace, Channel, Document, UserMemory, AuditLog } from "@prisma/client"

// Extended types with relations
export type WorkspaceWithRelations = Workspace & {
  channels: Channel[]
  documents: Document[]
  memories: UserMemory[]
  auditLogs: AuditLog[]
  _count?: {
    channels: number
    documents: number
    memories: number
  }
}

export type ChannelWithWorkspace = Channel & {
  workspace: Workspace
}

export type DocumentWithWorkspace = Document & {
  workspace: Workspace
}

export type UserMemoryWithWorkspace = UserMemory & {
  workspace: Workspace
}

export type AuditLogWithWorkspace = AuditLog & {
  workspace: Workspace
}

// API response types
export interface DatabaseHealth {
  healthy: boolean
  message: string
  timestamp: Date
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: Date
}

// Database operation options
export interface QueryOptions {
  limit?: number
  offset?: number
  orderBy?: string
  orderDirection?: "asc" | "desc"
}

export interface DocumentQueryOptions extends QueryOptions {
  containerTags?: string[]
  status?: string
  type?: string
  uploadedBy?: string
}

export interface AuditLogQueryOptions extends QueryOptions {
  userId?: string
  action?: string
  target?: string
  startDate?: Date
  endDate?: Date
}

// Workspace settings schema
export interface WorkspaceSettings {
  enableMemory?: boolean
  defaultContainerTags?: string[]
  maxFileSize?: number
  allowedFileTypes?: string[]
  rateLimits?: {
    messagesPerHour?: number
    uploadsPerDay?: number
  }
  notifications?: {
    enableProcessingUpdates?: boolean
    enableErrorAlerts?: boolean
  }
}

// Channel settings schema
export interface ChannelSettings {
  autoRespond?: boolean
  responseDelay?: number
  maxResponseLength?: number
  includeSourceLinks?: boolean
  confidenceThreshold?: number
}

// Document metadata schemas
export interface PDFMetadata {
  pages?: number
  language?: string
  extractedText?: boolean
  hasImages?: boolean
}

export interface URLMetadata {
  lastCrawled?: string
  depth?: number
  statusCode?: number
  contentType?: string
  title?: string
  description?: string
}

export interface TextMetadata {
  wordCount?: number
  language?: string
  sentiment?: number
  topics?: string[]
}

export interface FileMetadata {
  originalName?: string
  encoding?: string
  checksum?: string
  uploadedAt?: string
}

// User memory metadata
export interface UserMemoryMetadata {
  type?: "preference" | "context" | "fact" | "skill"
  confidence?: number
  source?: string
  expiresAt?: string
  tags?: string[]
}

// Audit log details schemas
export interface WorkspaceAuditDetails {
  method?: string
  scopes?: string[]
  previousSettings?: any
  newSettings?: any
}

export interface DocumentAuditDetails {
  size?: number
  type?: string
  containerTags?: string[]
  processingTime?: number
  error?: string
}

export interface ChannelAuditDetails {
  channelName?: string
  isPrivate?: boolean
  containerTags?: string[]
  previousState?: any
}
