import { FileUploader } from "@/components/knowledge/FileUploader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, Globe, Type } from "lucide-react"

export default function KnowledgeUploadPage() {
  // In a real app, you'd get this from the user's session/workspace
  const workspaceId = "demo-workspace"
  const containerTags = ["general", "uploaded"]

  return (
    <div className="container max-w-4xl py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Upload Knowledge</h1>
          <p className="text-lg text-muted-foreground">
            Add documents, files, and content to your knowledge base. The AI will process and index them for intelligent
            retrieval.
          </p>
        </div>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              File Upload
            </CardTitle>
            <CardDescription>Upload documents that will be processed and added to your knowledge base</CardDescription>
          </CardHeader>
          <CardContent>
            <FileUploader
              workspaceId={workspaceId}
              containerTags={containerTags}
              onUploadComplete={(documentId) => {
                console.log("Upload completed:", documentId)
                // You could show a toast notification here
              }}
              onUploadError={(error) => {
                console.error("Upload error:", error)
                // You could show an error toast here
              }}
            />
          </CardContent>
        </Card>

        {/* Supported Formats */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Documents</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="outline">PDF</Badge>
                <Badge variant="outline">DOCX</Badge>
                <Badge variant="outline">TXT</Badge>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Text documents, reports, manuals, and written content
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg">Web Content</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="outline">URLs</Badge>
                <Badge variant="outline">HTML</Badge>
                <Badge variant="outline">Web Pages</Badge>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">Website content, documentation, and online resources</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Type className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-lg">Structured Data</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="outline">CSV</Badge>
                <Badge variant="outline">JSON</Badge>
                <Badge variant="outline">Spreadsheets</Badge>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Databases, configurations, and structured information
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Processing Info */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">How Processing Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-medium">1. Upload & Validation</h4>
                <p className="text-sm text-muted-foreground">
                  Files are validated for type, size, and format compatibility
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">2. Content Extraction</h4>
                <p className="text-sm text-muted-foreground">
                  Text content is extracted and cleaned from various file formats
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">3. AI Processing</h4>
                <p className="text-sm text-muted-foreground">
                  Content is analyzed, chunked, and embedded for semantic search
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">4. Knowledge Integration</h4>
                <p className="text-sm text-muted-foreground">
                  Processed content is indexed and made available for queries
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
