"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { BookCoverThumb } from "@/components/favorites/book-cover-thumb";
import type { SelectedBook } from "@/hooks/use-favorites-search";

type FavoritesSelectedPanelProps = {
  selected: SelectedBook[];
  saving: boolean;
  saveError: string | null;
  saveStatus: string | null;
  submitted: SelectedBook[] | null;
  onRemove: (key: string) => void;
  onSave: () => void;
  coverUrl: (book: SelectedBook) => string | null;
};

export function FavoritesSelectedPanel({
  selected,
  saving,
  saveError,
  saveStatus,
  submitted,
  onRemove,
  onSave,
  coverUrl,
}: FavoritesSelectedPanelProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">Selected books</p>
        <p className="text-xs text-muted-foreground">{selected.length} selected</p>
      </div>

      <div className="rounded-md border border-border/60 bg-background/40">
        {selected.length === 0 ? (
          <div className="p-3">
            <p className="text-xs text-muted-foreground">
              Add a few books from the results. We&apos;ll save them to your favorites.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {selected.map((book) => {
              const src = coverUrl(book);
              return (
                <li key={book.key} className="p-3">
                  <div className="flex items-start gap-3">
                    <BookCoverThumb src={src} title={`Cover of ${book.title}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-foreground">{book.title}</p>
                      {book.authors.length > 0 && (
                        <p className="text-xs text-muted-foreground">{book.authors.join(", ")}</p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onRemove(book.key)}
                      aria-label={`Remove ${book.title}`}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-h-[1rem]">
          {saveError && (
            <p className="text-xs text-destructive" role="alert">
              {saveError}
            </p>
          )}
          {!saveError && saveStatus && (
            <p className="text-xs text-emerald-600" role="status">
              {saveStatus}
            </p>
          )}
        </div>
        <Button
          type="button"
          onClick={onSave}
          disabled={selected.length === 0 || saving}
          className="sm:self-end"
        >
          {saving ? "Saving..." : "Save favorites"}
        </Button>
      </div>

      {submitted && (
        <div className="rounded-md border border-border/60 bg-background/40 p-3">
          <p className="text-xs font-medium text-foreground">Books to be saved</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
            {submitted.map((b) => (
              <li key={b.key}>
                <span className="text-foreground">{b.title}</span>
                {b.authors.length > 0 ? ` — ${b.authors.join(", ")}` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
