"use client";

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { BookCoverThumb } from "@/components/favorites/book-cover-thumb";
import type { OpenLibraryDoc } from "@/hooks/use-favorites-search";

type FavoritesSearchResultsProps = {
  results: OpenLibraryDoc[];
  hasError: boolean;
  isSelected: (key: string) => boolean;
  onAdd: (doc: OpenLibraryDoc) => void;
  coverUrl: (doc: OpenLibraryDoc) => string | null;
};

export function FavoritesSearchResults({
  results,
  hasError,
  isSelected,
  onAdd,
  coverUrl,
}: FavoritesSearchResultsProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">Search results</p>
      {results.length > 0 && !hasError ? (
        <ul className="divide-y divide-border/60 rounded-md border border-border/60 bg-background/40">
          {results.map((doc) => {
            const authors = doc.author_name?.join(", ");
            const year = doc.first_publish_year;
            const src = coverUrl(doc);
            const already = isSelected(doc.key);
            return (
              <li key={doc.key} className="px-3 py-2 text-xs">
                <div className="flex items-start gap-3">
                  <BookCoverThumb
                    src={src}
                    title={doc.title ? `Cover of ${doc.title}` : "Book cover"}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">{doc.title ?? "Untitled"}</p>
                    {(authors || year) && (
                      <p className="text-muted-foreground">
                        {authors}
                        {authors && year ? " · " : ""}
                        {year}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant={already ? "secondary" : "outline"}
                    size="sm"
                    className="h-7 px-2.5"
                    onClick={() => onAdd(doc)}
                    disabled={already}
                  >
                    {already ? (
                      <span className="inline-flex items-center gap-1">
                        <Check className="size-3.5" />
                        Added
                      </span>
                    ) : (
                      "Add"
                    )}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-md border border-border/60 bg-background/40 p-3">
          <p className="text-xs text-muted-foreground">Search to see the top 5 matches</p>
        </div>
      )}
    </div>
  );
}
