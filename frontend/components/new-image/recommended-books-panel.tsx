"use client";

import type { RecommendedBook } from "@/lib/recommended-books";

type RecommendedBooksPanelProps = {
  books: RecommendedBook[];
};

export function RecommendedBooksPanel({ books }: RecommendedBooksPanelProps) {
  if (books.length === 0) return null;

  return (
    <section className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground sm:text-xl">Recommended for you</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Based on your shelf photo, favorites, and genre preferences.
        </p>
      </div>

      <div className="space-y-3">
        {books.map((book, idx) => (
          <article
            key={`${book.title}-${idx}`}
            className="rounded-lg border border-border/80 bg-background px-4 py-3"
          >
            <p className="font-medium text-foreground">
              {idx + 1}. {book.title}
              {book.author ? (
                <span className="font-normal text-muted-foreground"> by {book.author}</span>
              ) : null}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{book.reason}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
