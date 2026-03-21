import "@supabase/functions-js/edge-runtime.d.ts";
import Fuse from "https://esm.sh/fuse.js@7.1.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2?dts";

const ALLOWED_ORIGIN = Deno.env.get("SITE_URL") ?? "http://localhost:3000";

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const UPSTASH_REDIS_REST_URL =
  Deno.env.get("UPSTASH_REDIS_REST_URL") ??
  Deno.env.get("UPSTASH_REDIS_URL") ??
  Deno.env.get("UPSTASH_REDIS_REST_ENDPOINT") ??
  "";

const UPSTASH_REDIS_REST_TOKEN =
  Deno.env.get("UPSTASH_REDIS_REST_TOKEN") ??
  Deno.env.get("UPSTASH_REDIS_TOKEN") ??
  "";

const CACHE_TTL_SECONDS = Math.max(
  60,
  Number(Deno.env.get("UPSTASH_CACHE_TTL_SECONDS") ?? "21600")
); // 6h default

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

async function upstashGetJson<T>(key: string): Promise<T | null> {
  if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) return null;

  const url = `${UPSTASH_REDIS_REST_URL.replace(/\/$/, "")}/get/${encodeURIComponent(key)}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) return null;
    const data = (await response.json()) as { result?: unknown };
    const raw = data?.result;
    if (raw === null || raw === undefined) return null;

    // We store JSON as a string in Redis, so `raw` is usually a string.
    if (typeof raw === "string") {
      try {
        return JSON.parse(raw) as T;
      } catch {
        return null;
      }
    }

    return raw as T;
  } catch {
    return null;
  }
}

async function upstashSetJson(key: string, value: unknown, ttlSeconds: number) {
  if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) return;

  const url = `${UPSTASH_REDIS_REST_URL.replace(/\/$/, "")}/set/${encodeURIComponent(key)}?EX=${ttlSeconds}`;

  try {
    // Upstash REST supports POST where the body becomes the SET value.
    await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
        "Content-Type": "text/plain",
      },
      body: typeof value === "string" ? value : JSON.stringify(value),
    });
  } catch {
    // Cache failures should never break search.
  }
}

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

function tokensForOpenLibrarySearch(trimmed: string): string[] {
  const raw = trimmed.split(/\s+/).filter(Boolean);
  const significant = raw.filter((t) => t.length >= 2);
  return significant.length > 0 ? significant : raw;
}

async function fetchOpenLibraryDocsForToken(token: string): Promise<OpenLibraryDoc[]> {
  const url = new URL("https://openlibrary.org/search.json");
  url.searchParams.set("q", token);
  url.searchParams.set("limit", "10");

  const response = await fetch(url.toString(), { headers: { Accept: "application/json" } });
  if (!response.ok) {
    throw new Error(`Open Library search failed: ${response.status}`);
  }

  const data = (await response.json()) as OpenLibrarySearchResponse;
  const docs = Array.isArray(data.docs) ? data.docs : [];
  return docs.filter((d): d is OpenLibraryDoc => typeof d?.key === "string" && d.key.length > 0);
}

async function getAuthenticatedUser(authHeader: string) {
  const supabaseUserClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    {
      global: { headers: { Authorization: authHeader } },
    }
  );

  const {
    data: { user },
    error,
  } = await supabaseUserClient.auth.getUser();

  if (error || !user) throw new Error("Not authenticated");
  return user;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization") ?? "";
  const user = await getAuthenticatedUser(authHeader).catch(() => null);
  if (!user) {
    return jsonResponse({ error: "Not authenticated" }, 401);
  }

  const body = (await req.json().catch(() => null)) as { query?: unknown } | null;
  const query = typeof body?.query === "string" ? body.query.trim() : "";
  if (!query) {
    return jsonResponse({ error: "Invalid payload, expected { query: string }" }, 400);
  }

  try {
    const tokens = tokensForOpenLibrarySearch(query);

    const perTokenResults = await Promise.all(
      tokens.map(async (token) => {
        const tokenKey = token.toLowerCase().trim();
        const cacheKey = `books:${tokenKey}`;

        const cached = await upstashGetJson<OpenLibraryDoc[]>(cacheKey);
        if (cached !== null) return cached;

        const docs = await fetchOpenLibraryDocsForToken(token);
        await upstashSetJson(cacheKey, docs, CACHE_TTL_SECONDS);
        return docs;
      })
    );

    const byKey = new Map<string, OpenLibraryDoc>();
    for (const docs of perTokenResults) {
      for (const doc of docs) {
        if (!byKey.has(doc.key)) byKey.set(doc.key, doc);
      }
    }

    const candidates = Array.from(byKey.values());
    if (candidates.length === 0) {
      return jsonResponse({ docs: [] }, 200);
    }

    type FuseRow = { key: string; title: string; authorsJoined: string; doc: OpenLibraryDoc };
    const rows: FuseRow[] = candidates.map((doc) => ({
      key: doc.key,
      title: doc.title?.trim() ?? "",
      authorsJoined: Array.isArray(doc.author_name) ? doc.author_name.join(" ") : "",
      doc,
    }));

    const fuse = new Fuse(rows, {
      keys: [
        { name: "title", weight: 0.55 },
        { name: "authorsJoined", weight: 0.45 },
      ],
      threshold: 0.42,
      ignoreLocation: true,
      includeScore: true,
    });

    const ranked = fuse.search(query);
    const topFive = ranked.slice(0, 5).map((r: any) => r.item.doc as OpenLibraryDoc);

    return jsonResponse({ docs: topFive }, 200);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to fetch results";
    return jsonResponse({ error: message }, 500);
  }
});

