"use client";

import { useEffect } from "react";
import { DASHBOARD_ONBOARDING_START_EVENT } from "@/lib/dashboard-onboarding-events";
import { startDashboardOnboarding } from "@/lib/dashboard-onboarding";

export function useDashboardOnboardingListener() {
  useEffect(() => {
    const handler = () => startDashboardOnboarding();
    window.addEventListener(DASHBOARD_ONBOARDING_START_EVENT, handler);
    return () => window.removeEventListener(DASHBOARD_ONBOARDING_START_EVENT, handler);
  }, []);
}
