"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { RefreshCcw } from "lucide-react";
import { BookCoverThumb } from "@/components/favorites/book-cover-thumb";
import { openLibraryCoverUrlMedium } from "@/lib/open-library";

type FavoriteBook = {
  id: string;
  title: string;
  author: string;
  coverUrl?: string | null;
};

type FavoriteBookPayload = {
  key?: unknown;
  title?: unknown;
  authors?: unknown;
  coverId?: unknown;
};

type GetFavoritesResponse = {
  favorite_books?: FavoriteBookPayload[];
};

export function FavoritesListSection() {
  const [favorites, setFavorites] = useState<FavoriteBook[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchFavorites() {
    const supabase = createClient();

    try {
      setLoading(true);
      setError(null);

      const [{ data: sessionData }, { data: { user } }] = await Promise.all([
        supabase.auth.getSession(),
        supabase.auth.getUser(),
      ]);

      const accessToken = sessionData.session?.access_token;
      if (!user || !accessToken) {
        setFavorites([]);
        setError("Sign in to see your favorite books.");
        return;
      }

      const { data, error: fnError } = await supabase.functions.invoke(
        "get-favorites",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (fnError) {
        console.error("get-favorites error", fnError);
        setError("Could not load favorites. Please try again.");
        setFavorites([]);
        return;
      }

      const payload = (data ?? {}) as GetFavoritesResponse;
      const favoriteBooks = Array.isArray(payload.favorite_books)
        ? payload.favorite_books.map((b, idx) => ({
            id: String(typeof b.key === "string" && b.key.length > 0 ? b.key : idx),
            title: typeof b.title === "string" && b.title.length > 0 ? b.title : "Untitled",
            author:
              Array.isArray(b.authors) && b.authors.every((a) => typeof a === "string")
                ? b.authors.join(", ")
                : "Unknown author",
            coverUrl:
              typeof b.coverId === "number" ? openLibraryCoverUrlMedium(b.coverId) : null,
          }))
        : [];

      setFavorites(favoriteBooks);
    } catch (e) {
      console.error(e);
      setError("Could not load favorites. Please try again.");
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFavorites();
  }, []);

  const items = favorites?.length ? favorites : [];

  return (
    <section aria-labelledby="favorites-list-heading" className="space-y-3">
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <h2
            id="favorites-list-heading"
            className="font-sans text-lg font-semibold tracking-tight text-foreground sm:text-xl"
          >
            Previously liked books
          </h2>
          <p className="text-sm text-muted-foreground">
            These books help us understand your taste better.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {favorites && favorites.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {favorites.length}{" "}
              {favorites.length === 1 ? "book" : "books"}
            </p>
          )}
          <Button
            type="button"
            variant="outline"
            className="bg-primary text-primary-foreground"
            size="sm"
            onClick={fetchFavorites}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
            <RefreshCcw className="size-4" />
          </Button>
        </div>
      </div>

      {loading && (
        <p className="text-xs text-muted-foreground">Loading favorites...</p>
      )}
      {!loading && error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}

       <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
         {items.map((book) => (
          <Card
            key={book.id}
            className="group flex flex-col overflow-hidden border-border/60 bg-card/70 shadow-sm transition-shadow hover:shadow-md"
          >
            <CardHeader className="space-y-1 pb-2">
              <div className="flex items-start gap-3">
                <BookCoverThumb src={book.coverUrl ?? null} title={`Cover of ${book.title}`} />
                <div className="min-w-0 flex-1">
                  <CardTitle className="line-clamp-2 text-sm font-semibold">
                 {book.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 text-xs">
                    {book.author}
                  </CardDescription>
                </div>
              </div>
             </CardHeader>
             <CardContent className="mt-auto pb-4 pt-0">
               <p className="text-xs text-muted-foreground">
                 Liked via What to read AI?
               </p>
             </CardContent>
           </Card>
         ))}
       </div>
     </section>
   );
 }

