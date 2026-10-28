import { useNavigate } from "react-router-dom";
import { Button, Table, Avatar, Tag } from "antd";
import {
  UserOutlined,
  SafetyCertificateOutlined,
  AppstoreOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined,
  PlusOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { StatCard } from "@/components/ui/StatCard";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusTag } from "@/components/ui/StatusTag";
import { useGetUserStatsQuery, useGetUsersQuery } from "@/redux/features/users/usersApi";
import { useGetCategoriesQuery } from "@/redux/features/categories/categoriesApi";
import { useGetArtisansQuery } from "@/redux/features/artisans/artisansApi";
import { formatDate, getInitials } from "@/lib/utils";

export default function OverviewPage() {
  const navigate = useNavigate();

  const { data: statsRes, isLoading: statsLoading } = useGetUserStatsQuery();
  const { data: categoriesRes } = useGetCategoriesQuery();
  const { data: pendingArtisansRes, isLoading: pendingLoading } = useGetArtisansQuery({
    identityStatus: "pending",
    limit: 5,
  });
  const { data: recentUsersRes, isLoading: usersLoading } = useGetUsersQuery({
    limit: 5,
    sort: "-createdAt",
  });

  const stats = statsRes?.data;
  const categoriesCount = categoriesRes?.data?.length ?? 0;
  const pendingArtisans: any[] = Array.isArray(pendingArtisansRes?.data) ? pendingArtisansRes.data : [];
  const recentUsers: any[] = Array.isArray(recentUsersRes?.data) ? recentUsersRes.data : [];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-80 h-full bg-[#FE375D]/15 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-rose-300 text-xs font-semibold mb-3 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-[#FE375D] animate-ping" />
            Nutsumo Real-Time Admin Console
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Welcome to Nutsumo Dashboard
          </h1>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            Monitor platform activity, verify artisan identity documents with live selfies, and manage service categories and rates.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              type="primary"
              icon={<SafetyCertificateOutlined />}
              onClick={() => navigate("/artisans")}
              className="bg-[#FE375D] hover:bg-[#e0284e] border-none font-semibold rounded-xl h-10 px-4"
            >
              Verify Artisans ({stats?.pendingVerifications ?? 0})
            </Button>
            <Button
              onClick={() => navigate("/categories")}
              icon={<PlusOutlined />}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-semibold rounded-xl h-10 px-4"
            >
              Manage Categories
            </Button>
          </div>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          title="Total Platform Users"
          value={stats?.totalUsers ?? 0}
          icon={<UserOutlined />}
          subtitle={`${stats?.newThisMonth ?? 0} joined this month`}
          accentColor="bg-blue-50 text-blue-600"
          loading={statsLoading}
          onClick={() => navigate("/users")}
        />

        <StatCard
          title="Registered Artisans"
          value={stats?.artisans ?? 0}
          icon={<SafetyCertificateOutlined />}
          subtitle={`${stats?.verifiedArtisans ?? 0} identity verified`}
          trend={`${stats?.verifiedArtisans ?? 0} Verified`}
          trendPositive={true}
          accentColor="bg-emerald-50 text-emerald-600"
          loading={statsLoading}
          onClick={() => navigate("/artisans")}
        />

        <StatCard
          title="Pending ID Verifications"
          value={stats?.pendingVerifications ?? 0}
          icon={<ClockCircleOutlined />}
          subtitle="Requires admin document review"
          trend={stats?.pendingVerifications ? "Needs Action" : "All Clear"}
          trendPositive={!stats?.pendingVerifications}
          accentColor="bg-rose-50 text-[#FE375D]"
          loading={statsLoading}
          onClick={() => navigate("/artisans")}
        />

        <StatCard
          title="Service Categories"
          value={categoriesCount}
          icon={<AppstoreOutlined />}
          subtitle="Available for artisan profiles"
          accentColor="bg-violet-50 text-violet-600"
          loading={statsLoading}
          onClick={() => navigate("/categories")}
        />
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Artisan Verifications */}
        <GlassCard className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Pending Identity Verifications
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Artisans awaiting NID & live selfie document approval
                </p>
              </div>
              <Button
                type="link"
                onClick={() => navigate("/artisans")}
                className="text-[#FE375D] font-semibold text-xs p-0"
              >
                View All <ArrowRightOutlined />
              </Button>
            </div>

            {pendingArtisans.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-sm">
                <CheckCircleOutlined className="text-3xl text-emerald-500 mb-2 block" />
                All artisan identity submissions have been reviewed!
              </div>
            ) : (
              <div className="space-y-3">
                {pendingArtisans.map((artisan) => (
                  <div
                    key={artisan._id}
                    onClick={() => navigate(`/artisans/${artisan._id}`)}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-100/80 transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        size={40}
                        src={artisan.image || artisan.profileImage}
                        className="bg-[#FE375D]/10 text-[#FE375D] font-semibold"
                      >
                        {getInitials(artisan.name)}
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 group-hover:text-[#FE375D] transition-colors">
                          {artisan.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {artisan.trade || "Tradesperson"} · {artisan.location || "Ghana"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusTag status={artisan.identityStatus} type="identity" />
                      <Button
                        size="small"
                        type="primary"
                        className="bg-[#FE375D] hover:bg-[#e0284e] border-none text-xs rounded-lg"
                      >
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </GlassCard>

        {/* Recent Platform Users */}
        <GlassCard className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Recent Platform Registrations
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Latest customers and artisans joining Nutsumo
                </p>
              </div>
              <Button
                type="link"
                onClick={() => navigate("/users")}
                className="text-[#FE375D] font-semibold text-xs p-0"
              >
                View All <ArrowRightOutlined />
              </Button>
            </div>

            <div className="space-y-3">
              {recentUsers.map((u) => (
                <div
                  key={u._id}
                  onClick={() => navigate(`/users/${u._id}`)}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-100/80 transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      size={40}
                      src={u.image || u.profileImage}
                      className="bg-slate-200 text-slate-700 font-semibold"
                    >
                      {getInitials(u.name)}
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 group-hover:text-[#FE375D] transition-colors">
                        {u.name}
                      </p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Tag
                      color={
                        u.role === "ARTISAN"
                          ? "magenta"
                          : u.role === "ADMIN"
                          ? "purple"
                          : "blue"
                      }
                    >
                      {u.role}
                    </Tag>
                    <StatusTag status={u.status} type="user" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
