"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ScanBook = {
  title: string;
  author: string | null;
  reason?: string;
};

type ScanItem = {
  id: number;
  created_at: string;
  status: string;
  bucket_id: string;
  object_path: string;
  detected_books: ScanBook[] | null;
  recommendations: ScanBook[] | null;
};

const HISTORY_API_ENDPOINT = "/api/history/scans";

export default function HistoryPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scans, setScans] = useState<ScanItem[]>([]);

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      setError(null);

      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const res = await fetch(HISTORY_API_ENDPOINT, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token ?? ""}`,
          },
        });

        const data = (await res.json().catch(() => ({}))) as
          | { scans?: unknown }
          | ScanItem[];

        if (!res.ok) {
          setError("Failed to load history.");
          return;
        }

        const rawScans = Array.isArray(data) ? data : Array.isArray(data.scans) ? data.scans : [];
        const parsed = rawScans.filter((scan): scan is ScanItem => {
          const s = scan as Partial<ScanItem>;
          return (
            typeof s.id === "number" &&
            typeof s.created_at === "string" &&
            typeof s.status === "string" &&
            typeof s.bucket_id === "string" &&
            typeof s.object_path === "string"
          );
        });

        setScans(parsed);
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
          <div className="space-y-4">
            {scans.map((scan) => (
              <article key={scan.id} className="rounded-xl border border-border bg-card p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">
                    Scan #{scan.id}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(scan.created_at).toLocaleString()}
                  </p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Status: {scan.status}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {scan.bucket_id}/{scan.object_path}
                </p>

                {Array.isArray(scan.recommendations) && scan.recommendations.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-medium text-foreground">Recommended books</p>
                    {scan.recommendations.map((book, idx) => (
                      <div
                        key={`${scan.id}-${book.title}-${idx}`}
                        className="rounded-md border border-border/80 bg-background px-3 py-2"
                      >
                        <p className="text-sm text-foreground">
                          {idx + 1}. {book.title}
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
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
