"use client";

import { useRef, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Upload, Tag, ChevronDown, X, HardDrive } from "lucide-react";
import { GoogleDriveConnectButton } from "@/components/google-drive/ConnectButton";
import { useToast } from "@/hooks/use-toast";

const TAG_OPTIONS = [
  { label: "Data Dictionary & Schema", value: "data-dictionary" },
  { label: "Onboarding", value: "onboarding" },
  { label: "Training", value: "training" },
];

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"upload" | "gdrive">("upload");

  // Handle URL parameters for OAuth callback
  useEffect(() => {
    const tab = searchParams.get('tab');
    const successParam = searchParams.get('success');
    const errorParam = searchParams.get('error');

    if (tab === 'gdrive') {
      setActiveTab('gdrive');
    }

    if (successParam === 'connected') {
      toast({
        title: "Success",
        description: "Google Drive connected successfully!",
      });
    }

    if (errorParam) {
      let errorMessage = "An error occurred";
      switch (errorParam) {
        case 'oauth_error':
          errorMessage = "OAuth authentication failed";
          break;
        case 'missing_params':
          errorMessage = "Missing required parameters";
          break;
        case 'no_org':
          errorMessage = "No organization found";
          break;
        case 'state_mismatch':
          errorMessage = "Security validation failed";
          break;
        case 'callback_error':
          errorMessage = "Callback processing failed";
          break;
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [searchParams, toast]);

  const onPick = () => inputRef.current?.click();

  const toggleTag = (value: string) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const clearTag = (value: string) =>
    setSelected((prev) => prev.filter((v) => v !== value));

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("metadata", JSON.stringify({"tags": selected}));

      const res = await fetch("/api/knowledge/documents", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Upload failed with ${res.status}`);
      }

      setSuccess("Uploaded successfully");
      setFile(null);
      setSelected([]);
      if (inputRef.current) inputRef.current.value = "";
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
        <p className="text-muted-foreground">
          Upload documents or connect to Google Drive to build your knowledge base
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === "upload" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("upload")}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          File Upload
        </Button>
        <Button
          variant={activeTab === "gdrive" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("gdrive")}
          className="flex items-center gap-2"
        >
          <HardDrive className="h-4 w-4" />
          Google Drive
        </Button>
      </div>

      {/* Upload Tab */}
      {activeTab === "upload" && (
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Documents
            </CardTitle>
            <CardDescription>
              Upload files from your computer to add them to your knowledge base
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File chooser */}
            <div className="flex items-center gap-3">
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                accept=".pdf,.doc,.docx,.txt,.md"
              />
              <Button onClick={onPick} variant="default" className="shrink-0">
                <Upload className="mr-2 h-4 w-4" />
                {file ? "Change file" : "Choose file"}
              </Button>
              <div className="truncate text-sm text-muted-foreground">
                {file ? file.name : "No file selected"}
              </div>
            </div>

            {/* Tag selector */}
            <div className="flex items-start gap-3">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="shrink-0">
                    <Tag className="mr-2 h-4 w-4" />
                    Tags
                    <ChevronDown className="ml-2 h-4 w-4 opacity-70" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-64" align="start">
                  <Command>
                    <CommandInput placeholder="Search tags..." />
                    <CommandList>
                      <CommandEmpty>No tags found.</CommandEmpty>
                      <CommandGroup heading="Available Tags">
                        {TAG_OPTIONS.map((opt) => (
                          <CommandItem
                            key={opt.value}
                            onSelect={() => toggleTag(opt.value)}
                            className="cursor-pointer"
                          >
                            <div className="mr-2 mt-[1px]">
                              <Checkbox checked={selected.includes(opt.value)} />
                            </div>
                            <span>{opt.label}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* Selected tags */}
              <div className="flex flex-wrap gap-2">
                {selected.length === 0 ? (
                  <span className="text-sm text-muted-foreground">
                    No tags selected
                  </span>
                ) : (
                  selected.map((value) => {
                    const label =
                      TAG_OPTIONS.find((t) => t.value === value)?.label || value;
                    return (
                      <Badge key={value} variant="secondary" className="gap-1">
                        {label}
                        <button
                          aria-label={`Remove ${label}`}
                          className="ml-1 rounded p-0.5 hover:bg-muted"
                          onClick={() => clearTag(value)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })
                )}
              </div>
            </div>

            <Separator />

            {/* Upload action */}
            <div className="flex items-center gap-3">
              <Button onClick={handleUpload} disabled={!file || loading}>
                {loading ? "Uploading..." : "Upload"}
              </Button>
              {error && <span className="text-sm text-red-600">{error}</span>}
              {success && <span className="text-sm text-green-600">{success}</span>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Google Drive Tab */}
      {activeTab === "gdrive" && (
        <div className="space-y-4">
          <GoogleDriveConnectButton 
            onConnect={() => {
              setSuccess("Google Drive connected successfully");
              setError(null);
            }}
            onDisconnect={(connectionId) => {
              setSuccess(`Connection ${connectionId} disconnected`);
              setError(null);
            }}
            onSync={(connectionId) => {
              setSuccess(`Sync initiated for connection ${connectionId}`);
              setError(null);
            }}
          />
        </div>
      )}
    </div>
  );
}
