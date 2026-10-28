import { baseApi } from "../../api/baseApi";
import type {
  ApiUser,
  ChangeStatusPayload,
  GetUsersParams,
  SingleUserResponse,
  UsersListResponse,
} from "../users/users.types";
import type { CatalogService } from "../categories/categories.types";

export interface ArtisanServiceItem {
  _id: string;
  artisan: string | ApiUser;
  service: CatalogService;
  rateAmount: number;
  rateType: "HOURLY" | "DAILY";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const artisansApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getArtisans: builder.query<UsersListResponse, GetUsersParams | void>({
      query: (params) => {
        const queryParams: Record<string, any> = {
          role: "ARTISAN",
          page: 1,
          limit: 10,
        };

        if (params) {
          if (params.page !== undefined) queryParams.page = params.page;
          if (params.limit !== undefined) queryParams.limit = params.limit;
          if (params.searchTerm && params.searchTerm.trim()) {
            queryParams.searchTerm = params.searchTerm.trim();
          }
          if (params.status && params.status !== "all") {
            queryParams.status = params.status;
          }
          if (params.identityStatus && params.identityStatus !== "all") {
            queryParams.identityStatus = params.identityStatus;
          }
          if (params.sort) {
            queryParams.sort = params.sort;
          }
        }

        return {
          url: "/user",
          method: "GET",
          params: queryParams,
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({
                type: "Artisans" as const,
                id: _id,
              })),
              { type: "Artisans", id: "LIST" },
            ]
          : [{ type: "Artisans", id: "LIST" }],
    }),

    getArtisanServices: builder.query<
      { success: boolean; data: ArtisanServiceItem[] },
      string
    >({
      query: (artisanId) => ({
        url: `/artisan-service/artisan/${artisanId}`,
        method: "GET",
      }),
      providesTags: (_res, _err, artisanId) => [
        { type: "ArtisanServices", id: artisanId },
      ],
    }),

    verifyArtisanIdentity: builder.mutation<
      SingleUserResponse,
      {
        id: string;
        decision: "approve" | "reject";
        reason?: string;
      }
    >({
      query: ({ id, decision, reason }) => {
        const isApproved = decision === "approve";
        return {
          url: `/user/change-status/${id}`,
          method: "PATCH",
          body: {
            identityStatus: isApproved ? "verified" : "needs_update",
            identityRejectionReason: isApproved
              ? ""
              : reason || "Please provide clearer document photos",
            status: isApproved ? "active" : undefined,
          },
        };
      },
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Artisans", id },
        { type: "Artisans", id: "LIST" },
        { type: "Users", id },
        { type: "Users", id: "LIST" },
        { type: "Stats", id: "USER_STATS" },
      ],
    }),
  }),
});

export const {
  useGetArtisansQuery,
  useGetArtisanServicesQuery,
  useVerifyArtisanIdentityMutation,
} = artisansApi;
