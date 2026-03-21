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
    console.error("create-stripe-checkout profile fetch error:", profileError);
    return jsonResponse({ error: "Failed to fetch profile" }, 500);
  }

  let stripeCustomerId = profile?.stripe_customer_id ?? null;

  if (!stripeCustomerId) {
    try {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      stripeCustomerId = customer.id;

      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({
          stripe_customer_id: stripeCustomerId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        console.error("create-stripe-checkout profile update error:", updateError);
        return jsonResponse(
          { error: "Failed to save Stripe customer ID to profile" },
          500
        );
      }
    } catch (stripeError) {
      console.error("create-stripe-checkout Stripe error:", stripeError);
      return jsonResponse(
        { error: "Failed to create Stripe customer" },
        500
      );
    }
  }

  const priceId = Deno.env.get("STRIPE_PRICE_ID");
  if (!priceId) {
    console.error("STRIPE_PRICE_ID not set");
    return jsonResponse({ error: "Stripe price is not configured" }, 500);
  }

  const siteUrl = Deno.env.get("SITE_URL");
  if (!siteUrl) {
    console.error("SITE_URL is not set");
    return jsonResponse({ error: "SITE_URL is not configured" }, 500);
  }
  const baseUrl = siteUrl.replace(/\/$/, "");

  try {
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/dashboard/billing?success=true`,
      cancel_url: `${baseUrl}/dashboard/billing?canceled=true`,
      metadata: {
        supabase_user_id: user.id,
      },
    });

    return jsonResponse({
      ok: true,
      stripe_customer_id: stripeCustomerId,
      checkout_url: session.url,
    });
  } catch (stripeError) {
    console.error("create-stripe-checkout Checkout Session error:", stripeError);
    return jsonResponse(
      { error: "Failed to create checkout session" },
      500
    );
  }
});
