export interface SupermemoryConfig {
  apiUrl: string
  apiKey: string
  timeout?: number
}

export interface SupermemoryDocument {
  id: string
  title: string
  content: string
  source: string
  containerTags: string[]
  metadata: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface SupermemorySearchResult {
  id: string
  title: string
  content: string
  source: string
  score: number
  containerTags: string[]
  metadata: Record<string, any>
}

export interface SupermemorySearchResponse {
  results: SupermemorySearchResult[]
  total: number
  query: string
  processingTime: number
}

export interface SupermemoryUploadResponse {
  success: boolean
  documentId: string
  message: string
  processingStatus: "pending" | "processing" | "completed" | "failed"
}

export class SupermemoryClient {
  private config: SupermemoryConfig

  constructor(config: SupermemoryConfig) {
    this.config = {
      timeout: 30000,
      ...config,
    }
  }

  private async makeRequest<T = any>(
    endpoint: string,
    options: {
      method?: string
      body?: any
      headers?: Record<string, string>
      timeout?: number
    } = {},
  ): Promise<T> {
    const url = `${this.config.apiUrl}/${endpoint.replace(/^\//, "")}`
    const { method = "GET", body, headers = {}, timeout = this.config.timeout } = options

    const requestHeaders = {
      Authorization: `Bearer ${this.config.apiKey}`,
      "Content-Type": "application/json",
      ...headers,
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Supermemory API error: ${response.status} - ${errorText}`)
      }

      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Supermemory API request timeout")
      }
      throw error
    }
  }

  // Document upload methods
  async uploadFile(
    file: Buffer | Blob,
    options: {
      filename: string
      containerTags: string[]
      metadata?: Record<string, any>
      title?: string
    },
  ): Promise<SupermemoryUploadResponse> {
    const formData = new FormData()

    if (Buffer.isBuffer(file)) {
      formData.append("file", new Blob([file]), options.filename)
    } else {
      formData.append("file", file, options.filename)
    }

    formData.append("containerTags", JSON.stringify(options.containerTags))

    if (options.metadata) {
      formData.append("metadata", JSON.stringify(options.metadata))
    }

    if (options.title) {
      formData.append("title", options.title)
    }

    const response = await fetch(`${this.config.apiUrl}/documents/file`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`File upload failed: ${response.status} - ${errorText}`)
    }

    return await response.json()
  }

  async addText(options: {
    content: string
    title: string
    source?: string
    containerTags: string[]
    metadata?: Record<string, any>
  }): Promise<SupermemoryUploadResponse> {
    return this.makeRequest<SupermemoryUploadResponse>("documents/text", {
      method: "POST",
      body: {
        content: options.content,
        title: options.title,
        source: options.source || "manual_input",
        containerTags: options.containerTags,
        metadata: options.metadata || {},
      },
    })
  }

  async addUrl(options: {
    url: string
    containerTags: string[]
    metadata?: Record<string, any>
    crawlDepth?: number
  }): Promise<SupermemoryUploadResponse> {
    return this.makeRequest<SupermemoryUploadResponse>("documents/url", {
      method: "POST",
      body: {
        url: options.url,
        containerTags: options.containerTags,
        metadata: options.metadata || {},
        crawlDepth: options.crawlDepth || 1,
      },
    })
  }

  // Search methods
  async search(options: {
    query: string
    containerTags?: string[]
    limit?: number
    threshold?: number
    includeMetadata?: boolean
  }): Promise<SupermemorySearchResponse> {
    const params = new URLSearchParams({
      query: options.query,
      limit: (options.limit || 10).toString(),
      threshold: (options.threshold || 0.7).toString(),
      includeMetadata: (options.includeMetadata !== false).toString(),
    })

    if (options.containerTags?.length) {
      params.append("containerTags", options.containerTags.join(","))
    }

    return this.makeRequest<SupermemorySearchResponse>(`search?${params.toString()}`)
  }

  async semanticSearch(options: {
    query: string
    containerTags?: string[]
    limit?: number
    threshold?: number
  }): Promise<SupermemorySearchResponse> {
    return this.makeRequest<SupermemorySearchResponse>("search/semantic", {
      method: "POST",
      body: {
        query: options.query,
        containerTags: options.containerTags || [],
        limit: options.limit || 10,
        threshold: options.threshold || 0.7,
      },
    })
  }

  // Document management methods
  async getDocument(documentId: string): Promise<SupermemoryDocument> {
    return this.makeRequest<SupermemoryDocument>(`documents/${documentId}`)
  }

  async updateDocument(
    documentId: string,
    updates: {
      title?: string
      containerTags?: string[]
      metadata?: Record<string, any>
    },
  ): Promise<SupermemoryDocument> {
    return this.makeRequest<SupermemoryDocument>(`documents/${documentId}`, {
      method: "PATCH",
      body: updates,
    })
  }

  async deleteDocument(documentId: string): Promise<{ success: boolean; message: string }> {
    return this.makeRequest(`documents/${documentId}`, {
      method: "DELETE",
    })
  }

  async getDocuments(
    options: {
      containerTags?: string[]
      limit?: number
      offset?: number
      sortBy?: "createdAt" | "updatedAt" | "title"
      sortOrder?: "asc" | "desc"
    } = {},
  ): Promise<{
    documents: SupermemoryDocument[]
    total: number
    hasMore: boolean
  }> {
    const params = new URLSearchParams({
      limit: (options.limit || 50).toString(),
      offset: (options.offset || 0).toString(),
      sortBy: options.sortBy || "createdAt",
      sortOrder: options.sortOrder || "desc",
    })

    if (options.containerTags?.length) {
      params.append("containerTags", options.containerTags.join(","))
    }

    return this.makeRequest(`documents?${params.toString()}`)
  }

  // Processing status methods
  async getProcessingStatus(documentId: string): Promise<{
    status: "pending" | "processing" | "completed" | "failed"
    progress: number
    message?: string
    error?: string
  }> {
    return this.makeRequest(`documents/${documentId}/status`)
  }

  // Health check
  async healthCheck(): Promise<{
    status: "healthy" | "unhealthy"
    version: string
    uptime: number
  }> {
    return this.makeRequest("health")
  }
}

// Factory function
export function createSupermemoryClient(config?: Partial<SupermemoryConfig>): SupermemoryClient {
  const defaultConfig: SupermemoryConfig = {
    apiUrl: process.env.SUPERMEMORY_API_URL || "https://api.supermemory.ai",
    apiKey: process.env.SUPERMEMORY_API_KEY || "",
  }

  return new SupermemoryClient({ ...defaultConfig, ...config })
}

// Error handling helpers
export function isSupermemoryError(error: any): error is Error {
  return error instanceof Error && error.message.includes("Supermemory")
}

export function getSupermemoryErrorMessage(error: any): string {
  if (isSupermemoryError(error)) {
    return error.message
  }
  return "Unknown Supermemory error occurred"
}
