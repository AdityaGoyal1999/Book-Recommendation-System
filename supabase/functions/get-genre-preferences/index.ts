// Edge Function to fetch a user's genre preferences from profiles.preferences_data (jsonb).

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

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("preferences_data")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("get-genre-preferences error", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch preferences" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }

  const preferencesData = data?.preferences_data ?? { genres: [] };

  return new Response(
    JSON.stringify({
      ok: true,
      preferences_data: preferencesData,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    }
  );
});
