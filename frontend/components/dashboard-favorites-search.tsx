 "use client";

 import Image from "next/image";
 import { useState, FormEvent } from "react";
 import { Search } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
 } from "@/components/ui/card";

 type OpenLibraryDoc = {
   key: string;
   title?: string;
   author_name?: string[];
   first_publish_year?: number;
  cover_i?: number;
 };

 type OpenLibrarySearchResponse = {
   docs?: OpenLibraryDoc[];
 };

 export function FavoritesSearchSection() {
   const [query, setQuery] = useState("");
   const [results, setResults] = useState<OpenLibraryDoc[]>([]);
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);

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

       const url = new URL("https://openlibrary.org/search.json");
       url.searchParams.set("q", trimmed);
       url.searchParams.set("limit", "5");

       const response = await fetch(url.toString(), {
         headers: { Accept: "application/json" },
       });

       if (!response.ok) {
         throw new Error(`Open Library search failed: ${response.status}`);
       }

       const data = (await response.json()) as OpenLibrarySearchResponse;
       const docs = Array.isArray(data.docs) ? data.docs : [];
       setResults(docs.slice(0, 5));
     } catch (e) {
       console.error(e);
       setError("Could not fetch results. Please try again.");
       setResults([]);
     } finally {
       setIsLoading(false);
     }
   }

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
             onSubmit={handleSubmit}
             className="flex flex-col gap-3 sm:flex-row sm:items-center"
           >
             <div className="flex-1">
               <Input
                 type="search"
                 placeholder="Search by title, author, or ISBN"
                 value={query}
                 onChange={(event) => setQuery(event.target.value)}
                 className="w-full"
               />
             </div>
             <Button
               type="submit"
               className="inline-flex items-center gap-2 whitespace-nowrap px-4"
               disabled={isLoading}
             >
               <Search className="size-4" />
               <span className="hidden sm:inline">
                 {isLoading ? "Searching..." : "Search"}
               </span>
               <span className="sm:hidden">{isLoading ? "..." : "Go"}</span>
             </Button>
           </form>

           {error && (
             <p className="mt-3 text-xs text-destructive" role="alert">
               {error}
             </p>
           )}

          {results.length > 0 && !error && (
             <div className="mt-4 space-y-2">
               <p className="text-xs font-medium text-muted-foreground">
                 Top {results.length} result{results.length === 1 ? "" : "s"}
               </p>
               <ul className="divide-y divide-border/60 rounded-md border border-border/60 bg-background/40">
                 {results.map((doc) => {
                   const authors = doc.author_name?.join(", ");
                   const year = doc.first_publish_year;
                  const coverUrl =
                    typeof doc.cover_i === "number"
                      ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
                      : null;
                   return (
                    <li key={doc.key} className="px-3 py-2 text-xs">
                      <div className="flex items-start gap-3">
                        <div className="relative mt-0.5 h-14 w-10 shrink-0 overflow-hidden rounded-sm border border-border/60 bg-muted">
                          {coverUrl ? (
                            <Image
                              src={coverUrl}
                              alt={doc.title ? `Cover of ${doc.title}` : "Book cover"}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-full w-full" aria-hidden="true" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground">
                            {doc.title ?? "Untitled"}
                          </p>
                          {(authors || year) && (
                            <p className="text-muted-foreground">
                              {authors}
                              {authors && year ? " · " : ""}
                              {year}
                            </p>
                          )}
                        </div>
                      </div>
                    </li>
                   );
                 })}
               </ul>
               <p className="text-[11px] text-muted-foreground">
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
             </div>
           )}
         </CardContent>
       </Card>
     </section>
   );
 }

