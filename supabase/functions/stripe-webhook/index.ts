import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2?dts";
import Stripe from "https://esm.sh/stripe@14?target=denonext";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? Deno.env.get("STRIPE_API_KEY") ?? "");
const cryptoProvider = Stripe.createSubtleCryptoProvider();

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const signature = req.headers.get("Stripe-Signature");
  const signingSecret = Deno.env.get("STRIPE_WEBHOOK_SIGNING_SECRET");

  if (!signature || !signingSecret) {
    console.error("Missing Stripe-Signature or STRIPE_WEBHOOK_SIGNING_SECRET");
    return new Response("Webhook not configured", { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      signingSecret,
      undefined,
      cryptoProvider
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    console.error("Stripe webhook signature verification failed:", message);
    return new Response(message, { status: 400 });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;
        if (!userId) {
          console.warn("checkout.session.completed: no supabase_user_id in metadata");
          break;
        }
        const { error } = await supabaseAdmin
          .from("profiles")
          .update({
            is_pro: true,
            subscription_status: "active",
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);
        if (error) {
          console.error("checkout.session.completed profile update error:", error);
          return new Response("Database update failed", { status: 500 });
        }
        console.log(`checkout.session.completed: activated Pro for user ${userId}`);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const status = subscription.status;
        const isActive = status === "active" || status === "trialing";
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();
        if (!profile) {
          console.warn("customer.subscription.updated: no profile for customer", customerId);
          break;
        }
        const { error } = await supabaseAdmin
          .from("profiles")
          .update({
            is_pro: isActive,
            subscription_status: status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", profile.id);
        if (error) {
          console.error("customer.subscription.updated profile update error:", error);
          return new Response("Database update failed", { status: 500 });
        }
        console.log(`customer.subscription.updated: set is_pro=${isActive} for ${profile.id}`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();
        if (!profile) {
          console.warn("customer.subscription.deleted: no profile for customer", customerId);
          break;
        }
        const { error } = await supabaseAdmin
          .from("profiles")
          .update({
            is_pro: false,
            subscription_status: "canceled",
            updated_at: new Date().toISOString(),
          })
          .eq("id", profile.id);
        if (error) {
          console.error("customer.subscription.deleted profile update error:", error);
          return new Response("Database update failed", { status: 500 });
        }
        console.log(`customer.subscription.deleted: deactivated Pro for ${profile.id}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return new Response("Internal error", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
