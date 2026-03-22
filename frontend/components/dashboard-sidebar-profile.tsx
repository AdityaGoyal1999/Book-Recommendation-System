"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";
import type { DashboardProfileDetails } from "@/hooks/use-dashboard-user";

type DashboardSidebarProfileProps = {
  user: User | null;
  profileDetails: DashboardProfileDetails;
  displayName: string;
  email: string;
  profilePopupOpen: boolean;
  onToggleProfile: () => void;
  onLogout: () => void;
};

export function DashboardSidebarProfile({
  user,
  profileDetails,
  displayName,
  email,
  profilePopupOpen,
  onToggleProfile,
  onLogout,
}: DashboardSidebarProfileProps) {
  return (
    <div className="relative flex w-full items-center justify-between gap-2 overflow-visible rounded-md p-2 group-data-[collapsible=icon]:justify-center">
      <button
        type="button"
        onClick={onToggleProfile}
        className={cn(
          "flex min-w-0 flex-1 items-center gap-2 rounded-md text-left hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          "group-data-[collapsible=icon]:flex-none group-data-[collapsible=icon]:justify-center"
        )}
        title={displayName}
      >
        <Avatar className="size-8 shrink-0">
          <AvatarImage src={user?.user_metadata?.avatar_url} alt={displayName} />
          <AvatarFallback className="text-xs">{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
          <p className="truncate text-sm font-medium text-sidebar-foreground">{displayName}</p>
          <p className="truncate text-xs text-sidebar-foreground/80">{email}</p>
        </div>
      </button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onLogout}
        className="shrink-0 bg-sidebar-accent text-sidebar-foreground hover:bg-red-100 hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden"
        aria-label="Log out"
      >
        <LogOut className="size-4" />
      </Button>

      {profilePopupOpen && (
        <div className="absolute inset-x-2 bottom-full z-50 mb-2 rounded-lg border border-sidebar-border bg-sidebar p-3 shadow-lg group-data-[collapsible=icon]:inset-x-auto group-data-[collapsible=icon]:left-full group-data-[collapsible=icon]:ml-2 group-data-[collapsible=icon]:w-64">
          <div className="flex items-center gap-3">
            <Avatar className="size-10 shrink-0">
              <AvatarImage src={user?.user_metadata?.avatar_url} alt={displayName} />
              <AvatarFallback className="text-xs">{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
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
  );
}
