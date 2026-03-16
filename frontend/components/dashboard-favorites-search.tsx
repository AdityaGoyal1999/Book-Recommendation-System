 "use client";

 import Image from "next/image";
 import { useState, FormEvent } from "react";
 import { Check, Search, X } from "lucide-react";
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

 type SelectedBook = {
   key: string;
   title: string;
   authors: string[];
   firstPublishYear?: number;
   coverId?: number;
 };

 type OpenLibrarySearchResponse = {
   docs?: OpenLibraryDoc[];
 };

 export function FavoritesSearchSection() {
   const [query, setQuery] = useState("");
   const [results, setResults] = useState<OpenLibraryDoc[]>([]);
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [selected, setSelected] = useState<SelectedBook[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<SelectedBook[] | null>(null);

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
   }

   function removeSelected(key: string) {
     setSelected((prev) => prev.filter((b) => b.key !== key));
     setSaveError(null);
    setSubmitted(null);
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

   async function saveSelected() {
     if (selected.length === 0 || saving) return;
     setSaving(true);
     setSaveError(null);
    setSubmitted(null);
     try {
      // For now (until backend endpoint is wired), just show the books the user is saving.

      console.log("These are the selected books", selected);
      setSubmitted(selected);
     } catch (e) {
       console.error(e);
      setSaveError("Could not prepare your favorites. Please try again.");
     } finally {
       setSaving(false);
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

           <div className="mt-5 grid gap-4 lg:grid-cols-2">
             <div className="space-y-2">
               <p className="text-xs font-medium text-muted-foreground">
                 Search results
               </p>
               {results.length > 0 && !error ? (
                 <ul className="divide-y divide-border/60 rounded-md border border-border/60 bg-background/40">
                   {results.map((doc) => {
                     const authors = doc.author_name?.join(", ");
                     const year = doc.first_publish_year;
                     const coverUrl =
                       typeof doc.cover_i === "number"
                         ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
                         : null;
                     const already = isSelected(doc.key);
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
                           <Button
                             type="button"
                             variant={already ? "secondary" : "outline"}
                             size="sm"
                             className="h-7 px-2.5"
                             onClick={() => addSelected(doc)}
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
                   <p className="text-xs text-muted-foreground">
                     Search to see the top 5 matches from Open Library.
                   </p>
                 </div>
               )}
             </div>

             <div className="space-y-2">
               <div className="flex items-center justify-between gap-2">
                 <p className="text-xs font-medium text-muted-foreground">
                   Selected books
                 </p>
                 <p className="text-xs text-muted-foreground">
                   {selected.length} selected
                 </p>
               </div>

               <div className="rounded-md border border-border/60 bg-background/40">
                 {selected.length === 0 ? (
                   <div className="p-3">
                     <p className="text-xs text-muted-foreground">
                       Add a few books from the results. We&apos;ll save them to your
                       favorites.
                     </p>
                   </div>
                 ) : (
                   <ul className="divide-y divide-border/60">
                     {selected.map((book) => {
                       const coverUrl =
                         typeof book.coverId === "number"
                           ? `https://covers.openlibrary.org/b/id/${book.coverId}-M.jpg`
                           : null;
                       return (
                         <li key={book.key} className="p-3">
                           <div className="flex items-start gap-3">
                             <div className="relative mt-0.5 h-14 w-10 shrink-0 overflow-hidden rounded-sm border border-border/60 bg-muted">
                               {coverUrl ? (
                                 <Image
                                   src={coverUrl}
                                   alt={`Cover of ${book.title}`}
                                   fill
                                   sizes="40px"
                                   className="object-cover"
                                 />
                               ) : (
                                 <div className="h-full w-full" aria-hidden="true" />
                               )}
                             </div>
                             <div className="min-w-0 flex-1">
                               <p className="text-xs font-medium text-foreground">
                                 {book.title}
                               </p>
                               {book.authors.length > 0 && (
                                 <p className="text-xs text-muted-foreground">
                                   {book.authors.join(", ")}
                                 </p>
                               )}
                             </div>
                             <Button
                               type="button"
                               variant="ghost"
                               size="icon-sm"
                               onClick={() => removeSelected(book.key)}
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
                 </div>
                 <Button
                   type="button"
                   onClick={saveSelected}
                   disabled={selected.length === 0 || saving}
                   className="sm:self-end"
                 >
                   {saving ? "Saving..." : "Save favorites"}
                 </Button>
               </div>

              {submitted && (
                <div className="rounded-md border border-border/60 bg-background/40 p-3">
                  <p className="text-xs font-medium text-foreground">
                    Books to be saved
                  </p>
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

