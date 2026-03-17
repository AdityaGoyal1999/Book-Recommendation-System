// @ts-nocheck
import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2?dts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type Book = { title: string; author: string | null };
type Recommendation = { title: string; author: string | null; reason?: string };

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

function extractFirstJsonObject(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fenced?.[1]?.trim() ?? trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    return candidate;
  }
  return candidate.slice(start, end + 1);
}

function getResponseText(openAiData: any): string {
  if (typeof openAiData?.output_text === "string" && openAiData.output_text.trim()) {
    return openAiData.output_text.trim();
  }

  const chunks = openAiData?.output ?? [];
  const textParts: string[] = [];
  for (const chunk of chunks) {
    for (const content of chunk?.content ?? []) {
      if (content?.type === "output_text" && typeof content?.text === "string") {
        textParts.push(content.text);
      }
    }
  }
  return textParts.join("\n").trim();
}

function normalizeBooks(raw: unknown): Book[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((book: any) => ({
      title: typeof book?.title === "string" ? book.title.trim() : "",
      author: typeof book?.author === "string" ? book.author.trim() : null,
    }))
    .filter((book) => book.title.length > 0);
}

function normalizeRecommendations(raw: unknown): Recommendation[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((book: any) => ({
      title: typeof book?.title === "string" ? book.title.trim() : "",
      author: typeof book?.author === "string" ? book.author.trim() : null,
      reason: typeof book?.reason === "string" ? book.reason.trim() : undefined,
    }))
    .filter((book) => book.title.length > 0)
    .slice(0, 5);
}

async function fetchOpenAiJson({
  apiKey,
  model,
  input,
}: {
  apiKey: string;
  model: string;
  input: unknown[];
}) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, input }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed: ${errorText}`);
  }

  const data = await response.json();
  const text = getResponseText(data);
  if (!text) return {};

  try {
    return JSON.parse(extractFirstJsonObject(text));
  } catch {
    return {};
  }
}

async function getAuthenticatedUser(authHeader: string) {
  const supabaseUserClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    {
      global: {
        headers: { Authorization: authHeader },
      },
    }
  );

  const {
    data: { user },
    error,
  } = await supabaseUserClient.auth.getUser();

  if (error || !user) {
    throw new Error("Not authenticated");
  }

  return user;
}

function getAdminClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

async function createImageSignedUrl(
  supabaseAdmin: ReturnType<typeof createClient>,
  bucketId: string,
  objectPath: string
) {
  const { data, error } = await supabaseAdmin.storage
    .from(bucketId)
    .createSignedUrl(objectPath, 300);
  if (error || !data?.signedUrl) {
    throw new Error("Failed to create signed URL for OCR");
  }
  return data.signedUrl;
}

async function detectBooksFromImage({
  openAiApiKey,
  signedImageUrl,
}: {
  openAiApiKey: string;
  signedImageUrl: string;
}): Promise<Book[]> {
  const parsed = await fetchOpenAiJson({
    apiKey: openAiApiKey,
    model: "gpt-4.1-mini",
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text:
              "Extract visible book titles and authors from this image. " +
              "Return strict JSON only with this schema: " +
              '{"books":[{"title":"string","author":"string|null"}]}.',
          },
          {
            type: "input_image",
            image_url: signedImageUrl,
          },
        ],
      },
    ],
  });

  return normalizeBooks(parsed?.books);
}

async function getUserReadingContext(
  supabaseAdmin: ReturnType<typeof createClient>,
  userId: string
) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("favorite_books, preferences_data")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error("Failed to fetch user profile context");
  }

  const rawFavorites = Array.isArray(data?.favorite_books)
    ? data.favorite_books
    : [];
  const favoriteBooks = rawFavorites
    .map((book: any) => ({
      title:
        (typeof book?.title === "string" && book.title.trim()) ||
        (typeof book?.name === "string" && book.name.trim()) ||
        "",
      author:
        (typeof book?.author === "string" && book.author.trim()) ||
        (typeof book?.authors === "string" && book.authors.trim()) ||
        null,
    }))
    .filter((book: any) => book.title.length > 0);

  const genres = Array.isArray(data?.preferences_data?.genres)
    ? data.preferences_data.genres.filter((g: unknown): g is string => typeof g === "string")
    : [];

  return { favoriteBooks, genres };
}

async function generateRecommendations({
  openAiApiKey,
  detectedBooks,
  favoriteBooks,
  genres,
}: {
  openAiApiKey: string;
  detectedBooks: Book[];
  favoriteBooks: Array<{ title: string; author: string | null }>;
  genres: string[];
}): Promise<Recommendation[]> {
  if (detectedBooks.length === 0) return [];

  const parsed = await fetchOpenAiJson({
    apiKey: openAiApiKey,
    model: "gpt-4.1-mini",
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text:
              "You are a book recommendation engine. " +
              "Given detected books from a shelf, the user's favorite books, and preferred genres, " +
              "recommend up to 5 books this user is most likely to love. " +
              "Return STRICT JSON only in this schema: " +
              '{"books":[{"title":"string","author":"string|null","reason":"string"}]}. ' +
              "Maximum 5 books.\n\n" +
              `Detected books: ${JSON.stringify(detectedBooks)}\n` +
              `Favorite books: ${JSON.stringify(favoriteBooks)}\n` +
              `Preferred genres: ${JSON.stringify(genres)}`,
          },
        ],
      },
    ],
  });

  return normalizeRecommendations(parsed?.books);
}

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    const user = await getAuthenticatedUser(authHeader);

    const payload = (await req.json().catch(() => null)) as
      | { bucket_id?: string; object_path?: string; status?: string }
      | null;

    const bucketId = payload?.bucket_id?.trim();
    const objectPath = payload?.object_path?.trim();
    const status = payload?.status?.trim() || "pending";

    if (!bucketId || !objectPath) {
      return jsonResponse(
        { error: "Invalid payload, expected { bucket_id, object_path }" },
        400
      );
    }

    const supabaseAdmin = getAdminClient();
    const signedImageUrl = await createImageSignedUrl(
      supabaseAdmin,
      bucketId,
      objectPath
    );

    const openAiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAiApiKey) {
      return jsonResponse({ error: "Missing OPENAI_API_KEY secret" }, 500);
    }

    const detectedBooks = await detectBooksFromImage({
      openAiApiKey,
      signedImageUrl,
    });

    const { favoriteBooks, genres } = await getUserReadingContext(
      supabaseAdmin,
      user.id
    );

    const recommendations = await generateRecommendations({
      openAiApiKey,
      detectedBooks,
      favoriteBooks,
      genres,
    });

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("scans")
      .insert({
        user_id: user.id,
        bucket_id: bucketId,
        object_path: objectPath,
        status,
        detected_books: detectedBooks,
        recommendations,
      })
      .select("id, user_id, bucket_id, object_path, status, created_at")
      .single();

    if (insertError) {
      console.error("image-processing insert error", insertError);
      return jsonResponse({ error: "Failed to create scan entry" }, 500);
    }

    console.log("image-processing created scan:", inserted);

    return jsonResponse(
      {
        message: "file uploaded",
        scan: inserted,
      },
      200
    );
  } catch (error) {
    console.error("Error in image-processing function:", error);

    if (error instanceof Error && error.message === "Not authenticated") {
      return jsonResponse({ error: "Not authenticated" }, 401);
    }

    return jsonResponse({ error: "internal error" }, 500);
  }
});

