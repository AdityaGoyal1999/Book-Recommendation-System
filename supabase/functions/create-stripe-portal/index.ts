import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2?dts";
import Stripe from "https://esm.sh/stripe@14?target=denonext";

const ALLOWED_ORIGIN = Deno.env.get("SITE_URL") ?? "http://localhost:3000";

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const stripeSecretKey =
    Deno.env.get("STRIPE_SECRET_KEY") ?? Deno.env.get("STRIPE_API_KEY");
  if (!stripeSecretKey) {
    console.error("STRIPE_SECRET_KEY or STRIPE_API_KEY not set");
    return jsonResponse({ error: "Stripe is not configured" }, 500);
  }

  const stripe = new Stripe(stripeSecretKey);

  const authHeader = req.headers.get("Authorization") ?? "";
  const supabaseUserClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    {
      global: { headers: { Authorization: authHeader } },
    }
  );

  const {
    data: { user },
    error: userError,
  } = await supabaseUserClient.auth.getUser();

  if (userError || !user) {
    return jsonResponse({ error: "Not authenticated" }, 401);
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("create-stripe-portal profile fetch error:", profileError);
    return jsonResponse({ error: "Failed to fetch profile" }, 500);
  }

  const stripeCustomerId = profile?.stripe_customer_id ?? null;
  if (!stripeCustomerId) {
    return jsonResponse(
      { error: "No billing account found. Subscribe first to access the customer portal." },
      400
    );
  }

  const siteUrl = Deno.env.get("SITE_URL");
  if (!siteUrl) {
    console.error("SITE_URL is not set");
    return jsonResponse({ error: "SITE_URL is not configured" }, 500);
  }
  const baseUrl = siteUrl.replace(/\/$/, "");

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${baseUrl}/dashboard/billing`,
    });

    return jsonResponse({
      ok: true,
      portal_url: session.url,
    });
  } catch (stripeError) {
    console.error("create-stripe-portal error:", stripeError);
    return jsonResponse(
      { error: "Failed to create portal session" },
      500
    );
  }
});
