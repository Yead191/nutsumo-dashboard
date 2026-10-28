export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://10.10.26.173:5005/api/v1";

export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://10.10.26.173:5005";

export const TOKEN_KEY = "nutsumo_admin_token";
export const USER_KEY = "nutsumo_admin_user";

export const USER_ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  ARTISAN: "ARTISAN",
  USER: "USER",
  VENDOR: "VENDOR",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const USER_STATUS = {
  ACTIVE: "active",
  BLOCKED: "blocked",
  PENDING: "pending",
  REJECTED: "rejected",
} as const;

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

export const IDENTITY_STATUS = {
  NOT_SUBMITTED: "not_submitted",
  PENDING: "pending",
  VERIFIED: "verified",
  NEEDS_UPDATE: "needs_update",
} as const;

export type IdentityStatus = (typeof IDENTITY_STATUS)[keyof typeof IDENTITY_STATUS];

export const AVAILABILITY_STATUS = {
  AVAILABLE: "available",
  BOOKED: "booked",
  UNAVAILABLE: "unavailable",
} as const;

export type AvailabilityStatus = (typeof AVAILABILITY_STATUS)[keyof typeof AVAILABILITY_STATUS];
