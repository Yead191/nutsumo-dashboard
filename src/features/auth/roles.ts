import { USER_ROLES } from "@/config";

const DASHBOARD_ROLES = new Set<string>([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]);

export function isDashboardRole(role?: string | null) {
  return Boolean(role && DASHBOARD_ROLES.has(role));
}

export function readTokenRole(token?: string | null) {
  if (!token) return null;
  const segment = token.split(".")[1];
  if (!segment) return null;

  try {
    const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const payload = JSON.parse(atob(padded)) as { role?: unknown };
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}
