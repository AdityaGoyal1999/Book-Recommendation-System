"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { CreditCard, Gauge, Heart, History, ImagePlus, Sliders } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export type DashboardNavItem = {
  id: string;
  href: string;
  label: string;
  icon: ReactNode;
};

const primaryNav: DashboardNavItem[] = [
  { id: "onboarding-favorites", href: "/dashboard/favorites", label: "My favorites", icon: <Heart /> },
  {
    id: "onboarding-genre-preferences",
    href: "/dashboard/genre-preferences",
    label: "Genre preferences",
    icon: <Sliders />,
  },
  { id: "onboarding-new-image", href: "/dashboard/new-image", label: "New Image", icon: <ImagePlus /> },
];

const secondaryNav: DashboardNavItem[] = [
  { id: "onboarding-history", href: "/dashboard/history", label: "History", icon: <History /> },
  { id: "onboarding-usage", href: "/dashboard/usage", label: "Usage", icon: <Gauge /> },
  { id: "onboarding-billing", href: "/dashboard/billing", label: "Billing", icon: <CreditCard /> },
];

type DashboardSidebarNavProps = {
  pathname: string;
};

export function DashboardSidebarNav({ pathname }: DashboardSidebarNavProps) {
  return (
    <>
      <SidebarMenu>
        {primaryNav.map((item) => (
          <SidebarMenuItem key={item.id} id={item.id}>
            <SidebarMenuButton
              render={
                <Link href={item.href}>
                  {item.icon}
                  {item.label}
                </Link>
              }
              isActive={pathname === item.href}
              tooltip={item.label}
            />
          </SidebarMenuItem>
        ))}
      </SidebarMenu>

      <div className="min-h-0 flex-1" aria-hidden />

      <SidebarMenu>
        {secondaryNav.map((item) => (
          <SidebarMenuItem key={item.id} id={item.id}>
            <SidebarMenuButton
              render={
                <Link href={item.href}>
                  {item.icon}
                  {item.label}
                </Link>
              }
              isActive={pathname === item.href}
              tooltip={item.label}
            />
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </>
  );
}
