export interface FileProcessor {
  supportedTypes: string[]
  process: (
    buffer: Buffer,
    filename: string,
  ) => Promise<{
    content: string
    metadata: Record<string, any>
  }>
}

export interface ProcessedFile {
  content: string
  metadata: Record<string, any>
  type: string
}

// Text file processor
export const textProcessor: FileProcessor = {
  supportedTypes: ["text/plain", "text/markdown", "text/csv"],
  async process(buffer: Buffer, filename: string) {
    const content = buffer.toString("utf-8")
    const lines = content.split("\n").length
    const words = content.split(/\s+/).length

    return {
      content,
      metadata: {
        filename,
        encoding: "utf-8",
        lines,
        words,
        size: buffer.length,
      },
    }
  },
}

// PDF processor (simplified - in production use pdf-parse or similar)
export const pdfProcessor: FileProcessor = {
  supportedTypes: ["application/pdf"],
  async process(buffer: Buffer, filename: string) {
    // This is a placeholder - in production you'd use a proper PDF parser
    // like pdf-parse, pdf2pic, or similar libraries

    return {
      content: "PDF content extraction would be implemented here using a proper PDF parsing library.",
      metadata: {
        filename,
        type: "pdf",
        size: buffer.length,
        pages: 1, // Would be extracted from actual PDF
        extractedText: false,
      },
    }
  },
}

// DOCX processor (simplified - in production use mammoth or similar)
export const docxProcessor: FileProcessor = {
  supportedTypes: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  async process(buffer: Buffer, filename: string) {
    // This is a placeholder - in production you'd use mammoth.js or similar

    return {
      content: "DOCX content extraction would be implemented here using mammoth.js or similar library.",
      metadata: {
        filename,
        type: "docx",
        size: buffer.length,
        extractedText: false,
      },
    }
  },
}

// CSV processor
export const csvProcessor: FileProcessor = {
  supportedTypes: ["text/csv", "application/csv"],
  async process(buffer: Buffer, filename: string) {
    const content = buffer.toString("utf-8")
    const lines = content.split("\n").filter((line) => line.trim())
    const headers = lines[0]?.split(",") || []

    // Convert CSV to readable text format
    const textContent = lines
      .slice(0, 100) // Limit to first 100 rows for processing
      .map((line) => {
        const values = line.split(",")
        return headers.map((header, index) => `${header}: ${values[index] || ""}`).join(", ")
      })
      .join("\n")

    return {
      content: textContent,
      metadata: {
        filename,
        type: "csv",
        rows: lines.length - 1, // Exclude header
        columns: headers.length,
        headers,
        size: buffer.length,
      },
    }
  },
}

// JSON processor
export const jsonProcessor: FileProcessor = {
  supportedTypes: ["application/json"],
  async process(buffer: Buffer, filename: string) {
    const content = buffer.toString("utf-8")

    try {
      const jsonData = JSON.parse(content)

      // Convert JSON to readable text
      const textContent = JSON.stringify(jsonData, null, 2)

      return {
        content: textContent,
        metadata: {
          filename,
          type: "json",
          size: buffer.length,
          valid: true,
          keys: Object.keys(jsonData).length,
        },
      }
    } catch (error) {
      return {
        content: content, // Return raw content if JSON is invalid
        metadata: {
          filename,
          type: "json",
          size: buffer.length,
          valid: false,
          error: "Invalid JSON format",
        },
      }
    }
  },
}

// Registry of all processors
export const fileProcessors: FileProcessor[] = [textProcessor, pdfProcessor, docxProcessor, csvProcessor, jsonProcessor]

export function getProcessorForFile(mimeType: string): FileProcessor | null {
  return fileProcessors.find((processor) => processor.supportedTypes.includes(mimeType)) || null
}

export function getSupportedFileTypes(): string[] {
  return fileProcessors.flatMap((processor) => processor.supportedTypes)
}

export async function processFile(buffer: Buffer, filename: string, mimeType: string): Promise<ProcessedFile | null> {
  const processor = getProcessorForFile(mimeType)

  if (!processor) {
    return null
  }

  try {
    const result = await processor.process(buffer, filename)

    return {
      content: result.content,
      metadata: {
        ...result.metadata,
        processedAt: new Date().toISOString(),
        processor: processor.constructor.name,
      },
      type: mimeType,
    }
  } catch (error) {
    console.error(`Error processing file ${filename}:`, error)
    return null
  }
}

// URL content processor
export async function processUrl(url: string): Promise<{
  content: string
  metadata: Record<string, any>
} | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Knowledge-Copilot/1.0",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const contentType = response.headers.get("content-type") || ""
    const content = await response.text()

    let processedContent = content
    let metadata: Record<string, any> = {
      url,
      contentType,
      statusCode: response.status,
      fetchedAt: new Date().toISOString(),
    }

    if (contentType.includes("text/html")) {
      // Extract text from HTML
      processedContent = extractTextFromHTML(content)

      // Extract title and meta description
      const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i)
      const descMatch = content.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i)

      metadata = {
        ...metadata,
        title: titleMatch?.[1]?.trim() || "",
        description: descMatch?.[1]?.trim() || "",
        htmlLength: content.length,
        textLength: processedContent.length,
      }
    }

    return {
      content: processedContent,
      metadata,
    }
  } catch (error) {
    console.error(`Error processing URL ${url}:`, error)
    return null
  }
}

function extractTextFromHTML(html: string): string {
  return html
    .replace(/<script[^>]*>.*?<\/script>/gi, "")
    .replace(/<style[^>]*>.*?<\/style>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

// File validation
export function validateFile(
  file: File,
  maxSize = 50 * 1024 * 1024,
): {
  valid: boolean
  error?: string
} {
  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size (${Math.round(file.size / 1024 / 1024)}MB) exceeds maximum allowed size (${Math.round(maxSize / 1024 / 1024)}MB)`,
    }
  }

  // Check if file type is supported
  const supportedTypes = getSupportedFileTypes()
  if (!supportedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type "${file.type}" is not supported. Supported types: ${supportedTypes.join(", ")}`,
    }
  }

  return { valid: true }
}

export function getFileIcon(mimeType: string): string {
  if (mimeType.includes("pdf")) return "📄"
  if (mimeType.includes("word") || mimeType.includes("docx")) return "📝"
  if (mimeType.includes("excel") || mimeType.includes("csv")) return "📊"
  if (mimeType.includes("powerpoint") || mimeType.includes("pptx")) return "📈"
  if (mimeType.includes("text")) return "📃"
  if (mimeType.includes("json")) return "🔧"
  if (mimeType.includes("image")) return "🖼️"
  return "📁"
}
