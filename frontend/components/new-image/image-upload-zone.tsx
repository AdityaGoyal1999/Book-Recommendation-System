"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ClipboardPaste, ImagePlus, Loader2, Upload, X } from "lucide-react";

type ImageUploadZoneProps = {
  imageData: string | null;
  isDragging: boolean;
  uploading: boolean;
  uploadedUrl: string | null;
  onPaste: (e: React.ClipboardEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: () => void;
  onClear: () => void;
};

export function ImageUploadZone({
  imageData,
  isDragging,
  uploading,
  uploadedUrl,
  onPaste,
  onDrop,
  onDragOver,
  onDragLeave,
  onFileInput,
  onUpload,
  onClear,
}: ImageUploadZoneProps) {
  return (
    <div
      className={cn(
        "relative mx-auto max-w-xl rounded-xl border-2 border-dashed transition-colors",
        "bg-muted/30 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
        isDragging && "border-primary bg-primary/5",
        !isDragging && "border-input hover:border-muted-foreground/40",
        imageData && "border-solid border-input bg-muted/20"
      )}
      onPaste={onPaste}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      tabIndex={0}
    >
      <input
        type="file"
        accept=".jpg,.jpeg,.png,.heic,.heif,image/jpeg,image/png,image/heic,image/heif"
        className="absolute inset-0 cursor-pointer opacity-0"
        onChange={onFileInput}
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
              onClick={onUpload}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              {uploading ? "Uploading…" : "Get Recommendations"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={onClear}
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
            <p className="font-medium text-foreground">Paste or drop your image</p>
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
            <span className="text-sm">Supported: JPG, JPEG, PNG, HEIC</span>
          </div>
        </div>
      )}
    </div>
  );
}
