"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ImagePlus, ClipboardPaste, X, Upload, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const STORAGE_BUCKET = "book_scans";

export default function NewImagePage() {
  const [imageData, setImageData] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const processFile = useCallback((file: File) => {
    setError(null);
    setUploadedUrl(null);
    if (!file.type.startsWith("image/")) {
      setError("Please paste or drop an image file (e.g. PNG, JPEG, WebP).");
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => setImageData(reader.result as string);
    reader.onerror = () => setError("Failed to read the image.");
    reader.readAsDataURL(file);
  }, []);

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const item = e.clipboardData?.items?.[0];
      if (item?.kind === "file") {
        const file = item.getAsFile();
        if (file) processFile(file);
      }
    },
    [processFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      e.target.value = "";
    },
    [processFile]
  );

  const clearImage = useCallback(() => {
    setImageData(null);
    setSelectedFile(null);
    setError(null);
    setUploadedUrl(null);
  }, []);

  const uploadToSupabase = useCallback(async () => {
    if (!imageData || !selectedFile) return;
    setError(null);
    setUploading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        setError("You must be signed in to upload.");
        return;
      }
      const ext = selectedFile.name.split(".").pop() || "jpg";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, selectedFile, {
          contentType: selectedFile.type,
          upsert: false,
        });
      if (uploadError) {
        setError(uploadError.message || "Upload failed.");
        return;
      }
      // Private bucket: use a signed URL (valid 1 hour) so the link works with RLS
      const { data: signed, error: signedError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(path, 3600);

      // Send bucket + object path to the image-processing Edge Function
      // so the backend can track this scan in a persistent way.
      // The Edge Function can later use these to generate signed URLs
      // and run OCR in the background.
      void supabase.functions.invoke("image-processing", {
        body: {
          bucket_id: STORAGE_BUCKET,
          object_path: path,
        },
      }).then((data) => {
        console.log("image-processing response", data);
      }).catch((error) => {
        console.error("image-processing error", error);
      });

      if (signedError) {
        setError(signedError.message || "Upload succeeded but could not create view link.");
        return;
      }
      setUploadedUrl(signed?.signedUrl ?? null);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setUploading(false);
    }
  }, [imageData, selectedFile]);

  return (
    <div className="flex flex-1 flex-col px-4 py-8">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <div>
          <h1 className="font-sans text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Upload a photo of a bookstore shelf
          </h1>
          <p className="mt-2 text-muted-foreground">
            Paste from clipboard (Ctrl+V / Cmd+V), or drag and drop an image here.
          </p>
        </div>

        <div
          className={cn(
            "relative mx-auto max-w-xl rounded-xl border-2 border-dashed transition-colors",
            "bg-muted/30 focus-within:ring-3 focus-within:ring-ring/50 focus-within:border-ring",
            isDragging && "border-primary bg-primary/5",
            !isDragging && "border-input hover:border-muted-foreground/40",
            imageData && "border-solid border-input bg-muted/20"
          )}
          onPaste={handlePaste}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          tabIndex={0}
        >
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={handleFileInput}
            aria-label="Upload image"
          />

          {imageData ? (
            <div className="relative flex min-h-[280px] flex-col items-center justify-center p-6 sm:min-h-[320px]">
              <div className="relative max-h-[320px] overflow-hidden rounded-lg border border-border bg-background shadow-sm">
                <img
                  src={imageData}
                  alt="Pasted or uploaded preview"
                  className="max-h-[300px] w-auto max-w-full object-contain sm:max-h-[320px]"
                />
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  className="gap-2"
                  onClick={uploadToSupabase}
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Upload className="size-4" />
                  )}
                  {uploading ? "Uploading…" : "Upload to Supabase"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={clearImage}
                  disabled={uploading}
                >
                  <X className="size-4" />
                  Clear image
                </Button>
              </div>
              {uploadedUrl && (
                <p className="mt-3 max-w-full truncate text-center text-sm text-muted-foreground">
                  Uploaded.{" "}
                  <a
                    href={uploadedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-2"
                  >
                    Open image
                  </a>{" "}
                  <span className="text-muted-foreground/80">(link expires in 1 hour)</span>
                </p>
              )}
            </div>
          ) : (
            <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 p-8 text-center sm:min-h-[320px]">
              <div className="rounded-full border border-border bg-background p-4 shadow-sm">
                <ImagePlus className="size-10 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-foreground">
                  Paste or drop your image
                </p>
                <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <kbd className="rounded border border-border bg-muted px-2 py-0.5 font-mono text-xs">
                    Ctrl
                  </kbd>
                  <span>+</span>
                  <kbd className="rounded border border-border bg-muted px-2 py-0.5 font-mono text-xs">
                    V
                  </kbd>
                  <span className="hidden sm:inline">, or click to browse</span>
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-muted-foreground">
                <ClipboardPaste className="size-4 shrink-0" />
                <span className="text-sm">Supported: PNG, JPEG, WebP, GIF</span>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
