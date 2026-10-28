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
