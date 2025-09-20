"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  MessageSquare,
  Users,
  TrendingUp,
  Slack,
  CheckCircle,
  AlertCircle,
  Upload,
  Bot,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type Doc = {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  status: "processed" | "processing";
  type: string;
};

export default function DashboardPage() {
  const [docs, setDocs] = useState<Doc[]>([]);

  useEffect(() => {
    fetch("/api/knowledge/documents")
      .then((r) => r.json())
      .then(setDocs);
  }, []);

  const [stats, setStats] = useState({
    total: 0,
    processing: 0,
    processed: 0,
    recent: [],
  });
  useEffect(() => {
    fetch("/api/knowledge/documents")
      .then((res) => res.json())
      .then((docs) => {
        setStats({
          total: docs.length,
          processing: docs.filter((doc) => doc.status === "processing").length,
          processed: docs.filter((doc) => doc.status === "processed").length,
          recent: docs.slice(0, 4), // or fetch separate recent activity
        });
      });
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Dashboard</h1>
          <p className="text-muted-foreground text-pretty">
            Monitor your knowledge base and Slack integration status
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link href="/knowledge/upload">
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload Documents
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Documents
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Documents in your knowledge base
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.processed}</div>
            <p className="text-xs text-muted-foreground">
              Ready for AI queries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.processing}</div>
            <p className="text-xs text-muted-foreground">
              Currently being indexed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Slack Status</CardTitle>
            <Slack className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">Connected</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Workspace integrated
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Recent Documents</span>
            </CardTitle>
            <CardDescription>Your latest uploaded documents</CardDescription>
          </CardHeader>
          <CardContent>
            {docs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No documents uploaded yet</p>
                <Link href="/knowledge/upload">
                  <Button variant="outline" className="mt-4">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Your First Document
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {docs.slice(0, 5).map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.type} • {doc.size} • {doc.uploadedAt}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        doc.status === "processed" ? "default" : "secondary"
                      }
                    >
                      {doc.status === "processed" ? (
                        <>
                          <CheckCircle className="mr-1 h-3 w-3" /> Processed
                        </>
                      ) : (
                        <>
                          <AlertCircle className="mr-1 h-3 w-3" /> Processing
                        </>
                      )}
                    </Badge>
                  </div>
                ))}
                {docs.length > 5 && (
                  <Link href="/knowledge/manage">
                    <Button variant="ghost" className="w-full">
                      View All Documents
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <span>Quick Actions</span>
            </CardTitle>
            <CardDescription>Common tasks and integrations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/knowledge/upload">
              <Button className="w-full justify-start">
                <Upload className="mr-2 h-4 w-4" />
                Upload New Document
              </Button>
            </Link>
            <Link href="/knowledge/manage">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Manage Documents
              </Button>
            </Link>
            <Link href="/integrations/slack">
              <Button variant="outline" className="w-full justify-start">
                <Slack className="mr-2 h-4 w-4" />
                Slack Settings
              </Button>
            </Link>
            <Link href="/admin/settings">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Admin Settings
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
