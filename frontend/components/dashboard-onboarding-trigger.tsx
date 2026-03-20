"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function DashboardOnboardingTrigger() {
  const autoStartedRef = useRef(false);

  const handleStartOnboarding = () => {
    window.dispatchEvent(new Event("book:onboarding-start"));
  };

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
          window.dispatchEvent(new Event("book:onboarding-start"));
        }
      } catch {
        // Ignore
      }
    };

    void run();
  }, []);

  return (
    <div className="fixed right-4 top-3 z-50">
      <Button type="button" variant="outline" size="sm" onClick={handleStartOnboarding}>
        Start onboarding
      </Button>
    </div>
  );
}

