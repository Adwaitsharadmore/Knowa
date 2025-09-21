"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Upload, Tag, ChevronDown, X } from "lucide-react";

const TAG_OPTIONS = [
  { label: "Data Dictionary & Schema", value: "data-dictionary" },
  { label: "Onboarding", value: "onboarding" },
  { label: "Training", value: "training" },
];

export default function UploadWithTags() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
      // Supermemory expects containerTags as a JSON array string
      fd.append("metadata", JSON.stringify({"tags": selected}));

      // Send to your Next.js route wired to Supermemory
      const res = await fetch("/api/knowledge/documents", {
        method: "POST",
        body: fd,
      });
      console.log("fd", fd);
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
    <div className="w-full max-w-xl rounded-2xl border bg-background p-4 shadow-sm">
      <div className="flex flex-col gap-3">
        {/* File chooser */}
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
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
      </div>
    </div>
  );
}
