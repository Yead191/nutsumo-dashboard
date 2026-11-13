import { baseApi } from "../../api/baseApi";
import { setCredentials, setUser } from "./authSlice";
import type { LoginPayload, AuthUser } from "./auth.types";
import { isDashboardRole } from "@/features/auth/roles";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<any, LoginPayload>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const payload = data?.data ?? {};
          const role = payload.user?.role || payload.role;
          const token = payload.createToken || payload.accessToken || payload.token || "";

          if (!token || !isDashboardRole(role)) {
            return;
          }

          const user: AuthUser = payload.user || {
            _id: payload._id || payload.id || "",
            name: payload.name || "Admin",
            email: payload.email || "",
            role,
            status: payload.status || "active",
            verified: payload.verified ?? true,
          };

          dispatch(setCredentials({ token, user }));
        } catch {
          // handled by caller
        }
      },
      invalidatesTags: ["Auth", "Stats"],
    }),

    getMe: builder.query<{ success: boolean; data: AuthUser }, void>({
      query: () => ({
        url: "/user/profile",
        method: "GET",
      }),
      providesTags: ["Auth"],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.data) {
            dispatch(setUser(data.data));
          }
        } catch {
          // ignore
        }
      },
    }),
  }),
});

export const { useLoginMutation, useGetMeQuery } = authApi;
