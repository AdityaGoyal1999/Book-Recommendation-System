// @ts-nocheck
import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2?dts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    const authHeader = req.headers.get("Authorization") ?? "";

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
      error: userError,
    } = await supabaseUserClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Not authenticated" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const payload = (await req.json().catch(() => null)) as
      | { bucket_id?: string; object_path?: string; status?: string }
      | null;

    const bucketId = payload?.bucket_id?.trim();
    const objectPath = payload?.object_path?.trim();
    const status = payload?.status?.trim() || "pending";

    if (!bucketId || !objectPath) {
      return new Response(
        JSON.stringify({
          error: "Invalid payload, expected { bucket_id, object_path }",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: signed, error: signedError } = await supabaseAdmin.storage
      .from(bucketId)
      .createSignedUrl(objectPath, 300);

    if (signedError || !signed?.signedUrl) {
      console.error("image-processing signed URL error", signedError);
      return new Response(
        JSON.stringify({ error: "Failed to create signed URL for OCR" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const openAiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAiApiKey) {
      return new Response(
        JSON.stringify({ error: "Missing OPENAI_API_KEY secret" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const openAiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
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
                image_url: signed.signedUrl,
              },
            ],
          },
        ],
      }),
    });

    if (!openAiResponse.ok) {
      const errorText = await openAiResponse.text();
      console.error("image-processing OpenAI error", errorText);
      return new Response(
        JSON.stringify({ error: "OpenAI OCR request failed" }),
        {
          status: 502,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const openAiData = await openAiResponse.json();
    const responseText = getResponseText(openAiData);

    let detectedBooks: Array<{ title: string; author: string | null }> = [];
    if (responseText) {
      try {
        const parsed = JSON.parse(extractFirstJsonObject(responseText));
        const books = Array.isArray(parsed?.books) ? parsed.books : [];
        detectedBooks = books
          .map((book: any) => ({
            title: typeof book?.title === "string" ? book.title.trim() : "",
            author:
              typeof book?.author === "string" ? book.author.trim() : null,
          }))
          .filter((book: any) => book.title.length > 0);
      } catch (parseError) {
        console.error("image-processing OCR parse error", parseError);
      }
    }

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("scans")
      .insert({
        user_id: user.id,
        bucket_id: bucketId,
        object_path: objectPath,
        status,
        detected_books: detectedBooks,
        recommendations: [],
      })
      .select("id, user_id, bucket_id, object_path, status, created_at")
      .single();

    if (insertError) {
      console.error("image-processing insert error", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to create scan entry" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("image-processing created scan:", inserted);

    return new Response(
      JSON.stringify({
        message: "file uploaded",
        scan: inserted,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("Error in image-processing function:", error);

    return new Response(
      JSON.stringify({ error: "internal error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});

