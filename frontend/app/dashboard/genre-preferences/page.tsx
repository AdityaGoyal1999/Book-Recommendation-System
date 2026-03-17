"use client";

import { useState } from "react";
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

export default function GenrePreferencesPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (genre: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(genre)) next.delete(genre);
      else next.add(genre);
      return next;
    });
  }

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
              className={cn(
                "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                selected.has(genre)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-card-foreground hover:bg-muted hover:text-foreground"
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

        <div className="pt-4">
          <button
            type="button"
            disabled={selected.size === 0}
            className={cn(
              "rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:pointer-events-none disabled:opacity-50",
              "hover:opacity-90"
            )}
          >
            Save preferences
          </button>
        </div>
      </div>
    </div>
  );
}
