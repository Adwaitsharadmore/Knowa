import { createSupermemoryClient, type SupermemorySearchResult } from "./client"
import { getUserMemories } from "../database/operations"

export interface RAGSearchOptions {
  query: string
  containerTags?: string[]
  userContext?: string
  limit?: number
  threshold?: number
  includeUserMemories?: boolean
}

export interface RAGSearchResponse {
  results: SupermemorySearchResult[]
  userMemories?: string[]
  query: string
  processingTime: number
  totalResults: number
}

export interface RAGAnswer {
  answer: string
  sources: Array<{
    title: string
    source: string
    score: number
    excerpt: string
  }>
  confidence: number
  userContext?: string
}

export async function searchKnowledge(options: RAGSearchOptions): Promise<RAGSearchResponse> {
  const startTime = Date.now()
  const client = createSupermemoryClient()

  try {
    // Enhance query with user context if provided
    let enhancedQuery = options.query
    if (options.userContext) {
      enhancedQuery = `${options.query}\n\nUser context: ${options.userContext}`
    }

    // Perform semantic search
    const searchResponse = await client.semanticSearch({
      query: enhancedQuery,
      containerTags: options.containerTags,
      limit: options.limit || 10,
      threshold: options.threshold || 0.7,
    })

    const processingTime = Date.now() - startTime

    return {
      results: searchResponse.results,
      query: options.query,
      processingTime,
      totalResults: searchResponse.total,
    }
  } catch (error) {
    console.error("Knowledge search failed:", error)
    return {
      results: [],
      query: options.query,
      processingTime: Date.now() - startTime,
      totalResults: 0,
    }
  }
}

export async function generateRAGAnswer(
  query: string,
  workspaceId: string,
  userId?: string,
  containerTags?: string[],
): Promise<RAGAnswer> {
  try {
    // Get user memories for context
    let userContext = ""
    if (userId) {
      const memories = await getUserMemories(workspaceId, userId)
      userContext = memories
        .slice(0, 5) // Limit to recent memories
        .map((m) => m.content)
        .join("\n")
    }

    // Search knowledge base
    const searchResults = await searchKnowledge({
      query,
      containerTags,
      userContext,
      limit: 5,
      threshold: 0.6,
    })

    if (searchResults.results.length === 0) {
      return {
        answer: "I couldn't find relevant information in the knowledge base to answer your question.",
        sources: [],
        confidence: 0,
        userContext,
      }
    }

    // Generate answer from top results
    const topResults = searchResults.results.slice(0, 3)
    const context = topResults.map((r) => r.content).join("\n\n")

    // Simple answer generation (in production, you'd use an LLM here)
    const answer = generateAnswerFromContext(query, context, userContext)

    // Calculate confidence based on top result score
    const confidence = topResults[0]?.score || 0

    // Prepare sources
    const sources = topResults.map((result) => ({
      title: result.title || "Document",
      source: result.source,
      score: result.score,
      excerpt: result.content.substring(0, 200) + "...",
    }))

    return {
      answer,
      sources,
      confidence,
      userContext,
    }
  } catch (error) {
    console.error("RAG answer generation failed:", error)
    return {
      answer: "I encountered an error while processing your question. Please try again.",
      sources: [],
      confidence: 0,
    }
  }
}

function generateAnswerFromContext(query: string, context: string, userContext?: string): string {
  // This is a simplified answer generation
  // In production, you would use an LLM like GPT-4 or Claude

  const contextLines = context.split("\n").filter((line) => line.trim())
  const relevantLines = contextLines.slice(0, 5) // Take first 5 relevant lines

  let answer = "Based on the available information:\n\n"
  answer += relevantLines.join("\n")

  if (userContext) {
    answer += "\n\nThis answer takes into account your previous interactions and preferences."
  }

  return answer
}

export async function processDocumentForRAG(
  content: string,
  metadata: {
    title: string
    source: string
    containerTags: string[]
    workspaceId: string
    documentId: string
  },
): Promise<{ success: boolean; supermemoryId?: string; error?: string }> {
  try {
    const client = createSupermemoryClient()

    // Add document to Supermemory
    const response = await client.addText({
      content,
      title: metadata.title,
      source: metadata.source,
      containerTags: metadata.containerTags,
      metadata: {
        workspaceId: metadata.workspaceId,
        documentId: metadata.documentId,
        processedAt: new Date().toISOString(),
      },
    })

    if (response.success) {
      return {
        success: true,
        supermemoryId: response.documentId,
      }
    } else {
      return {
        success: false,
        error: response.message || "Failed to process document",
      }
    }
  } catch (error) {
    console.error("Document processing failed:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown processing error",
    }
  }
}

export async function updateDocumentInRAG(
  supermemoryId: string,
  updates: {
    title?: string
    containerTags?: string[]
    metadata?: Record<string, any>
  },
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = createSupermemoryClient()
    await client.updateDocument(supermemoryId, updates)
    return { success: true }
  } catch (error) {
    console.error("Document update failed:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown update error",
    }
  }
}

export async function deleteDocumentFromRAG(supermemoryId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const client = createSupermemoryClient()
    await client.deleteDocument(supermemoryId)
    return { success: true }
  } catch (error) {
    console.error("Document deletion failed:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown deletion error",
    }
  }
}

// Helper functions for content processing
export function extractTextFromHTML(html: string): string {
  // Simple HTML to text conversion
  return html
    .replace(/<script[^>]*>.*?<\/script>/gi, "")
    .replace(/<style[^>]*>.*?<\/style>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

export function chunkText(text: string, maxChunkSize = 1000, overlap = 100): string[] {
  const chunks: string[] = []
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim())

  let currentChunk = ""

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > maxChunkSize && currentChunk) {
      chunks.push(currentChunk.trim())
      // Keep some overlap
      const words = currentChunk.split(" ")
      currentChunk = words.slice(-overlap / 10).join(" ") + " " + sentence
    } else {
      currentChunk += (currentChunk ? " " : "") + sentence
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim())
  }

  return chunks
}

export function calculateRelevanceScore(query: string, content: string): number {
  const queryWords = query.toLowerCase().split(/\s+/)
  const contentWords = content.toLowerCase().split(/\s+/)

  let matches = 0
  for (const queryWord of queryWords) {
    if (contentWords.some((contentWord) => contentWord.includes(queryWord))) {
      matches++
    }
  }

  return matches / queryWords.length
}
