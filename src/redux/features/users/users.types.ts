import type {
  UserRole,
  UserStatus,
  IdentityStatus,
  AvailabilityStatus,
} from "@/config";

export interface OfferedService {
  _id?: string;
  category:
    | {
        _id: string;
        name: string;
        image?: string;
  profileImage?: string;
      }
    | string;
  serviceName: string;
  rateType: "hourly" | "daily";
  rate: number;
  description?: string;
}

export interface ApiUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  verified: boolean;
  image?: string;
  profileImage?: string;
  phoneNumber?: string;
  location?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;

  // Artisan specific fields
  businessName?: string;
  trade?: string;
  bio?: string;
  experienceYears?: number;
  availabilityStatus?: AvailabilityStatus;
  services?: OfferedService[];
  idCardFront?: string;
  idCardBack?: string;
  selfie?: string;
  identityStatus?: IdentityStatus;
  identityRejectionReason?: string;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  role?: string;
  status?: string;
  identityStatus?: string;
  verified?: boolean;
  sort?: string;
}

export interface UsersListResponse {
  success: boolean;
  message: string;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  data: ApiUser[];
}

export interface SingleUserResponse {
  success: boolean;
  message: string;
  data: ApiUser;
}

export interface UserStatsResponse {
  success: boolean;
  message: string;
  data: {
    totalUsers: number;
    activeUsers: number;
    blockedUsers: number;
    pendingUsers: number;
    verifiedUsers: number;
    unverifiedUsers: number;
    regularUsers: number;
    artisans: number;
    vendors: number;
    admins: number;
    pendingVerifications: number;
    verifiedArtisans: number;
    newThisMonth: number;
  };
}

export interface ChangeStatusPayload {
  id: string;
  status?: UserStatus;
  rejectionReason?: string;
  identityStatus?: IdentityStatus;
  identityRejectionReason?: string;
}
