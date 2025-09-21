"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, HardDrive, CheckCircle, ExternalLink, RefreshCw, RotateCcw, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GoogleDriveConnection {
  id: string;
  provider: string;
  email: string;
  createdAt: string;
  documentLimit: number;
  status: "active" | "expired" | "error";
}

interface ConnectButtonProps {
  onConnect?: () => void;
  onDisconnect?: (connectionId: string) => void;
  onSync?: (connectionId: string) => void;
}

export function GoogleDriveConnectButton({ onConnect, onDisconnect, onSync }: ConnectButtonProps) {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [connections, setConnections] = useState<GoogleDriveConnection[]>([]);
  const { toast } = useToast();

  // Fetch connections on component mount
  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const response = await fetch("/api/google-drive/connections");
      if (response.ok) {
        const data = await response.json();
        setConnections(data.connections || []);
      }
    } catch (error) {
      console.error("Failed to fetch connections:", error);
    }
  };

  const handleConnect = async () => {
    try {
      setLoading(true);
      
      const response = await fetch("/api/google-drive/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      
      if (result.success) {
        if (result.authLink) {
          // Redirect to Google OAuth
          window.location.href = result.authLink;
        } else {
          toast({
            title: "Success",
            description: "Google Drive connection initiated",
          });
          onConnect?.();
          fetchConnections();
        }
      } else {
        throw new Error(result.message || "Failed to connect to Google Drive");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to Google Drive",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async (connectionId: string) => {
    try {
      const response = await fetch(`/api/google-drive/connections/${connectionId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Success",
          description: "Google Drive connection disconnected",
        });
        onDisconnect?.(connectionId);
        fetchConnections();
      } else {
        throw new Error(result.message || "Failed to disconnect connection");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disconnect connection",
        variant: "destructive",
      });
    }
  };

  const handleSync = async (connectionId: string) => {
    try {
      setSyncing(connectionId);
      
      const response = await fetch(`/api/google-drive/connections/${connectionId}/sync`, {
        method: "POST",
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Success",
          description: "Manual sync initiated",
        });
        onSync?.(connectionId);
      } else {
        throw new Error(result.message || "Failed to sync");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sync connection",
        variant: "destructive",
      });
    } finally {
      setSyncing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case "expired":
        return <Badge variant="destructive">Expired</Badge>;
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Connect Button */}
      <div className="flex items-center gap-4 p-4 border rounded-lg">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <HardDrive className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-medium">Google Drive Integration</h3>
          <p className="text-sm text-muted-foreground">
            Connect your Google Drive to automatically sync documents to your knowledge base
          </p>
        </div>
        <Button 
          onClick={handleConnect} 
          disabled={loading}
          className="shrink-0"
        >
          {loading ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Link className="mr-2 h-4 w-4" />
          )}
          {loading ? "Connecting..." : "Connect"}
        </Button>
      </div>

      {/* Connected Accounts */}
      {connections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Connected Accounts</CardTitle>
            <CardDescription>
              Manage your connected Google Drive accounts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {connections.map((connection) => (
              <div key={connection.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <HardDrive className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{connection.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Connected {new Date(connection.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Document limit: {connection.documentLimit}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(connection.status)}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSync(connection.id)}
                    disabled={syncing === connection.id}
                  >
                    {syncing === connection.id ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <RotateCcw className="h-4 w-4" />
                    )}
                    Sync
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDisconnect(connection.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-start gap-3 p-3 border rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-sm">Auto Sync</h4>
            <p className="text-xs text-muted-foreground">
              Automatically sync new files from your Drive
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 border rounded-lg">
          <ExternalLink className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-sm">Real-time Updates</h4>
            <p className="text-xs text-muted-foreground">
              Get notified when files are updated
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
