"use client";

import { useCallback, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BOOK_SCANS_STORAGE_BUCKET } from "@/lib/book-scans-constants";
import {
  convertHeicToJpeg,
  isAllowedImageFile,
  isHeicFile,
} from "@/lib/image-file-utils";
import { normalizeRecommendedBooks, type RecommendedBook } from "@/lib/recommended-books";

export function useNewImageUpload(loadUsage: () => Promise<void>) {
  const [imageData, setImageData] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [recommendedBooks, setRecommendedBooks] = useState<RecommendedBook[]>([]);
  const [noRecommendations, setNoRecommendations] = useState(false);
  const [noRecommendationsMessage, setNoRecommendationsMessage] = useState<string | null>(null);

  const processFile = useCallback(async (file: File) => {
    setError(null);
    setUploadedUrl(null);
    setRecommendedBooks([]);
    setNoRecommendations(false);
    setNoRecommendationsMessage(null);
    setSelectedFile(null);
    setImageData(null);

    if (!isAllowedImageFile(file)) {
      setError("Please upload a JPG, JPEG, PNG, or HEIC image.");
      return;
    }
    let normalizedFile = file;
    try {
      if (isHeicFile(file)) {
        normalizedFile = await convertHeicToJpeg(file);
      }
    } catch {
      setError("Could not convert HEIC image. Please try another photo.");
      return;
    }

    setSelectedFile(normalizedFile);
    const reader = new FileReader();
    reader.onload = () => setImageData(reader.result as string);
    reader.onerror = () => setError("Failed to read the image.");
    reader.readAsDataURL(normalizedFile);
  }, []);

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const item = e.clipboardData?.items?.[0];
      if (item?.kind === "file") {
        const file = item.getAsFile();
        if (file) void processFile(file);
      }
    },
    [processFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) void processFile(file);
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
      if (file) void processFile(file);
      e.target.value = "";
    },
    [processFile]
  );

  const clearImage = useCallback(() => {
    setImageData(null);
    setSelectedFile(null);
    setError(null);
    setUploadedUrl(null);
    setRecommendedBooks([]);
    setNoRecommendations(false);
    setNoRecommendationsMessage(null);
  }, []);

  const uploadToSupabase = useCallback(async () => {
    if (!imageData || !selectedFile) return;
    if (!isAllowedImageFile(selectedFile)) {
      setError("Only JPG, JPEG, PNG, and HEIC files are supported.");
      return;
    }
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
        .from(BOOK_SCANS_STORAGE_BUCKET)
        .upload(path, selectedFile, {
          contentType: selectedFile.type,
          upsert: false,
        });
      if (uploadError) {
        setError(uploadError.message || "Upload failed.");
        return;
      }
      const { data: signed, error: signedError } = await supabase.storage
        .from(BOOK_SCANS_STORAGE_BUCKET)
        .createSignedUrl(path, 3600);

      if (signedError) {
        setError(signedError.message || "Upload succeeded but could not create view link.");
        return;
      }

      const { data: processingData, error: processingError } = await supabase.functions.invoke(
        "image-processing",
        {
          body: {
            bucket_id: BOOK_SCANS_STORAGE_BUCKET,
            object_path: path,
          },
        }
      );

      if (processingError) {
        setError(processingError.message || "Image processing failed.");
        setUploadedUrl(signed?.signedUrl ?? null);
        return;
      }

      const serverMessage =
        typeof processingData?.message === "string" ? processingData.message : null;

      const recommendations = normalizeRecommendedBooks(processingData?.recommended_books);

      setRecommendedBooks(recommendations);
      setNoRecommendations(recommendations.length === 0);
      setNoRecommendationsMessage(
        recommendations.length === 0
          ? (serverMessage ??
              "We could not generate recommendations from this image. Try uploading a clearer shelf photo or one with more visible book titles.")
          : null
      );
      setUploadedUrl(signed?.signedUrl ?? null);
      void loadUsage();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setUploading(false);
    }
  }, [imageData, selectedFile, loadUsage]);

  return {
    imageData,
    selectedFile,
    isDragging,
    error,
    uploading,
    uploadedUrl,
    recommendedBooks,
    noRecommendations,
    noRecommendationsMessage,
    handlePaste,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleFileInput,
    clearImage,
    uploadToSupabase,
  };
}
