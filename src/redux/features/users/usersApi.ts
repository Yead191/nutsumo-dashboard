import { baseApi } from "../../api/baseApi";
import type {
  ApiUser,
  ChangeStatusPayload,
  GetUsersParams,
  SingleUserResponse,
  UsersListResponse,
  UserStatsResponse,
} from "./users.types";

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserStats: builder.query<UserStatsResponse, void>({
      query: () => ({
        url: "/user/stats",
        method: "GET",
      }),
      providesTags: [{ type: "Stats", id: "USER_STATS" }],
    }),

    getUsers: builder.query<UsersListResponse, GetUsersParams | void>({
      query: (params) => {
        const queryParams: Record<string, any> = {
          page: 1,
          limit: 10,
        };

        if (params) {
          if (params.page !== undefined) queryParams.page = params.page;
          if (params.limit !== undefined) queryParams.limit = params.limit;
          if (params.searchTerm && params.searchTerm.trim()) {
            queryParams.searchTerm = params.searchTerm.trim();
          }
          if (params.role && params.role !== "all") {
            queryParams.role = params.role;
          }
          if (params.status && params.status !== "all") {
            queryParams.status = params.status;
          }
          if (params.identityStatus && params.identityStatus !== "all") {
            queryParams.identityStatus = params.identityStatus;
          }
          if (params.verified !== undefined) {
            queryParams.verified = params.verified;
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
              ...result.data?.map(({ _id }) => ({
                type: "Users" as const,
                id: _id,
              })),
              { type: "Users", id: "LIST" },
            ]
          : [{ type: "Users", id: "LIST" }],
    }),

    getUserById: builder.query<SingleUserResponse, string>({
      query: (id) => ({
        url: `/user/${id}`,
        method: "GET",
      }),
      providesTags: (_res, _err, id) => [
        { type: "Users", id },
        { type: "Artisans", id },
      ],
    }),

    changeUserStatus: builder.mutation<SingleUserResponse, ChangeStatusPayload>(
      {
        query: ({ id, ...body }) => ({
          url: `/user/change-status/${id}`,
          method: "PATCH",
          body,
        }),
        invalidatesTags: (_res, _err, { id }) => [
          { type: "Users", id },
          { type: "Users", id: "LIST" },
          { type: "Artisans", id },
          { type: "Artisans", id: "LIST" },
          { type: "Stats", id: "USER_STATS" },
        ],
      },
    ),

    deleteUser: builder.mutation<{ success: boolean; message: string }, string>(
      {
        query: (id) => ({
          url: `/user/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: [
          { type: "Users", id: "LIST" },
          { type: "Artisans", id: "LIST" },
          { type: "Stats", id: "USER_STATS" },
        ],
      },
    ),
  }),
});

export const {
  useGetUserStatsQuery,
  useGetUsersQuery,
  useGetUserByIdQuery,
  useChangeUserStatusMutation,
  useDeleteUserMutation,
} = usersApi;
