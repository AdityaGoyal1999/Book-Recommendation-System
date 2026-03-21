import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { DashboardOnboardingTrigger } from "@/components/dashboard-onboarding-trigger";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signup?mode=login");
  }

  return (
    <>
      <DashboardOnboardingTrigger />
      <DashboardSidebar>{children}</DashboardSidebar>
    </>
  );
}
