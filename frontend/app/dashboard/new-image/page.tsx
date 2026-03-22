"use client";

import { ImageUploadZone } from "@/components/new-image/image-upload-zone";
import { RecommendedBooksPanel } from "@/components/new-image/recommended-books-panel";
import { ScanUsageCountsBar } from "@/components/scan-usage-counts-bar";
import { useNewImageUpload } from "@/hooks/use-new-image-upload";
import { useScanUsage } from "@/hooks/use-scan-usage";

export default function NewImagePage() {
  const { numScans, limit, loadUsage } = useScanUsage();
  const upload = useNewImageUpload(loadUsage);

  return (
    <div className="flex flex-1 flex-col px-4 py-8">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center space-y-6">
        <div>
          <h1 className="font-sans text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Upload a photo of a bookstore shelf
          </h1>
          <p className="mt-2 text-muted-foreground">
            Paste from clipboard (Ctrl+V / Cmd+V), or drag and drop an image here.
          </p>
        </div>

        <div className="w-1/2 rounded-lg border border-border bg-card px-4 py-3">
          <ScanUsageCountsBar used={numScans} limit={limit} />
        </div>

        <ImageUploadZone
          imageData={upload.imageData}
          isDragging={upload.isDragging}
          uploading={upload.uploading}
          uploadedUrl={upload.uploadedUrl}
          onPaste={upload.handlePaste}
          onDrop={upload.handleDrop}
          onDragOver={upload.handleDragOver}
          onDragLeave={upload.handleDragLeave}
          onFileInput={upload.handleFileInput}
          onUpload={upload.uploadToSupabase}
          onClear={upload.clearImage}
        />

        {upload.error && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {upload.error}
          </div>
        )}

        {upload.noRecommendations && !upload.error && (
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
            {upload.noRecommendationsMessage ??
              "We could not generate recommendations from this image. Try uploading a clearer shelf photo or one with more visible book titles."}
          </div>
        )}

        <RecommendedBooksPanel books={upload.recommendedBooks} />
      </div>
    </div>
  );
}
