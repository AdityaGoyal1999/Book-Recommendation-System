"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/client";
import { useDashboardUser } from "@/hooks/use-dashboard-user";
import { useDashboardOnboardingListener } from "@/hooks/use-dashboard-onboarding-listener";
import { DashboardDemoButton } from "@/components/dashboard-onboarding-trigger";
import { DashboardSidebarNav } from "@/components/dashboard-sidebar-nav";
import { DashboardSidebarProfile } from "@/components/dashboard-sidebar-profile";

export function DashboardSidebar({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profileDetails, displayName, email } = useDashboardUser();
  const [profilePopupOpen, setProfilePopupOpen] = useState(false);

  useDashboardOnboardingListener();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <SidebarProvider className="bg-background text-foreground">
      <Sidebar collapsible="icon">
        <SidebarHeader className="border-b border-sidebar-border">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                render={
                  <Link href="/dashboard">
                    <Image
                      src="/logo/vector/default-monochrome-black.svg"
                      alt="What to read AI?"
                      width={28}
                      height={28}
                      className="size-7 shrink-0 object-contain"
                    />
                    <span>What to read AI?</span>
                  </Link>
                }
                tooltip="What to read AI?"
              />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="flex min-h-0 flex-1 flex-col">
            <SidebarGroupContent className="flex min-h-0 flex-1 flex-col">
              <DashboardSidebarNav pathname={pathname} />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <DashboardSidebarProfile
            user={user}
            profileDetails={profileDetails}
            displayName={displayName}
            email={email}
            profilePopupOpen={profilePopupOpen}
            onToggleProfile={() => setProfilePopupOpen((prev) => !prev)}
            onLogout={handleLogout}
          />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border bg-background px-4">
          <SidebarTrigger />
          <div className="ml-auto flex items-center gap-2">
            <DashboardDemoButton />
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
