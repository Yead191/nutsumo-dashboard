import { baseApi } from "../../api/baseApi";

export interface PageMeta {
  total: number;
  page: number;
  limit: number;
  totalPage?: number;
}

export interface ListResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination?: PageMeta;
}

export interface ItemResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface NamedRef {
  _id: string;
  name?: string;
  email?: string;
  title?: string;
  image?: string;
}

export interface JobRecord {
  _id: string;
  title: string;
  description?: string;
  status: string;
  location?: string;
  postCode?: string;
  budget?: number;
  customServiceName?: string;
  preferredDate?: string;
  createdAt?: string;
  customer?: NamedRef | string;
  category?: NamedRef | string;
  service?: NamedRef | string;
}

export interface QuotationRecord {
  _id: string;
  proposedAmount?: number;
  rateType?: string;
  estimatedDuration?: string;
  message?: string;
  status?: string;
  createdAt?: string;
  artisan?: NamedRef | string;
}

export interface WithdrawalRecord {
  _id: string;
  amount: number;
  status: "REQUESTED" | "PROCESSING" | "PAID" | "FAILED";
  method: "BANK" | "MOMO" | "STRIPE";
  reference?: string;
  failureReason?: string;
  createdAt?: string;
  destination?: {
    accountName?: string;
    bankName?: string;
    accountNumber?: string;
    momoNetwork?: string;
    momoNumber?: string;
  };
  artisan?: NamedRef | string;
}

export interface BookingRecord {
  _id: string;
  bookingNumber?: string;
  status: string;
  paymentStatus?: string;
  payoutStatus?: string;
  totalAmount?: number;
  artisanPayoutAmount?: number;
  platformFee?: number;
  createdAt?: string;
  notes?: string;
  job?: NamedRef | string;
  customer?: NamedRef | string;
  artisan?: NamedRef | string;
}

export interface OfferingRecord {
  _id: string;
  source?: "CATALOG" | "CUSTOM";
  customName?: string;
  proposedCategory?: string;
  reviewStatus?: string;
  rejectionReason?: string;
  rateAmount?: number;
  rateType?: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  artisan?: NamedRef | string;
  category?: NamedRef | string;
  service?: (NamedRef & { category?: NamedRef | string }) | string;
}

export interface ReviewRecord {
  _id: string;
  rating?: number;
  comment?: string;
  status?: string;
  createdAt?: string;
  customer?: NamedRef | string;
  artisan?: NamedRef | string;
  job?: NamedRef | string;
  reply?: { comment?: string; repliedAt?: string };
}

