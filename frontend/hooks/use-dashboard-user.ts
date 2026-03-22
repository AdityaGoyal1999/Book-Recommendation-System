"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export type DashboardProfileDetails = {
  createdAt: string | null;
  isPro: boolean | null;
};

export function useDashboardUser() {
  const [user, setUser] = useState<User | null>(null);
  const [profileDetails, setProfileDetails] = useState<DashboardProfileDetails>({
    createdAt: null,
    isPro: null,
  });

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: { user: u } } = await supabase.auth.getUser();

      setUser(u ?? null);
      if (!u?.id) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("created_at, is_pro")
        .eq("id", u.id)
        .single();

      setProfileDetails({
        createdAt: profile?.created_at ?? null,
        isPro: typeof profile?.is_pro === "boolean" ? profile.is_pro : null,
      });
    })();
  }, []);

  const displayName =
    user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "User";
  const email = user?.email ?? "";

  return { user, profileDetails, displayName, email };
}
