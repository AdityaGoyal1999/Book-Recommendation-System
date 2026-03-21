// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2?dts";

const ALLOWED_ORIGIN = Deno.env.get("SITE_URL") ?? "http://localhost:3000";

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

console.log("Hello from Functions!");

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Forward the browser's Authorization header to Supabase
  const authHeader = req.headers.get("Authorization") ?? "";

  const supabase = createClient(
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
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response(
      JSON.stringify({ error: "Not authenticated" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }

  const { name } = await req.json().catch(() => ({ name: user.email ?? "world" }));

  return new Response(
    JSON.stringify({ message: `Hello ${name}!` }),
    {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    }
  );
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/hello-world' \
    --header 'Authorization: Bearer <YOUR_ANON_KEY>' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
