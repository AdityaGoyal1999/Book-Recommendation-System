export type RecommendedBook = {
  title: string;
  author: string | null;
  reason: string;
};

export function normalizeRecommendedBooks(raw: unknown): RecommendedBook[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((book: unknown) => {
      const b = book as {
        title?: string;
        author?: string | null;
        reason?: string;
      };
      return {
        title: typeof b.title === "string" ? b.title.trim() : "",
        author: typeof b.author === "string" ? b.author.trim() : null,
        reason: typeof b.reason === "string" ? b.reason.trim() : "",
      };
    })
    .filter((book) => book.title.length > 0 && book.reason.length > 0);
}
