import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Input,
  Select,
  Segmented,
  Button,
  Avatar,
  Tag,
  Dropdown,
  type MenuProps,
  type TableProps,
  Badge,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  EyeOutlined,
  MoreOutlined,
  CheckCircleOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusTag } from "@/components/ui/StatusTag";
import { EmptyState } from "@/components/ui/EmptyState";
import { IdentityVerificationModal } from "./components/IdentityVerificationModal";
import { useGetArtisansQuery } from "@/redux/features/artisans/artisansApi";
import type { ApiUser } from "@/redux/features/users/users.types";
import { formatDate, getInitials } from "@/lib/utils";
import { getImageUrl } from "@/lib/getImageUrl";

export default function ArtisansPage() {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [identityFilter, setIdentityFilter] = useState("all");

  const [reviewArtisan, setReviewArtisan] = useState<ApiUser | null>(null);

  const {
    data: artisansRes,
    isLoading,
    refetch,
  } = useGetArtisansQuery({
    page,
    limit,
    searchTerm: searchTerm || undefined,
    identityStatus: identityFilter !== "all" ? identityFilter : undefined,
  });

  const artisans = artisansRes?.data || [];
  const pagination = artisansRes?.pagination || {
    total: 0,
    page: 1,
    limit: 10,
  };

  const columns: TableProps<ApiUser>["columns"] = [
    {
      title: "Artisan",
      key: "artisan",
      render: (_, record) => (
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate(`/artisans/${record._id}`)}
        >
          <Avatar
            size={42}
            src={getImageUrl(record.image)}
            className="bg-[#FE375D]/10 text-[#FE375D] font-bold shadow-xs"
          >
            {getInitials(record.name)}
          </Avatar>
          <div>
            <p className="font-semibold text-slate-800 text-sm group-hover:text-[#FE375D] transition-colors flex items-center gap-1.5">
              {record.name}
              {record.identityStatus === "verified" && (
                <SafetyCertificateOutlined className="text-emerald-500 text-xs" />
              )}
            </p>
            <p className="text-xs text-slate-500">
              {record.businessName || record.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Trade & Skills",
      key: "trade",
      render: (_, record) => (
        <div>
          <span className="font-semibold text-slate-800 text-xs block">
            {record.trade || "Tradesperson"}
          </span>
          <span className="text-[11px] text-slate-500">
            {record.experienceYears
              ? `${record.experienceYears} yrs experience`
              : "Experience not set"}
          </span>
        </div>
      ),
    },
    {
      title: "Services Count",
      key: "services",
      render: (_, record) => {
        const count = record.services?.length || 0;
        return (
          <Tag color="cyan" className="font-semibold text-xs">
            {count} {count === 1 ? "Service" : "Services"}
          </Tag>
        );
      },
    },
    {
      title: "Identity Verification",
      dataIndex: "identityStatus",
      key: "identityStatus",
      render: (status: string) => <StatusTag status={status} type="identity" />,
    },
    {
      title: "Availability",
      dataIndex: "availabilityStatus",
      key: "availabilityStatus",
      render: (status: string) => (
        <StatusTag status={status} type="availability" />
      ),
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      render: (loc: string) => (
        <span className="text-xs text-slate-600">{loc || "Ghana"}</span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      render: (_, record) => {
        const isPending = record.identityStatus === "pending";

        const menuItems: MenuProps["items"] = [
          {
            key: "details",
            icon: <EyeOutlined />,
            label: "View Full Profile",
            onClick: () => navigate(`/artisans/${record._id}`),
          },
          {
            key: "review-id",
            icon: <SafetyCertificateOutlined className="text-[#FE375D]" />,
            label: "Inspect ID Documents",
            onClick: () => setReviewArtisan(record),
          },
        ];

        return (
          <div className="flex items-center justify-end gap-2">
            {isPending && (
              <Button
                size="small"
                type="primary"
                onClick={() => setReviewArtisan(record)}
                className="bg-[#FE375D] hover:bg-[#e0284e] border-none text-xs rounded-lg font-semibold"
              >
                Review ID
              </Button>
            )}

            <Dropdown
              menu={{ items: menuItems }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Button type="text" shape="circle" icon={<MoreOutlined />} />
            </Dropdown>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Artisans & Identity Verification
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review National ID documents and live selfies, verify credentials,
            and manage professional profiles
          </p>
        </div>

        <Button
          icon={<ReloadOutlined />}
          onClick={() => refetch()}
          className="self-start sm:self-auto rounded-xl"
        >
          Refresh List
        </Button>
      </div>

      {/* Filter Toolbar */}
      <GlassCard className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-80">
          <Input
            prefix={<SearchOutlined className="text-slate-400 mr-1" />}
            placeholder="Search by name, trade, or email..."
            allowClear
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Segmented
            value={identityFilter}
            onChange={(val) => {
              setIdentityFilter(val as string);
              setPage(1);
            }}
            options={[
              { label: "All Artisans", value: "all" },
              { label: "Pending Review", value: "pending" },
              { label: "Verified", value: "verified" },
              { label: "Needs Update", value: "needs_update" },
              { label: "Not Submitted", value: "not_submitted" },
            ]}
          />
        </div>
      </GlassCard>

      {/* Artisans Table */}
      <GlassCard className="p-0 overflow-hidden">
        <Table
          columns={columns}
          dataSource={artisans}
          rowKey="_id"
          loading={isLoading}
          pagination={{
            current: page,
            pageSize: limit,
            total: pagination.total,
            showSizeChanger: true,
            onChange: (p, l) => {
              setPage(p);
              setLimit(l);
            },
          }}
          locale={{
            emptyText: (
              <EmptyState
                title="No artisans found"
                description="No artisan profiles match your current search and filter settings."
              />
            ),
          }}
        />
      </GlassCard>

      {/* Identity Review Modal */}
      <IdentityVerificationModal
        open={!!reviewArtisan}
        artisan={reviewArtisan}
        onClose={() => setReviewArtisan(null)}
      />
    </div>
  );
}
