"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ScanBook = {
  title: string;
  author: string | null;
  reason: string | null;
};

type ScanItem = {
  id: number;
  created_at: string;
  status: string;
  image_url: string | null;
  detected_books: ScanBook[];
  recommendations: ScanBook[];
};

function getStatusStyles(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized === "completed") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }
  if (normalized === "failed") {
    return "border-destructive/40 bg-destructive/10 text-destructive";
  }
  return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300";
}

export default function HistoryPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scans, setScans] = useState<ScanItem[]>([]);
  const [selectedScanId, setSelectedScanId] = useState<number | null>(null);

  const selectedScan = scans.find((scan) => scan.id === selectedScanId) ?? null;

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      setError(null);

      try {
        const supabase = createClient();
        const { data, error } = await supabase.functions.invoke("get-previous-scans");

        if (error) {
          setError(error.message || "Failed to load history.");
          return;
        }

        const rawScans = Array.isArray(data?.scans) ? data.scans : [];
        const parsed = rawScans
          .map((scan: unknown) => {
            const s = scan as {
              id?: unknown;
              created_at?: unknown;
              status?: unknown;
              image_url?: unknown;
              detected_books?: unknown;
              recommendations?: unknown;
            };

            if (
              typeof s.id !== "number" ||
              typeof s.created_at !== "string" ||
              typeof s.status !== "string"
            ) {
              return null;
            }

            const toBooks = (input: unknown): ScanBook[] =>
              Array.isArray(input)
                ? input
                    .map((book: unknown) => {
                      const b = book as {
                        title?: unknown;
                        author?: unknown;
                        reason?: unknown;
                      };
                      if (typeof b.title !== "string" || b.title.trim().length === 0) {
                        return null;
                      }
                      return {
                        title: b.title.trim(),
                        author: typeof b.author === "string" ? b.author.trim() : null,
                        reason: typeof b.reason === "string" ? b.reason.trim() : null,
                      };
                    })
                    .filter((book): book is ScanBook => book !== null)
                : [];

            return {
              id: s.id,
              created_at: s.created_at,
              status: s.status,
              image_url: typeof s.image_url === "string" ? s.image_url : null,
              detected_books: toBooks(s.detected_books),
              recommendations: toBooks(s.recommendations),
            } as ScanItem;
          })
          .filter((scan: ScanItem | null): scan is ScanItem => scan !== null);

        setScans(parsed);
        setSelectedScanId((prev) => prev ?? parsed[0]?.id ?? null);
      } catch {
        setError("Something went wrong while loading history.");
      } finally {
        setLoading(false);
      }
    };

    void loadHistory();
  }, []);

  return (
    <div className="flex flex-1 flex-col px-4 py-8">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <div>
          <h1 className="font-sans text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            History
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your previous scans and recommendations.
          </p>
        </div>

        {loading && (
          <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            Loading history...
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </div>
        )}

        {!loading && !error && scans.length === 0 && (
          <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            No scans found yet.
          </div>
        )}

        {!loading && !error && scans.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
            <div className="space-y-3">
              {scans.map((scan) => (
                <button
                  key={scan.id}
                  type="button"
                  onClick={() => setSelectedScanId(scan.id)}
                  className={cn(
                    "w-full rounded-xl border bg-card p-4 text-left transition-colors hover:bg-muted/40",
                    selectedScanId === scan.id
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">
                      {new Date(scan.created_at).toLocaleString()}
                    </p>
                    <ChevronRight className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  </div>
                  <div className="mt-2">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide",
                        getStatusStyles(scan.status)
                      )}
                    >
                      {scan.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
              {!selectedScan ? (
                <p className="text-sm text-muted-foreground">
                  Select a scan from the list to view its details.
                </p>
              ) : (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Scan details</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {new Date(selectedScan.created_at).toLocaleString()}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Status:{" "}
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide",
                          getStatusStyles(selectedScan.status)
                        )}
                      >
                        {selectedScan.status}
                      </span>
                    </p>
                  </div>

                  <div className="relative min-h-[180px] overflow-hidden rounded-lg border border-border bg-muted/20">
                    {selectedScan.image_url ? (
                      <Image
                        src={selectedScan.image_url}
                        alt="Scan capture"
                        width={1200}
                        height={900}
                        unoptimized
                        className="h-auto max-h-[340px] w-full object-contain"
                      />
                    ) : (
                      <div className="flex min-h-[180px] items-center justify-center px-4 py-8 text-sm text-muted-foreground">
                        Scan image is not available for this item.
                      </div>
                    )}
                  </div>

                  <div className="grid gap-4">
                    <section className="space-y-2">
                      <h3 className="text-sm font-semibold text-foreground">Recommendations</h3>
                      {selectedScan.recommendations.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No recommendations available.</p>
                      ) : (
                        <div className="space-y-2">
                          {selectedScan.recommendations.map((book, idx) => (
                            <div
                              key={`${selectedScan.id}-recommendation-${book.title}-${idx}`}
                              className="rounded-md border border-border/80 bg-background px-3 py-2"
                            >
                              <p className="text-sm text-foreground">
                                {book.title}
                                {book.author ? (
                                  <span className="text-muted-foreground"> by {book.author}</span>
                                ) : null}
                              </p>
                              {book.reason ? (
                                <p className="mt-1 text-xs text-muted-foreground">{book.reason}</p>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      )}
                    </section>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
