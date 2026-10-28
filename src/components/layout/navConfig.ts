import type { ComponentType } from "react";
import {
  DashboardOutlined,
  UserOutlined,
  IdcardOutlined,
  AppstoreOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

export interface NavItem {
  key: string;
  label: string;
  path: string;
  icon: ComponentType;
  badgeKey?: "pendingVerifications";
}

export const NAV_ITEMS: NavItem[] = [
  {
    key: "overview",
    label: "Overview",
    path: "/",
    icon: DashboardOutlined,
  },
  {
    key: "users",
    label: "User Management",
    path: "/users",
    icon: UserOutlined,
  },
  {
    key: "artisans",
    label: "Artisans & Verification",
    path: "/artisans",
    icon: SafetyCertificateOutlined,
    badgeKey: "pendingVerifications",
  },
  {
    key: "categories",
    label: "Service Categories",
    path: "/categories",
    icon: AppstoreOutlined,
  },
];
