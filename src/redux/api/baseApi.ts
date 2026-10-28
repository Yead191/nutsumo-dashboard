import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";
import { API_BASE_URL, TOKEN_KEY } from "@/config";

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const stateToken = (getState() as RootState).auth?.token;
      const token = stateToken ?? localStorage.getItem(TOKEN_KEY);
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Users", "Artisans", "Categories", "Services", "ArtisanServices", "Stats", "Auth"],
  endpoints: () => ({}),
});
