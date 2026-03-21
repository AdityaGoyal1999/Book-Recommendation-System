// Edge Function to save a user's genre preferences (stub: returns success message only).

import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2?dts";

const ALLOWED_ORIGIN = Deno.env.get("SITE_URL") ?? "http://localhost:3000";

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
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

  const body = (await req.json().catch(() => null)) as { genres?: unknown } | null;
  const genres = Array.isArray(body?.genres)
    ? body.genres.filter((g): g is string => typeof g === "string")
    : [];

  const preferencesData = { genres };

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { error: updateError } = await supabaseAdmin
    .from("profiles")
    .update({
      preferences_data: preferencesData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (updateError) {
    console.error("save-genre-preferences update error", updateError);
    return new Response(
      JSON.stringify({ error: "Failed to save preferences" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }

  return new Response(
    JSON.stringify({ message: "Preferences saved" }),
    {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    }
  );
});
