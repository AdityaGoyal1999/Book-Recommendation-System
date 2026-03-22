"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useScanUsage() {
  const [numScans, setNumScans] = useState(0);
  const [isPro, setIsPro] = useState(false);

  const loadUsage = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user ?? null;
      if (!user?.id) return;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("is_pro, num_scans, created_at")
        .eq("id", user.id)
        .single();

      setIsPro(typeof profileData?.is_pro === "boolean" ? profileData.is_pro : false);
      setNumScans(typeof profileData?.num_scans === "number" ? profileData.num_scans : 0);
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    const run = () => {
      void loadUsage();
    };
    queueMicrotask(run);
  }, [loadUsage]);

  const limit = isPro ? 50 : 5;

  return { numScans, isPro, limit, loadUsage };
}
