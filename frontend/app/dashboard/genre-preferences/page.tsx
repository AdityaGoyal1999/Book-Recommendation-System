"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const BROAD_GENRES = [
  "Fiction",
  "Nonfiction",
  "Mystery & Thriller",
  "Romance",
  "Science Fiction",
  "Fantasy",
  "Biography & Memoir",
  "History",
  "Self-help & Development",
  "Literary Fiction",
  "Horror",
  "Young Adult",
  "Poetry",
  "Graphic Novels & Comics",
  "Cooking & Food",
  "Travel",
  "Science & Nature",
  "Religion & Spirituality",
] as const;

function setsEqual<T>(a: Set<T>, b: Set<T>): boolean {
  if (a.size !== b.size) return false;
  for (const x of a) if (!b.has(x)) return false;
  return true;
}

export default function GenrePreferencesPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [lastSaved, setLastSaved] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const hasChanges = !setsEqual(selected, lastSaved);

  const toggle = useCallback((genre: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(genre)) next.delete(genre);
      else next.add(genre);
      return next;
    });
    setMessage(null);
  }, []);

  const savePreferences = useCallback(async () => {
    if (!hasChanges || selected.size === 0) return;
    setSaving(true);
    setMessage(null);

    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/save-genre-preferences`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token ?? ""}`,
        apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
      },
      body: JSON.stringify({ genres: Array.from(selected) }),
    });

    setSaving(false);

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage({
        type: "error",
        text: data?.error ?? "Failed to save preferences. Please try again.",
      });
      return;
    }

    const msg = typeof data?.message === "string" ? data.message : "Preferences saved";
    setMessage({ type: "success", text: msg });
    setLastSaved(new Set(selected));
  }, [hasChanges, selected]);

  return (
    <div className="flex flex-1 flex-col px-4 py-8">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <div>
          <h1 className="font-sans text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Genre preferences
          </h1>
          <p className="mt-2 text-muted-foreground">
            Select the broad categories you love to read. We&apos;ll use these for better recommendations.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {BROAD_GENRES.map((genre) => (
            <button
              key={genre}
              type="button"
              onClick={() => toggle(genre)}
              disabled={saving}
              className={cn(
                "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:opacity-70 bg-card text-card-foreground hover:bg-muted hover:text-foreground",
                selected.has(genre)
                  ? "border-primary border-2 border-solid"
                  : "border-border"
              )}
            >
              {genre}
            </button>
          ))}
        </div>

        {selected.size > 0 && (
          <p className="text-sm text-muted-foreground">
            {selected.size} genre{selected.size === 1 ? "" : "s"} selected.
          </p>
        )}

        <div className="pt-4 space-y-3">
          {message && (
            <p
              className={cn(
                "text-sm font-medium",
                message.type === "success" && "text-emerald-600 dark:text-emerald-400",
                message.type === "error" && "text-destructive"
              )}
              role="status"
            >
              {message.text}
            </p>
          )}
          <button
            type="button"
            disabled={selected.size === 0 || !hasChanges || saving}
            onClick={savePreferences}
            className={cn(
              "rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:pointer-events-none disabled:opacity-50",
              "hover:opacity-90"
            )}
          >
            {saving ? "Saving…" : "Save preferences"}
          </button>
        </div>
      </div>
    </div>
  );
}
