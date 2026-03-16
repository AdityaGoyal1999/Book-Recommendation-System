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
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Home, LogOut, ImagePlus, Heart, Sliders } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function DashboardSidebar({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const [{ data: sessionData }, { data: { user: u } }] = await Promise.all([
        supabase.auth.getSession(),
        supabase.auth.getUser(),
      ]);

      setUser(u ?? null);

      const accessToken = sessionData.session?.access_token;
      if (!u || !accessToken) return;

      const { data, error: fnError } = await supabase.functions.invoke(
        "hello-world",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: { name: u.email ?? "dashboard user" },
        }
      );

      if (fnError) {
        console.error("hello-world error", fnError);
      } else {
        console.log("hello-world response", data);
      }
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
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {/* <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link href="/"><Home />Home</Link>}
                    tooltip="Home"
                  />
                </SidebarMenuItem> */}
                {/* <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link href="/dashboard"><LayoutDashboard />Dashboard</Link>}
                    isActive={pathname === "/dashboard"}
                    tooltip="Dashboard"
                  />
                </SidebarMenuItem> */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link href="/dashboard/new-image"><ImagePlus />New Image</Link>}
                    isActive={pathname === "/dashboard/new-image"}
                    tooltip="New Image"
                  />
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link href="/dashboard/favorites"><Heart />My favorites</Link>}
                    isActive={pathname === "/dashboard/favorites"}
                    tooltip="My favorites"
                  />
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link href="/dashboard/genre-preferences"><Sliders />Genre preferences</Link>}
                    isActive={pathname === "/dashboard/genre-preferences"}
                    tooltip="Genre preferences"
                  />
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex w-full items-center justify-between gap-2 overflow-hidden rounded-md p-2 group-data-[collapsible=icon]:justify-center">
            <Link
              href="/dashboard/profile"
              className="flex min-w-0 flex-1 items-center gap-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:flex-none group-data-[collapsible=icon]:justify-center"
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
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="shrink-0 text-sidebar-foreground bg-red-100 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden"
              aria-label="Log out"
            >
              <LogOut className="size-4" />
            </Button>
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
