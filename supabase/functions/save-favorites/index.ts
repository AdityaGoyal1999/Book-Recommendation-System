// Edge Function to save a user's favorite books into profiles.favorite_books (jsonb).

import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2?dts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization") ?? "";

  // Client bound to the caller's JWT – used only to discover the user id.
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

  const body = await req.json().catch(() => null) as
    | { books?: unknown }
    | null;

  console.log("save-favorites body", body);

  if (!body || !Array.isArray((body as any).books)) {
    return new Response(
      JSON.stringify({ error: "Invalid payload, expected { books: [...] }" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }

  const incomingBooks = (body as any).books as unknown[];

  // Admin client with service role key to write into profiles.
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Fetch existing favorites so we can append instead of overwrite.
  const { data: existingRow, error: fetchError } = await supabaseAdmin
    .from("profiles")
    .select("favorite_books")
    .eq("id", user.id)
    .single();

  if (fetchError) {
    console.error("save-favorites fetch error", fetchError);
    return new Response(
      JSON.stringify({ error: "Failed to read existing favorites" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }

  const existing: unknown[] = Array.isArray((existingRow as any)?.favorite_books)
    ? ((existingRow as any).favorite_books as unknown[])
    : [];

  // Naive append with simple de-duplication by key if present.
  const allBooks = [...existing, ...incomingBooks];
  const dedupedBooks = Array.from(
    new Map(
      allBooks.map((b: any, index) => {
        const key = b?.key ?? index;
        return [key, b];
      })
    ).values()
  );

  const { error: updateError } = await supabaseAdmin
    .from("profiles")
    .update({ favorite_books: dedupedBooks })
    .eq("id", user.id);

  if (updateError) {
    console.error("save-favorites update error", updateError);
    return new Response(
      JSON.stringify({ error: "Failed to save favorites" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }

  return new Response(
    JSON.stringify({
      ok: true,
      message: "Favorites saved",
      added: incomingBooks.length,
      total: dedupedBooks.length,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    }
  );
});

