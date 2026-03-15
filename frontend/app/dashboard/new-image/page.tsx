"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ImagePlus, ClipboardPaste, X } from "lucide-react";

export default function NewImagePage() {
  const [imageData, setImageData] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback((file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Please paste or drop an image file (e.g. PNG, JPEG, WebP).");
      return;
    }
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
    setError(null);
  }, []);

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
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4 gap-2"
                onClick={clearImage}
              >
                <X className="size-4" />
                Clear image
              </Button>
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
