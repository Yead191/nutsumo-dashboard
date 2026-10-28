import { baseApi } from "../../api/baseApi";
import { setCredentials, setUser } from "./authSlice";
import type { AuthResponse, LoginPayload, AuthUser } from "./auth.types";

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
          const token =
            data?.data?.createToken ||
            data?.data?.accessToken ||
            data?.data?.token ||
            "";
          const user: AuthUser = data?.data?.user || {
            _id: data?.data?._id || "",
            name: data?.data?.name || "Administrator",
            email: data?.data?.email || "",
            role: data?.data?.role || "SUPER_ADMIN",
            status: "active",
            verified: data?.data?.verified ?? true,
          };

          if (token) {
            dispatch(setCredentials({ token, user }));
          }
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
