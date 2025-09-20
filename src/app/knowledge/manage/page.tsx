import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  FileText,
  Search,
  Filter,
  MoreHorizontal,
  Download,
  Trash2,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  Upload,
} from "lucide-react"
import { formatBytes, formatDate } from "@/lib/utils"

// Mock data - in a real app, this would come from your database
const documents = [
  {
    id: "1",
    title: "Employee Handbook 2024",
    type: "PDF",
    source: "employee-handbook-2024.pdf",
    status: "completed",
    size: 2048000,
    containerTags: ["hr", "policies"],
    uploadedBy: "John Doe",
    createdAt: new Date("2024-01-15"),
    lastProcessed: new Date("2024-01-15"),
  },
  {
    id: "2",
    title: "API Documentation",
    type: "URL",
    source: "https://api.company.com/docs",
    status: "processing",
    size: null,
    containerTags: ["engineering", "docs"],
    uploadedBy: "Jane Smith",
    createdAt: new Date("2024-01-14"),
    lastProcessed: new Date("2024-01-14"),
  },
  {
    id: "3",
    title: "Q4 Financial Report",
    type: "DOCX",
    source: "q4-financial-report.docx",
    status: "completed",
    size: 1536000,
    containerTags: ["finance", "reports"],
    uploadedBy: "Mike Johnson",
    createdAt: new Date("2024-01-13"),
    lastProcessed: new Date("2024-01-13"),
  },
  {
    id: "4",
    title: "Customer Support FAQ",
    type: "TEXT",
    source: "Manual input",
    status: "failed",
    size: 45000,
    containerTags: ["support", "faq"],
    uploadedBy: "Sarah Wilson",
    createdAt: new Date("2024-01-12"),
    lastProcessed: new Date("2024-01-12"),
  },
  {
    id: "5",
    title: "Product Specifications",
    type: "CSV",
    source: "product-specs.csv",
    status: "completed",
    size: 256000,
    containerTags: ["product", "specs"],
    uploadedBy: "David Brown",
    createdAt: new Date("2024-01-11"),
    lastProcessed: new Date("2024-01-11"),
  },
]

const stats = {
  total: documents.length,
  completed: documents.filter((d) => d.status === "completed").length,
  processing: documents.filter((d) => d.status === "processing").length,
  failed: documents.filter((d) => d.status === "failed").length,
}

function getStatusIcon(status: string) {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case "processing":
      return <Clock className="h-4 w-4 text-yellow-600" />
    case "failed":
      return <AlertCircle className="h-4 w-4 text-red-600" />
    default:
      return <Clock className="h-4 w-4 text-gray-400" />
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "completed":
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>
    case "processing":
      return <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>
    case "failed":
      return <Badge variant="destructive">Failed</Badge>
    default:
      return <Badge variant="secondary">Unknown</Badge>
  }
}

function getTypeIcon(type: string) {
  switch (type) {
    case "PDF":
      return "📄"
    case "DOCX":
      return "📝"
    case "CSV":
      return "📊"
    case "URL":
      return "🌐"
    case "TEXT":
      return "📃"
    default:
      return "📁"
  }
}

export default function KnowledgeManagePage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Management</h1>
          <p className="text-muted-foreground">Manage and monitor your knowledge base documents</p>
        </div>
        <Button asChild>
          <a href="/knowledge/upload">
            <Upload className="mr-2 h-4 w-4" />
            Upload Documents
          </a>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.processing}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>All documents in your knowledge base</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search documents..." className="pl-10" />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          {/* Documents Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{getTypeIcon(doc.type)}</span>
                        <div>
                          <div className="font-medium">{doc.title}</div>
                          <div className="text-sm text-muted-foreground">{doc.source}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{doc.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(doc.status)}
                        {getStatusBadge(doc.status)}
                      </div>
                    </TableCell>
                    <TableCell>{doc.size ? formatBytes(doc.size) : "—"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {doc.containerTags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatDate(doc.createdAt)}</div>
                        <div className="text-muted-foreground">by {doc.uploadedBy}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Reprocess
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
