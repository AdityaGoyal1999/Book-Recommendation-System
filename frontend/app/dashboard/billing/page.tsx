"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

function getMonthWindow(date: Date) {
  const start = new Date(date);
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  return { start, end };
}

function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function BillingPageContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPro, setIsPro] = useState<boolean | null>(null);
  const [nextBillingDate, setNextBillingDate] = useState<string | null>(null);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState<"success" | "canceled" | null>(null);

  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");
    if (success === "true") {
      setCheckoutMessage("success");
      window.history.replaceState({}, "", "/dashboard/billing");
    } else if (canceled === "true") {
      setCheckoutMessage("canceled");
      window.history.replaceState({}, "", "/dashboard/billing");
    }
  }, [searchParams]);

  async function handlePayments() {
    setPaymentsLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: fnError } = await supabase.functions.invoke("create-stripe-checkout");

      if (fnError) {
        setError(fnError.message || "Failed to start checkout.");
        return;
      }

      const checkoutUrl = data?.checkout_url;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        setError("No checkout URL received.");
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setPaymentsLoading(false);
    }
  }

  async function handleManageSubscription() {
    setPortalLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: fnError } = await supabase.functions.invoke("create-stripe-portal");

      if (fnError) {
        setError(fnError.message || "Failed to open customer portal.");
        return;
      }

      const portalUrl = data?.portal_url;
      if (portalUrl) {
        window.location.href = portalUrl;
      } else {
        setError("No portal URL received.");
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setPortalLoading(false);
    }
  }

  const { end } = useMemo(() => getMonthWindow(new Date()), []);

  const loadBilling = async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user ?? null;
      if (!user?.id) {
        setError("You must be signed in to view billing.");
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("is_pro, next_billing_date")
        .eq("id", user.id)
        .single();

      if (profileError) {
        setError(profileError.message || "Failed to load profile.");
        return;
      }

      setIsPro(typeof profileData?.is_pro === "boolean" ? profileData.is_pro : false);
      setNextBillingDate(
        typeof profileData?.next_billing_date === "string" ? profileData.next_billing_date : null
      );
    } catch {
      setError("Something went wrong while loading billing.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBilling();
  }, []);

  return (
    <div className="flex flex-1 flex-col px-4 py-8">
      <div className="mx-auto w-full max-w-2xl space-y-8">
        <div>
          <h1 className="font-sans text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Billing
          </h1>
        </div>

        {loading && (
          <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            Loading billing...
          </div>
        )}

        {checkoutMessage === "success" && (
          <div
            role="status"
            className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400"
          >
            Payment successful! Your subscription is now active.
          </div>
        )}
        {checkoutMessage === "canceled" && (
          <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            Checkout was canceled.
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Section 1: Current status */}
            <section className="space-y-3">
              <h2 className="flex items-center gap-2 font-sans text-lg font-semibold text-foreground">
                <CreditCard className="h-5 w-5" />
                Current plan
              </h2>
              <div className="rounded-xl border border-border bg-card p-5">
                {isPro ? (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Plan</p>
                        <p className="mt-1 text-base font-semibold text-foreground">Premium</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Cost</p>
                        <p className="mt-1 text-base font-semibold text-foreground">$5/month</p>
                      </div>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                      <p className="mt-1">
                        <span className="font-medium text-foreground">Cycle:</span> Monthly
                      </p>
                      <p className="mt-1">
                        <span className="font-medium text-foreground">Next renewal:</span>{" "}
                        {nextBillingDate
                          ? formatDate(new Date(nextBillingDate))
                          : formatDate(end)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Plan</p>
                    <p className="text-base font-semibold text-foreground">Free</p>
                    <p className="text-sm text-muted-foreground">
                      You are currently on the free plan. Upgrade to Premium for $5/month to get 50
                      scans per month.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Section 2: CTA */}
            <section className="space-y-3">
              {isPro ? (
                <div className="rounded-xl border border-border bg-card p-6">
                  <p className="text-sm font-medium text-foreground">Manage your subscription</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Update payment method, view invoices, or cancel your subscription.
                  </p>
                  <Button
                    className="mt-4"
                    onClick={handleManageSubscription}
                    disabled={portalLoading}
                  >
                    {portalLoading ? "Loading..." : "Manage subscription"}
                  </Button>
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-card p-6">
                  <p className="text-sm font-medium text-foreground">Upgrade to Premium</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Get 50 scans per month for $5/month. Cancel anytime.
                  </p>
                  <Button
                    className="mt-4"
                    onClick={handlePayments}
                    disabled={paymentsLoading}
                  >
                    {paymentsLoading ? "Loading..." : "Subscribe"}
                  </Button>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 flex-col px-4 py-8">
          <div className="mx-auto w-full max-w-2xl rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            Loading billing...
          </div>
        </div>
      }
    >
      <BillingPageContent />
    </Suspense>
  );
}