export const operationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getJobs: builder.query<
      ListResponse<JobRecord>,
      { page?: number; limit?: number; searchTerm?: string; status?: string } | void
    >({
      query: (params) => ({
        url: "/job",
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 12,
          ...(params?.searchTerm ? { searchTerm: params.searchTerm } : {}),
          ...(params?.status ? { status: params.status } : {}),
          sort: "-createdAt",
        },
      }),
      providesTags: [{ type: "Jobs", id: "LIST" }],
    }),
    getJob: builder.query<ItemResponse<JobRecord>, string>({
      query: (id) => ({ url: `/job/${id}` }),
      providesTags: (_r, _e, id) => [{ type: "Jobs", id }],
    }),
    getJobQuotations: builder.query<ListResponse<QuotationRecord>, string>({
      query: (jobId) => ({
        url: `/quotation/job/${jobId}`,
        params: { limit: 20, sort: "-createdAt" },
      }),
    }),
    getBookings: builder.query<
      ListResponse<BookingRecord>,
      {
        page?: number;
        limit?: number;
        searchTerm?: string;
        status?: string;
        paymentStatus?: string;
        payoutStatus?: string;
      } | void
    >({
      query: (params) => ({
        url: "/booking/admin/all",
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 12,
          sort: "-createdAt",
          ...(params?.searchTerm ? { searchTerm: params.searchTerm } : {}),
          ...(params?.status ? { status: params.status } : {}),
          ...(params?.paymentStatus ? { paymentStatus: params.paymentStatus } : {}),
          ...(params?.payoutStatus ? { payoutStatus: params.payoutStatus } : {}),
        },
      }),
      providesTags: [{ type: "Bookings", id: "LIST" }],
    }),
    approvePayout: builder.mutation<ItemResponse<BookingRecord>, { id: string; notes?: string }>({
      query: ({ id, notes }) => ({
        url: `/booking/${id}/approve-payout`,
        method: "PATCH",
        body: { notes },
      }),
      invalidatesTags: [{ type: "Bookings", id: "LIST" }],
    }),
    releasePayout: builder.mutation<
      ItemResponse<BookingRecord>,
      { id: string; payoutMethod?: "MANUAL_BANK" | "STRIPE_TRANSFER" | "WALLET"; notes?: string }
    >({
      query: ({ id, payoutMethod, notes }) => ({
        url: `/booking/${id}/release-payout`,
        method: "PATCH",
        body: { payoutMethod, notes },
      }),
      invalidatesTags: [{ type: "Bookings", id: "LIST" }],
    }),
    getOfferings: builder.query<
      ListResponse<OfferingRecord>,
      { source?: string; reviewStatus?: string } | void
    >({
      query: (params) => ({
        url: "/artisan-service",
        params: {
          ...(params?.source ? { source: params.source } : {}),
          ...(params?.reviewStatus ? { reviewStatus: params.reviewStatus } : {}),
        },
      }),
      providesTags: [{ type: "ArtisanServices", id: "LIST" }],
    }),
    reviewOffering: builder.mutation<
      ItemResponse<OfferingRecord>,
      { id: string; decision: "APPROVE" | "REJECT"; reason?: string }
    >({
      query: ({ id, decision, reason }) => ({
        url: `/artisan-service/${id}/review`,
        method: "PATCH",
        body: { decision, ...(reason ? { reason } : {}) },
      }),
      invalidatesTags: [{ type: "ArtisanServices", id: "LIST" }],
    }),
    getWithdrawals: builder.query<
      ListResponse<WithdrawalRecord>,
      { page?: number; limit?: number; status?: string } | void
    >({
      query: (params) => ({
        url: "/wallet/withdrawals",
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 12,
          ...(params?.status ? { status: params.status } : {}),
        },
      }),
      providesTags: [{ type: "Withdrawals", id: "LIST" }],
    }),
    settleWithdrawal: builder.mutation<
      ItemResponse<WithdrawalRecord>,
      { id: string; decision: "PAID" | "FAILED"; reference?: string; reason?: string }
    >({
      query: ({ id, decision, reference, reason }) => ({
        url: `/wallet/withdrawals/${id}/settle`,
        method: "PATCH",
        body: { decision, ...(reference ? { reference } : {}), ...(reason ? { reason } : {}) },
      }),
      invalidatesTags: [{ type: "Withdrawals", id: "LIST" }],
    }),
    getReviews: builder.query<
      ListResponse<ReviewRecord>,
      { page?: number; limit?: number; searchTerm?: string; rating?: number; status?: string } | void
    >({
      query: (params) => ({
        url: "/review/admin/all",
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 12,
          sort: "-createdAt",
          ...(params?.searchTerm ? { searchTerm: params.searchTerm } : {}),
          ...(params?.rating ? { rating: params.rating } : {}),
          ...(params?.status ? { status: params.status } : {}),
        },
      }),
      providesTags: [{ type: "Reviews", id: "LIST" }],
    }),
  }),
});

export const {
  useGetJobsQuery,
  useGetJobQuery,
  useGetJobQuotationsQuery,
  useGetBookingsQuery,
  useApprovePayoutMutation,
  useReleasePayoutMutation,
  useGetOfferingsQuery,
  useReviewOfferingMutation,
  useGetReviewsQuery,
  useGetWithdrawalsQuery,
  useSettleWithdrawalMutation,
} = operationsApi;
