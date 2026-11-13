import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { PageLoader } from "@/components/ui/PageLoader";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

// Lazy-loaded pages
const LoginPage = lazy(() => import("@/features/auth/LoginPage"));
const OverviewPage = lazy(() => import("@/features/overview/OverviewPage"));
const UsersPage = lazy(() => import("@/features/users/UsersPage"));
const UserDetailPage = lazy(() => import("@/features/users/UserDetailPage"));
const ArtisansPage = lazy(() => import("@/features/artisans/ArtisansPage"));
const ArtisanDetailPage = lazy(() => import("@/features/artisans/ArtisanDetailPage"));
const CategoriesPage = lazy(() => import("@/features/categories/CategoriesPage"));
const CategoryDetailPage = lazy(() => import("@/features/categories/CategoryDetailPage"));
const JobsPage = lazy(() => import("@/features/jobs/JobsPage"));
const BookingsPage = lazy(() => import("@/features/bookings/BookingsPage"));
const OfferingsPage = lazy(() => import("@/features/offerings/OfferingsPage"));
const ReviewsPage = lazy(() => import("@/features/reviews/ReviewsPage"));

export default function App() {
  return (
    <Suspense fallback={<PageLoader text="Loading Nutsumo Admin..." />}>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<OverviewPage />} />
            <Route path="jobs" element={<JobsPage />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="offerings" element={<OfferingsPage />} />
            <Route path="reviews" element={<ReviewsPage />} />

            {/* User Management */}
            <Route path="users" element={<UsersPage />} />
            <Route path="users/:id" element={<UserDetailPage />} />

            {/* Artisans & Verification */}
            <Route path="artisans" element={<ArtisansPage />} />
            <Route path="artisans/:id" element={<ArtisanDetailPage />} />

            {/* Service Categories */}
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="categories/:id" element={<CategoryDetailPage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
