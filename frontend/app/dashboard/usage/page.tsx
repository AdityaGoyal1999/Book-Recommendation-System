"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FreeUsageCard, ProUsageCard } from "@/components/usage-cards";

function getMonthWindow(date: Date) {
  const start = new Date(date);
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  return { start, end };
}

export default function UsagePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPro, setIsPro] = useState<boolean | null>(null);
  const [numScans, setNumScans] = useState<number>(0);

  const { start, end } = useMemo(() => getMonthWindow(new Date()), []);

  useEffect(() => {
    const loadUsage = async () => {
      setLoading(true);
      setError(null);

      try {
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user ?? null;
        if (!user?.id) {
          setError("You must be signed in to view usage.");
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("is_pro, num_scans")
          .eq("id", user.id)
          .single();

        if (profileError) {
          setError(profileError.message || "Failed to load profile.");
          return;
        }

        setIsPro(typeof profileData?.is_pro === "boolean" ? profileData.is_pro : false);
        setNumScans(typeof profileData?.num_scans === "number" ? profileData.num_scans : 0);
      } catch {
        setError("Something went wrong while loading usage.");
      } finally {
        setLoading(false);
      }
    };

    void loadUsage();
  }, []);

  return (
    <div className="flex flex-1 flex-col px-4 py-8">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <div>
          <h1 className="font-sans text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Usage
          </h1>
        </div>

        {loading && (
          <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            Loading usage...
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
          isPro ? (
            <ProUsageCard used={numScans} renewsOn={end} />
          ) : (
            <FreeUsageCard used={numScans} resetOn={end} />
          )
        )}
      </div>
    </div>
  );
}

