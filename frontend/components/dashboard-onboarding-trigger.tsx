"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { DASHBOARD_ONBOARDING_START_EVENT } from "@/lib/dashboard-onboarding-events";

/** Auto-starts the product tour for users who are not yet onboarded (invokes edge function once). */
function useDashboardOnboardingAutoStart() {
  const autoStartedRef = useRef(false);

  useEffect(() => {
    if (autoStartedRef.current) return;

    const run = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.functions.invoke("get-onboarding-status");
        if (error) return;

        const isOnboarded = data?.is_onboarded === true;
        if (!isOnboarded) {
          autoStartedRef.current = true;
          window.dispatchEvent(new Event(DASHBOARD_ONBOARDING_START_EVENT));
        }
      } catch {
        // Ignore
      }
    };

    void run();
  }, []);
}

export function DashboardDemoButton() {
  useDashboardOnboardingAutoStart();

  const handleStartOnboarding = () => {
    window.dispatchEvent(new Event(DASHBOARD_ONBOARDING_START_EVENT));
  };

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleStartOnboarding}>
      Demo App
    </Button>
  );
}
