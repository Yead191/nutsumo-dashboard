import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Avatar,
  Tag,
  Descriptions,
  Spin,
  Card,
  Popconfirm,
  Badge,
} from "antd";
import {
  ArrowLeftOutlined,
  StopOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusTag } from "@/components/ui/StatusTag";
import { UserStatusModal } from "./components/UserStatusModal";
import {
  useGetUserByIdQuery,
  useChangeUserStatusMutation,
  useDeleteUserMutation,
} from "@/redux/features/users/usersApi";
import { formatDate, formatDateTime, getInitials } from "@/lib/utils";
import { toast } from "sonner";
import { getImageUrl } from "@/lib/getImageUrl";

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const {
    data: userRes,
    isLoading,
    refetch,
  } = useGetUserByIdQuery(id || "", {
    skip: !id,
  });

  const [changeStatus, { isLoading: isChangingStatus }] =
    useChangeUserStatusMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const user = userRes?.data;

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return (
      <GlassCard className="p-8 text-center">
        <h3 className="text-lg font-bold text-slate-800">User Not Found</h3>
        <p className="text-slate-500 text-sm mt-1">
          The requested user record could not be found or has been deleted.
        </p>
        <Button
          type="primary"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/users")}
          className="mt-4 bg-[#FE375D] border-none"
        >
          Back to Users
        </Button>
      </GlassCard>
    );
  }

  const handleToggleStatus = async () => {
    if (user.status === "active") {
      setStatusModalOpen(true);
      return;
    }
    try {
      await changeStatus({ id: user._id, status: "active" }).unwrap();
      toast.success("User activated successfully");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update status");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser(user._id).unwrap();
      toast.success("User deleted successfully");
      navigate("/users");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete user");
    }
  };

  const isArtisan = user.role === "ARTISAN";

  return (
    <div className="space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="rounded-xl"
        >
          Back
        </Button>

        <div className="flex items-center gap-2">
          {isArtisan && (
            <Button
              type="primary"
              icon={<SafetyCertificateOutlined />}
              onClick={() => navigate(`/artisans/${user._id}`)}
              className="bg-emerald-600 hover:bg-emerald-700 border-none font-semibold rounded-xl"
            >
              Open Artisan Verification
            </Button>
          )}

          <Button
            onClick={() => setStatusModalOpen(true)}
            className="rounded-xl font-medium"
          >
            Change Status
          </Button>

          <Button
            danger={user.status === "active"}
            type={user.status === "active" ? "default" : "primary"}
            icon={
              user.status === "active" ? (
                <StopOutlined />
              ) : (
                <CheckCircleOutlined />
              )
            }
            onClick={handleToggleStatus}
            loading={isChangingStatus}
            className="rounded-xl font-medium"
          >
            {user.status === "active" ? "Block Account" : "Activate Account"}
          </Button>

          <Popconfirm
            title="Delete this user permanently?"
            description="All profile records and associated sessions will be wiped."
            onConfirm={handleDelete}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              loading={isDeleting}
              className="rounded-xl"
            />
          </Popconfirm>
        </div>
      </div>

      {/* User Header Profile Card */}
      <GlassCard className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <Avatar
              size={80}
              src={getImageUrl(user?.image)}
              className="bg-linear-to-tr from-[#FE375D] to-[#e0284e] text-white text-2xl font-bold shadow-md"
            >
              {getInitials(user.name)}
            </Avatar>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {user.name}
                </h1>
                <Tag
                  color={
                    user.role === "ARTISAN"
                      ? "magenta"
                      : user.role === "ADMIN"
                        ? "purple"
                        : "blue"
                  }
                  className="font-bold uppercase text-xs"
                >
                  {user.role}
                </Tag>
                <StatusTag status={user.status} type="user" />
              </div>

              <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                <MailOutlined /> {user.email}
              </p>

              {user.phoneNumber && (
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                  <PhoneOutlined /> {user.phoneNumber}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col md:items-end text-xs text-slate-500 border-t md:border-t-0 pt-4 md:pt-0 w-full md:w-auto">
            <span>Joined on {formatDate(user.createdAt)}</span>
            <span>Last updated {formatDateTime(user.updatedAt)}</span>
          </div>
        </div>

        {user.rejectionReason && (
          <div className="mt-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
            <span className="font-bold">Administrative Note / Reason: </span>
            {user.rejectionReason}
          </div>
        )}
      </GlassCard>

      {/* Two Column Details View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* General Information */}
          <GlassCard className="p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <UserOutlined className="text-[#FE375D]" /> General Information
            </h3>

            <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
              <Descriptions.Item label="Full Name">
                {user.name}
              </Descriptions.Item>
              <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
              <Descriptions.Item label="Phone Number">
                {user.phoneNumber || "Not provided"}
              </Descriptions.Item>
              <Descriptions.Item label="Location">
                {user.location || "Ghana"}
              </Descriptions.Item>
              <Descriptions.Item label="Role">{user.role}</Descriptions.Item>
              <Descriptions.Item label="Email Verified">
                {user.verified ? (
                  <Tag color="success">Verified</Tag>
                ) : (
                  <Tag color="default">Unverified</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Account Status">
                <StatusTag status={user.status} type="user" />
              </Descriptions.Item>
              <Descriptions.Item label="User ID">
                <span className="font-mono text-xs text-slate-500">
                  {user._id}
                </span>
              </Descriptions.Item>
            </Descriptions>
          </GlassCard>

          {/* Artisan Profile Details (if Artisan) */}
          {isArtisan && (
            <GlassCard className="p-6">
              <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                <ToolOutlined className="text-[#FE375D]" /> Artisan Professional
                Profile
              </h3>

              <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
                <Descriptions.Item label="Business Name">
                  {user.businessName || user.name}
                </Descriptions.Item>
                <Descriptions.Item label="Trade / Specialty">
                  <span className="font-semibold text-slate-800">
                    {user.trade || "Tradesperson"}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Experience">
                  {user.experienceYears ? `${user.experienceYears} Years` : "—"}
                </Descriptions.Item>
                <Descriptions.Item label="Availability">
                  <StatusTag
                    status={user.availabilityStatus}
                    type="availability"
                  />
                </Descriptions.Item>
                <Descriptions.Item label="Identity Status" span={2}>
                  <StatusTag status={user.identityStatus} type="identity" />
                  {user.identityRejectionReason && (
                    <span className="text-xs text-rose-600 block mt-1">
                      Note: {user.identityRejectionReason}
                    </span>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Professional Bio" span={2}>
                  <p className="text-slate-600 text-xs whitespace-pre-line leading-relaxed">
                    {user.bio || "No professional biography provided yet."}
                  </p>
                </Descriptions.Item>
              </Descriptions>
            </GlassCard>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <GlassCard className="p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Account Metadata
            </h3>
            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Created At</span>
                <span>{formatDateTime(user.createdAt)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Last Modified</span>
                <span>{formatDateTime(user.updatedAt)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Database ID</span>
                <span className="font-mono text-[11px] truncate max-w-[120px]">
                  {user._id}
                </span>
              </div>
            </div>
          </GlassCard>

          {isArtisan && (
            <GlassCard className="p-6 bg-gradient-to-br from-rose-50/50 to-white border-rose-100">
              <div className="flex items-center gap-3 mb-3">
                <SafetyCertificateOutlined className="text-2xl text-[#FE375D]" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Identity Verification
                  </h4>
                  <p className="text-xs text-slate-500">
                    Review official National ID & live selfie
                  </p>
                </div>
              </div>
              <Button
                type="primary"
                block
                onClick={() => navigate(`/artisans/${user._id}`)}
                className="bg-[#FE375D] hover:bg-[#e0284e] border-none font-semibold rounded-xl text-xs"
              >
                Inspect Verification Documents
              </Button>
            </GlassCard>
          )}
        </div>
      </div>

      <UserStatusModal
        open={statusModalOpen}
        user={user}
        onClose={() => setStatusModalOpen(false)}
      />
    </div>
  );
}
