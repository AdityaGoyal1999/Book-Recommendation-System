"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FavoritesSearchResults } from "@/components/favorites/favorites-search-results";
import { FavoritesSelectedPanel } from "@/components/favorites/favorites-selected-panel";
import { useFavoritesSearch } from "@/hooks/use-favorites-search";
import { Search } from "lucide-react";

export function FavoritesSearchSection() {
  const search = useFavoritesSearch();

  return (
    <section aria-labelledby="favorites-search-heading">
      <Card className="border-border/60 bg-card/70 shadow-sm backdrop-blur">
        <CardHeader className="space-y-1">
          <CardTitle
            id="favorites-search-heading"
            className="text-base font-semibold tracking-tight sm:text-lg"
          >
            Search for a book
          </CardTitle>
          <CardDescription className="text-sm">
            Find books to add to your favorites and improve your recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={search.handleSubmit}
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <div className="flex-1">
              <Input
                type="search"
                placeholder="Search by title, author, or ISBN"
                value={search.query}
                onChange={(event) => search.setQuery(event.target.value)}
                className="w-full"
              />
            </div>
            <Button
              type="submit"
              className="inline-flex items-center gap-2 whitespace-nowrap px-4"
              disabled={search.isLoading}
            >
              <Search className="size-4" />
              <span className="hidden sm:inline">
                {search.isLoading ? "Searching..." : "Search"}
              </span>
              <span className="sm:hidden">{search.isLoading ? "..." : "Go"}</span>
            </Button>
          </form>

          {search.error && (
            <p className="mt-3 text-xs text-destructive" role="alert">
              {search.error}
            </p>
          )}

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <FavoritesSearchResults
              results={search.results}
              hasError={Boolean(search.error)}
              isSelected={search.isSelected}
              onAdd={search.addSelected}
              coverUrl={search.coverUrlForDoc}
            />

            <FavoritesSelectedPanel
              selected={search.selected}
              saving={search.saving}
              saveError={search.saveError}
              saveStatus={search.saveStatus}
              submitted={search.submitted}
              onRemove={search.removeSelected}
              onSave={search.saveSelected}
              coverUrl={search.coverUrlForSelected}
            />
          </div>

          <p className="mt-3 text-[11px] text-muted-foreground">
            Data from{" "}
            <a
              href="https://openlibrary.org/dev/docs/api/search"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4"
            >
              Open Library Search API
            </a>
            .
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
