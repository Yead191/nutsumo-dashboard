import type { ComponentType } from "react";
import {
  BadgeCheck,
  Briefcase,
  Layers,
  LayoutDashboard,
  Receipt,
  Star,
  Wallet,
  Users,
  Wrench,
} from "lucide-react";

export interface NavItem {
  key: string;
  label: string;
  path: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
  badgeKey?: "pendingVerifications";
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Desk",
    items: [
      { key: "overview", label: "Overview", path: "/", icon: LayoutDashboard },
      { key: "jobs", label: "Jobs", path: "/jobs", icon: Briefcase },
      { key: "bookings", label: "Bookings", path: "/bookings", icon: Receipt },
      { key: "payouts", label: "Payouts", path: "/payouts", icon: Wallet },
    ],
  },
  {
    label: "People",
    items: [
      { key: "users", label: "People", path: "/users", icon: Users },
      {
        key: "artisans",
        label: "Artisans",
        path: "/artisans",
        icon: BadgeCheck,
        badgeKey: "pendingVerifications",
      },
    ],
  },
  {
    label: "Catalog",
    items: [
      { key: "categories", label: "Categories", path: "/categories", icon: Layers },
      { key: "offerings", label: "Custom services", path: "/offerings", icon: Wrench },
      { key: "reviews", label: "Reviews", path: "/reviews", icon: Star },
    ],
  },
];

export const PAGE_TITLES: Record<string, string> = {
  "/": "Overview",
  "/jobs": "Jobs",
  "/bookings": "Bookings",
  "/payouts": "Payouts",
  "/users": "People",
  "/artisans": "Artisans",
  "/categories": "Categories",
  "/offerings": "Custom services",
  "/reviews": "Reviews",
};

export function titleForPath(pathname: string) {
  if (pathname.startsWith("/users/")) return "Person";
  if (pathname.startsWith("/artisans/")) return "Artisan";
  if (pathname.startsWith("/categories/")) return "Category";
  const match = Object.keys(PAGE_TITLES)
    .filter((path) => path !== "/")
    .find((path) => pathname === path || pathname.startsWith(`${path}/`));
  if (match) return PAGE_TITLES[match];
  return pathname === "/" ? "Overview" : "Nutsumo";
}
