import { baseApi } from "../../api/baseApi";
import type {
  CategoriesResponse,
  CreateCategoryPayload,
  CreateServicePayload,
  CatalogService,
  ServiceCategory,
  SingleCategoryResponse,
  SingleServiceResponse,
  ServicesResponse,
  UpdateCategoryPayload,
  UpdateServicePayload,
} from "./categories.types";

export const categoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Category Endpoints
    getCategories: builder.query<CategoriesResponse, { searchTerm?: string; all?: boolean } | void>({
      query: (params) => ({
        url: "/category",
        method: "GET",
        params: {
          ...(params?.searchTerm ? { searchTerm: params.searchTerm } : {}),
          all: "true",
        },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({
                type: "Categories" as const,
                id: _id,
              })),
              { type: "Categories", id: "LIST" },
            ]
          : [{ type: "Categories", id: "LIST" }],
    }),

    getCategoryById: builder.query<SingleCategoryResponse, string>({
      query: (id) => ({
        url: `/category/${id}`,
        method: "GET",
      }),
      providesTags: (_res, _err, id) => [{ type: "Categories", id }],
    }),

    createCategory: builder.mutation<SingleCategoryResponse, CreateCategoryPayload>({
      query: ({ imageFile, ...data }) => {
        if (imageFile) {
          const formData = new FormData();
          formData.append("image", imageFile);
          formData.append("name", data.name);
          if (data.description) formData.append("description", data.description);
          if (data.isActive !== undefined) formData.append("isActive", String(data.isActive));
          return {
            url: "/category",
            method: "POST",
            body: formData,
          };
        }
        return {
          url: "/category",
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: [{ type: "Categories", id: "LIST" }, { type: "Stats", id: "USER_STATS" }],
    }),

    updateCategory: builder.mutation<SingleCategoryResponse, UpdateCategoryPayload>({
      query: ({ id, imageFile, ...data }) => {
        if (imageFile) {
          const formData = new FormData();
          formData.append("image", imageFile);
          if (data.name) formData.append("name", data.name);
          if (data.description !== undefined) formData.append("description", data.description);
          if (data.isActive !== undefined) formData.append("isActive", String(data.isActive));
          return {
            url: `/category/${id}`,
            method: "PATCH",
            body: formData,
          };
        }
        return {
          url: `/category/${id}`,
          method: "PATCH",
          body: data,
        };
      },
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Categories", id },
        { type: "Categories", id: "LIST" },
      ],
    }),

    deleteCategory: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/category/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Categories", id: "LIST" }],
    }),

    // Service Catalog Endpoints
    getServices: builder.query<
      ServicesResponse,
      { category?: string; searchTerm?: string; all?: boolean } | void
    >({
      query: (params) => ({
        url: "/service",
        method: "GET",
        params: {
          ...(params?.category ? { category: params.category } : {}),
          ...(params?.searchTerm ? { searchTerm: params.searchTerm } : {}),
          all: "true",
        },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({
                type: "Services" as const,
                id: _id,
              })),
              { type: "Services", id: "LIST" },
            ]
          : [{ type: "Services", id: "LIST" }],
    }),

    getServiceById: builder.query<SingleServiceResponse, string>({
      query: (id) => ({
        url: `/service/${id}`,
        method: "GET",
      }),
      providesTags: (_res, _err, id) => [{ type: "Services", id }],
    }),

    createService: builder.mutation<SingleServiceResponse, CreateServicePayload>({
      query: ({ imageFile, ...data }) => {
        if (imageFile) {
          const formData = new FormData();
          formData.append("image", imageFile);
          formData.append("name", data.name);
          formData.append("category", data.category);
          if (data.description) formData.append("description", data.description);
          if (data.isActive !== undefined) formData.append("isActive", String(data.isActive));
          return {
            url: "/service",
            method: "POST",
            body: formData,
          };
        }
        return {
          url: "/service",
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: [
        { type: "Services", id: "LIST" },
        { type: "Categories", id: "LIST" },
      ],
    }),

    updateService: builder.mutation<SingleServiceResponse, UpdateServicePayload>({
      query: ({ id, imageFile, ...data }) => {
        if (imageFile) {
          const formData = new FormData();
          formData.append("image", imageFile);
          if (data.name) formData.append("name", data.name);
          if (data.category) formData.append("category", data.category);
          if (data.description !== undefined) formData.append("description", data.description);
          if (data.isActive !== undefined) formData.append("isActive", String(data.isActive));
          return {
            url: `/service/${id}`,
            method: "PATCH",
            body: formData,
          };
        }
        return {
          url: `/service/${id}`,
          method: "PATCH",
          body: data,
        };
      },
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Services", id },
        { type: "Services", id: "LIST" },
        { type: "Categories", id: "LIST" },
      ],
    }),

    deleteService: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/service/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Services", id: "LIST" },
        { type: "Categories", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetServicesQuery,
  useGetServiceByIdQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
} = categoriesApi;
