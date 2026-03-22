"use client";

import { useState, FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { openLibraryCoverUrlMedium } from "@/lib/open-library";

export type OpenLibraryDoc = {
  key: string;
  title?: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
};

export type SelectedBook = {
  key: string;
  title: string;
  authors: string[];
  firstPublishYear?: number;
  coverId?: number;
};

export function useFavoritesSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<OpenLibraryDoc[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<SelectedBook[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<SelectedBook[] | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  function isSelected(key: string) {
    return selected.some((b) => b.key === key);
  }

  function addSelected(doc: OpenLibraryDoc) {
    const key = doc.key;
    if (!key || isSelected(key)) return;
    const title = doc.title?.trim() || "Untitled";
    const authors = Array.isArray(doc.author_name) ? doc.author_name : [];
    const next: SelectedBook = {
      key,
      title,
      authors,
      firstPublishYear: doc.first_publish_year,
      coverId: doc.cover_i,
    };
    setSelected((prev) => [next, ...prev]);
    setSaveError(null);
    setSubmitted(null);
    setSaveStatus(null);
  }

  function removeSelected(key: string) {
    setSelected((prev) => prev.filter((b) => b.key !== key));
    setSaveError(null);
    setSubmitted(null);
    setSaveStatus(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setError(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) {
        setError("You need to be signed in to search.");
        setResults([]);
        return;
      }

      const { data, error: fnError } = await supabase.functions.invoke("search-books", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: { query: trimmed },
      });

      if (fnError) {
        setError(fnError.message || "Could not fetch results. Please try again.");
        setResults([]);
        return;
      }

      const docs = Array.isArray(data?.docs) ? (data.docs as OpenLibraryDoc[]) : [];
      setResults(docs);
    } catch {
      setError("Could not fetch results. Please try again.");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function saveSelected() {
    if (selected.length === 0 || saving) return;
    setSaving(true);
    setSaveError(null);
    setSubmitted(null);
    setSaveStatus(null);
    try {
      const supabase = createClient();

      const [{ data: sessionData }, { data: { user } }] = await Promise.all([
        supabase.auth.getSession(),
        supabase.auth.getUser(),
      ]);

      const accessToken = sessionData.session?.access_token;
      if (!user || !accessToken) {
        setSaveError("You need to be signed in to save favorites.");
        return;
      }

      const { error: fnError } = await supabase.functions.invoke("save-favorites", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: {
          books: selected,
        },
      });

      if (fnError) {
        setSaveError("Could not save favorites. Please try again.");
        setSaveStatus(null);
      } else {
        setSubmitted(selected);
        setSaveStatus("Favorites saved successfully (stub response).");
      }
    } catch {
      setSaveError("Could not save your favorites. Please try again.");
      setSaveStatus(null);
    } finally {
      setSaving(false);
    }
  }

  function coverUrlForDoc(doc: OpenLibraryDoc): string | null {
    return typeof doc.cover_i === "number" ? openLibraryCoverUrlMedium(doc.cover_i) : null;
  }

  function coverUrlForSelected(book: SelectedBook): string | null {
    return typeof book.coverId === "number" ? openLibraryCoverUrlMedium(book.coverId) : null;
  }

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    selected,
    saving,
    saveError,
    submitted,
    saveStatus,
    isSelected,
    addSelected,
    removeSelected,
    handleSubmit,
    saveSelected,
    coverUrlForDoc,
    coverUrlForSelected,
  };
}
