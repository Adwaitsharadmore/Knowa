"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, type File, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { formatBytes } from "@/lib/utils"
import { validateFile, getFileIcon, getSupportedFileTypes } from "@/lib/supermemory/formats"

interface FileUploadItem {
  id: string
  file: File
  status: "pending" | "uploading" | "processing" | "completed" | "error"
  progress: number
  error?: string
  documentId?: string
}

interface FileUploaderProps {
  workspaceId: string
  containerTags: string[]
  onUploadComplete?: (documentId: string) => void
  onUploadError?: (error: string) => void
  maxFiles?: number
  maxSize?: number
}

export function FileUploader({
  workspaceId,
  containerTags,
  onUploadComplete,
  onUploadError,
  maxFiles = 10,
  maxSize = 50 * 1024 * 1024, // 50MB
}: FileUploaderProps) {
  const [uploadItems, setUploadItems] = useState<FileUploadItem[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newItems: FileUploadItem[] = acceptedFiles.map((file) => {
        const validation = validateFile(file, maxSize)

        return {
          id: Math.random().toString(36).substring(2),
          file,
          status: validation.valid ? "pending" : "error",
          progress: 0,
          error: validation.error,
        }
      })

      setUploadItems((prev) => [...prev, ...newItems].slice(0, maxFiles))
    },
    [maxSize, maxFiles],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      ...getSupportedFileTypes().reduce(
        (acc, type) => {
          acc[type] = []
          return acc
        },
        {} as Record<string, string[]>,
      ),
    },
    maxFiles,
    maxSize,
    disabled: isUploading,
  })

  const removeFile = (id: string) => {
    setUploadItems((prev) => prev.filter((item) => item.id !== id))
  }

  const uploadFiles = async () => {
    const pendingItems = uploadItems.filter((item) => item.status === "pending")
    if (pendingItems.length === 0) return

    setIsUploading(true)

    for (const item of pendingItems) {
      try {
        // Update status to uploading
        setUploadItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: "uploading", progress: 0 } : i)))

        // Create FormData
        const formData = new FormData()
        formData.append("file", item.file)
        formData.append("workspaceId", workspaceId)
        formData.append("containerTags", JSON.stringify(containerTags))
        formData.append(
          "metadata",
          JSON.stringify({
            originalName: item.file.name,
            size: item.file.size,
            type: item.file.type,
            uploadedAt: new Date().toISOString(),
          }),
        )

        // Upload file with progress tracking
        const response = await fetch("/api/supermemory/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`)
        }

        const result = await response.json()

        if (result.success) {
          // Update to processing status
          setUploadItems((prev) =>
            prev.map((i) =>
              i.id === item.id ? { ...i, status: "processing", progress: 50, documentId: result.documentId } : i,
            ),
          )

          // Poll for processing completion
          await pollProcessingStatus(item.id, result.documentId)

          onUploadComplete?.(result.documentId)
        } else {
          throw new Error(result.error || "Upload failed")
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Upload failed"

        setUploadItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: "error", error: errorMessage } : i)),
        )

        onUploadError?.(errorMessage)
      }
    }

    setIsUploading(false)
  }

  const pollProcessingStatus = async (itemId: string, documentId: string) => {
    const maxAttempts = 30 // 5 minutes max
    let attempts = 0

    const poll = async () => {
      try {
        const response = await fetch(`/api/supermemory/status?documentId=${documentId}`)
        const status = await response.json()

        if (status.status === "completed") {
          setUploadItems((prev) =>
            prev.map((i) => (i.id === itemId ? { ...i, status: "completed", progress: 100 } : i)),
          )
          return
        }

        if (status.status === "failed") {
          setUploadItems((prev) =>
            prev.map((i) =>
              i.id === itemId ? { ...i, status: "error", error: status.error || "Processing failed" } : i,
            ),
          )
          return
        }

        // Update progress
        const progress = Math.min(50 + (status.progress || 0) * 0.5, 95)
        setUploadItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, progress } : i)))

        // Continue polling
        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000) // Poll every 10 seconds
        } else {
          setUploadItems((prev) =>
            prev.map((i) => (i.id === itemId ? { ...i, status: "error", error: "Processing timeout" } : i)),
          )
        }
      } catch (error) {
        setUploadItems((prev) =>
          prev.map((i) =>
            i.id === itemId ? { ...i, status: "error", error: "Failed to check processing status" } : i,
          ),
        )
      }
    }

    poll()
  }

  const hasValidFiles = uploadItems.some((item) => item.status === "pending")
  const hasErrors = uploadItems.some((item) => item.status === "error")

  return (
    <div className="space-y-6">
      {/* Dropzone */}
      <Card
        className={`border-2 border-dashed transition-colors ${
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
        }`}
      >
        <CardContent className="p-8">
          <div
            {...getRootProps()}
            className="flex flex-col items-center justify-center space-y-4 text-center cursor-pointer"
          >
            <input {...getInputProps()} />
            <div className="rounded-full bg-muted p-4">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                {isDragActive ? "Drop files here" : "Upload Knowledge Documents"}
              </h3>
              <p className="text-sm text-muted-foreground">Drag and drop files here, or click to browse</p>
              <p className="text-xs text-muted-foreground">
                Supports PDF, DOCX, TXT, CSV, JSON • Max {formatBytes(maxSize)} per file
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Container Tags */}
      {containerTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium">Tags:</span>
          {containerTags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Upload Items */}
      {uploadItems.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Files ({uploadItems.length})</h4>
            {hasValidFiles && (
              <Button onClick={uploadFiles} disabled={isUploading} size="sm">
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Upload All"
                )}
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {uploadItems.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{getFileIcon(item.file.type)}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{item.file.name}</p>
                      <Badge
                        variant={
                          item.status === "completed"
                            ? "default"
                            : item.status === "error"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {item.status}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {formatBytes(item.file.size)} • {item.file.type}
                    </p>

                    {item.error && (
                      <Alert className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-sm">{item.error}</AlertDescription>
                      </Alert>
                    )}

                    {(item.status === "uploading" || item.status === "processing") && (
                      <div className="mt-2 space-y-1">
                        <Progress value={item.progress} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {item.status === "uploading" ? "Uploading..." : "Processing..."}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {item.status === "completed" && <CheckCircle className="h-5 w-5 text-green-600" />}
                    {item.status === "error" && <AlertCircle className="h-5 w-5 text-destructive" />}
                    {item.status === "pending" && (
                      <Button variant="ghost" size="sm" onClick={() => removeFile(item.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Error Summary */}
      {hasErrors && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Some files failed to upload. Please check the errors above and try again.</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
