"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Home, LogOut, ImagePlus, Heart, Sliders, History, Gauge, CreditCard } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export function DashboardSidebar({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [profileDetails, setProfileDetails] = useState<{
    createdAt: string | null;
    isPro: boolean | null;
  }>({ createdAt: null, isPro: null });
  const [profilePopupOpen, setProfilePopupOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const [{ data: sessionData }, { data: { user: u } }] = await Promise.all([
        supabase.auth.getSession(),
        supabase.auth.getUser(),
      ]);

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

  const displayName = user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "User";
  const email = user?.email ?? "";

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  useEffect(() => {
    const endOnboarding = () => {
      try {
        localStorage.setItem("book_onboarding_active", "false");
        localStorage.setItem("book_onboarding_completed", "true");
      } catch {
        // Ignore
      }
    };

    const startOnboarding = () => {
      // Allow starting even if a user previously completed, since this is explicit.
      try {
        localStorage.setItem("book_onboarding_active", "true");
        localStorage.setItem("book_onboarding_completed", "false");
      } catch {
        // Ignore
      }

      // Defer to ensure the sidebar elements are present.
      setTimeout(() => {
        driver({
          showProgress: false,
          allowClose: true,
          animate: true,
          onDestroyed: endOnboarding,
          steps: [
            {
              element: "#onboarding-favorites",
              popover: {
                title: "My favorites",
                description: "Save books you love so we can personalize your recommendations.",
              },
            },
            {
              element: "#onboarding-genre-preferences",
              popover: {
                title: "Genre preferences",
                description: "Pick broad categories you enjoy for more personalized recommendations.",
              },
            },
            {
              element: "#onboarding-new-image",
              popover: {
                title: "New Image",
                description: "Upload a photo of a shelf to generate recommendations.",
              },
            },
          ],
        }).drive();
      }, 0);
    };

    window.addEventListener("book:onboarding-start", startOnboarding);
    return () => window.removeEventListener("book:onboarding-start", startOnboarding);
  }, []);

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="border-b border-sidebar-border">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                  render={<Link href="/dashboard">
                    <Image src="/logo/vector/default-monochrome-black.svg" alt="What to read AI?" width={28} height={28} className="size-7 shrink-0 object-contain" />
                    <span>What to read AI?</span>
                  </Link>}
                tooltip="What to read AI?"
              />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="flex flex-1 flex-col min-h-0">
            <SidebarGroupContent className="flex flex-1 flex-col min-h-0">
              <SidebarMenu>
                <SidebarMenuItem
                  id="onboarding-favorites"
                >
                  <SidebarMenuButton
                    render={<Link href="/dashboard/favorites"><Heart />My favorites</Link>}
                    isActive={pathname === "/dashboard/favorites"}
                    tooltip="My favorites"
                  />
                </SidebarMenuItem>

                <SidebarMenuItem
                  id="onboarding-genre-preferences"
                >
                  <SidebarMenuButton
                    render={<Link href="/dashboard/genre-preferences"><Sliders />Genre preferences</Link>}
                    isActive={pathname === "/dashboard/genre-preferences"}
                    tooltip="Genre preferences"
                  />
                </SidebarMenuItem>

                <SidebarMenuItem
                  id="onboarding-new-image"
                >
                <SidebarMenuButton
                  render={<Link href="/dashboard/new-image"><ImagePlus />New Image</Link>}
                  isActive={pathname === "/dashboard/new-image"}
                  tooltip="New Image"
                />
              </SidebarMenuItem>

              
            </SidebarMenu>

              <div className="min-h-0 flex-1" aria-hidden />

              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link href="/dashboard/history"><History />History</Link>}
                    isActive={pathname === "/dashboard/history"}
                    tooltip="History"
                  />
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link href="/dashboard/usage"><Gauge />Usage</Link>}
                    isActive={pathname === "/dashboard/usage"}
                    tooltip="Usage"
                  />
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link href="/dashboard/billing"><CreditCard />Billing</Link>}
                    isActive={pathname === "/dashboard/billing"}
                    tooltip="Billing"
                  />
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="relative flex w-full items-center justify-between gap-2 overflow-visible rounded-md p-2 group-data-[collapsible=icon]:justify-center">
            <button
              type="button"
              onClick={() => setProfilePopupOpen((prev) => !prev)}
              className={cn(
                "flex min-w-0 flex-1 items-center gap-2 rounded-md text-left hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                "group-data-[collapsible=icon]:flex-none group-data-[collapsible=icon]:justify-center"
              )}
              title={displayName}
            >
              <Avatar className="size-8 shrink-0">
                <AvatarImage src={user?.user_metadata?.avatar_url} alt={displayName} />
                <AvatarFallback className="text-xs">
                  {displayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                <p className="truncate text-sm font-medium text-sidebar-foreground">
                  {displayName}
                </p>
                <p className="truncate text-xs text-sidebar-foreground/80">{email}</p>
              </div>
            </button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="shrink-0 text-sidebar-foreground bg-sidebar-accent hover:bg-red-100 hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden"
              aria-label="Log out"
            >
              <LogOut className="size-4" />
            </Button>

            {profilePopupOpen && (
              <div className="absolute inset-x-2 bottom-full z-50 mb-2 rounded-lg border border-sidebar-border bg-sidebar p-3 shadow-lg group-data-[collapsible=icon]:inset-x-auto group-data-[collapsible=icon]:left-full group-data-[collapsible=icon]:ml-2 group-data-[collapsible=icon]:w-64">
                <div className="flex items-center gap-3">
                  <Avatar className="size-10 shrink-0">
                    <AvatarImage src={user?.user_metadata?.avatar_url} alt={displayName} />
                    <AvatarFallback className="text-xs">
                      {displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-sidebar-foreground">{displayName}</p>
                    <p className="truncate text-xs text-sidebar-foreground/80">{email || "No email"}</p>
                  </div>
                </div>

                <div className="mt-3 space-y-1 text-xs text-sidebar-foreground/90">
                  <p>
                    Joined:{" "}
                    <span className="font-medium">
                      {profileDetails.createdAt
                        ? new Date(profileDetails.createdAt).toLocaleDateString()
                        : "Unknown"}
                    </span>
                  </p>
                  <p>
                    Pro status:{" "}
                    <span
                      className={cn(
                        "font-medium",
                        profileDetails.isPro === true && "text-emerald-600 dark:text-emerald-400",
                        profileDetails.isPro === false && "text-sidebar-foreground/80"
                      )}
                    >
                      {profileDetails.isPro === null ? "Unknown" : profileDetails.isPro ? "Pro" : "Free"}
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger />
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
