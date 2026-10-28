import type { UserRole, UserStatus } from "@/config";

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  profileImage?: string;
  phoneNumber?: string;
  verified?: boolean;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
}

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: AuthUser;
    accessToken?: string;
    token?: string;
  };
}
