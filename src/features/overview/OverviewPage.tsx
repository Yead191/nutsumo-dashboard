import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";
import {
  BadgeCheck,
  Briefcase,
  Clock3,
  Layers,
  Receipt,
  Users,
  Wrench,
} from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusTag } from "@/components/ui/StatusTag";
import { PageHeader } from "@/components/ui/PageHeader";
import { useGetUserStatsQuery, useGetUsersQuery } from "@/redux/features/users/usersApi";
import { useGetCategoriesQuery } from "@/redux/features/categories/categoriesApi";
import { useGetArtisansQuery } from "@/redux/features/artisans/artisansApi";
import { useGetBookingsQuery, useGetJobsQuery, useGetOfferingsQuery } from "@/redux/features/operations/operationsApi";
import { formatDate, getInitials } from "@/lib/utils";
import { refName } from "@/lib/ref";

export default function OverviewPage() {
  const navigate = useNavigate();
  const { data: statsRes, isLoading: statsLoading } = useGetUserStatsQuery();
  const { data: categoriesRes } = useGetCategoriesQuery();
  const { data: pendingArtisansRes } = useGetArtisansQuery({
    identityStatus: "pending",
    limit: 5,
  });
  const { data: recentUsersRes } = useGetUsersQuery({ limit: 5, sort: "-createdAt" });
  const { data: openJobsRes } = useGetJobsQuery({ limit: 1, status: "OPEN" });
  const { data: payoutsRes } = useGetBookingsQuery({
    limit: 4,
    status: "COMPLETED",
    payoutStatus: "PENDING",
  });
  const { data: offeringsRes } = useGetOfferingsQuery({
    source: "CUSTOM",
    reviewStatus: "PENDING_REVIEW",
  });

  const stats = statsRes?.data;
  const pendingArtisans = Array.isArray(pendingArtisansRes?.data) ? pendingArtisansRes.data : [];
  const recentUsers = Array.isArray(recentUsersRes?.data) ? recentUsersRes.data : [];
  const payouts = payoutsRes?.data ?? [];
  const pendingOfferings = Array.isArray(offeringsRes?.data) ? offeringsRes.data.length : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="What needs a person"
        description="Identity, custom services, and completed jobs waiting for a payout. The rest of the marketplace is moving on its own."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Open jobs"
          value={openJobsRes?.pagination?.total ?? 0}
          icon={<Briefcase size={16} />}
          subtitle="Still accepting quotes"
          accentColor="bg-stone-100 text-stone-700"
          loading={statsLoading && !openJobsRes}
          onClick={() => navigate("/jobs")}
        />
        <StatCard
          title="Payouts to approve"
          value={payoutsRes?.pagination?.total ?? 0}
          icon={<Receipt size={16} />}
          subtitle="Completed, escrow ready to settle"
          accentColor="bg-rose-50 text-[#FE375D]"
          onClick={() => navigate("/bookings")}
        />
        <StatCard
          title="Identity queue"
          value={stats?.pendingVerifications ?? 0}
          icon={<Clock3 size={16} />}
          subtitle="NID and selfie still unread"
          accentColor="bg-amber-50 text-amber-700"
          loading={statsLoading}
          onClick={() => navigate("/artisans")}
        />
        <StatCard
          title="Custom services"
          value={pendingOfferings}
          icon={<Wrench size={16} />}
          subtitle="Live on profiles, waiting for the catalog"
          accentColor="bg-stone-100 text-stone-700"
          onClick={() => navigate("/offerings")}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MiniStat label="People" value={stats?.totalUsers ?? 0} icon={<Users size={14} />} onClick={() => navigate("/users")} />
        <MiniStat label="Artisans" value={stats?.artisans ?? 0} icon={<BadgeCheck size={14} />} onClick={() => navigate("/artisans")} />
        <MiniStat label="Verified" value={stats?.verifiedArtisans ?? 0} icon={<BadgeCheck size={14} />} onClick={() => navigate("/artisans")} />
        <MiniStat label="Categories" value={categoriesRes?.pagination?.total ?? categoriesRes?.data?.length ?? 0} icon={<Layers size={14} />} onClick={() => navigate("/categories")} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <GlassCard className="xl:col-span-1">
          <SectionTitle title="Payout queue" action="Bookings" onAction={() => navigate("/bookings")} />
          {payouts.length === 0 ? (
            <p className="py-8 text-sm text-stone-500">No completed booking is waiting on approval.</p>
          ) : (
            <ul className="divide-y divide-[#f0ebe3]">
              {payouts.map((booking) => (
                <li key={booking._id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm font-medium text-stone-900">{refName(booking.job)}</p>
                    <p className="text-xs text-stone-500">{refName(booking.artisan)}</p>
                  </div>
                  <Button size="small" onClick={() => navigate("/bookings")}>
                    Review
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>

        <GlassCard>
          <SectionTitle title="Identity" action="Artisans" onAction={() => navigate("/artisans")} />
          {pendingArtisans.length === 0 ? (
            <p className="py-8 text-sm text-stone-500">No identity packet is waiting.</p>
          ) : (
            <ul className="divide-y divide-[#f0ebe3]">
              {pendingArtisans.map((artisan) => (
                <li key={artisan._id}>
                  <button
                    type="button"
                    onClick={() => navigate(`/artisans/${artisan._id}`)}
                    className="flex w-full items-center justify-between gap-3 py-3 text-left"
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-[11px] font-semibold text-stone-700">
                        {getInitials(artisan.name)}
                      </span>
                      <span>
                        <span className="block text-sm font-medium text-stone-900">{artisan.name}</span>
                        <span className="block text-xs text-stone-500">
                          {artisan.trade || "Trade not set"}
                        </span>
                      </span>
                    </span>
                    <StatusTag status={artisan.identityStatus} type="identity" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>

        <GlassCard>
          <SectionTitle title="New accounts" action="People" onAction={() => navigate("/users")} />
          <ul className="divide-y divide-[#f0ebe3]">
            {recentUsers.map((user) => (
              <li key={user._id}>
                <button
                  type="button"
                  onClick={() => navigate(`/users/${user._id}`)}
                  className="flex w-full items-center justify-between gap-3 py-3 text-left"
                >
                  <span>
                    <span className="block text-sm font-medium text-stone-900">{user.name}</span>
                    <span className="block text-xs text-stone-500">{user.email}</span>
                  </span>
                  <span className="text-xs text-stone-500">{formatDate(user.createdAt)}</span>
                </button>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  icon,
  onClick,
}: {
  label: string;
  value: number;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-between rounded-xl border border-[#e7e2da] bg-white px-4 py-3 text-left"
    >
      <span>
        <span className="block text-xs text-stone-500">{label}</span>
        <span className="block text-lg font-semibold tabular-nums text-stone-900">{value}</span>
      </span>
      <span className="text-stone-400">{icon}</span>
    </button>
  );
}

function SectionTitle({
  title,
  action,
  onAction,
}: {
  title: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div className="mb-1 flex items-center justify-between">
      <h3 className="text-sm font-semibold text-stone-900">{title}</h3>
      <button type="button" onClick={onAction} className="text-xs font-medium text-[#FE375D]">
        {action}
      </button>
    </div>
  );
}
