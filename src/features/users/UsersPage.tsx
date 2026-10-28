import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Input,
  Select,
  Segmented,
  Button,
  Avatar,
  Dropdown,
  Popconfirm,
  type MenuProps,
  type TableProps,
  Tag,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  MoreOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  StopOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusTag } from "@/components/ui/StatusTag";
import { EmptyState } from "@/components/ui/EmptyState";
import { UserStatusModal } from "./components/UserStatusModal";
import {
  useGetUsersQuery,
  useDeleteUserMutation,
  useChangeUserStatusMutation,
} from "@/redux/features/users/usersApi";
import type { ApiUser } from "@/redux/features/users/users.types";
import { formatDate, getInitials } from "@/lib/utils";
import { toast } from "sonner";
import { getImageUrl } from "@/lib/getImageUrl";

export default function UsersPage() {
  const navigate = useNavigate();

  // State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Status modal
  const [modalUser, setModalUser] = useState<ApiUser | null>(null);

  const {
    data: usersRes,
    isLoading,
    refetch,
  } = useGetUsersQuery({
    page,
    limit,
    searchTerm: searchTerm || undefined,
    role: roleFilter !== "all" ? roleFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [changeStatus] = useChangeUserStatusMutation();

  const users = usersRes?.data || [];
  const pagination = usersRes?.pagination || {
    total: 0,
    page: 1,
    limit: 10,
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id).unwrap();
      toast.success("User deleted successfully");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete user");
    }
  };

  const handleToggleStatus = async (user: ApiUser) => {
    const nextStatus = user.status === "active" ? "blocked" : "active";
    if (nextStatus === "blocked") {
      setModalUser(user);
      return;
    }
    try {
      await changeStatus({ id: user._id, status: "active" }).unwrap();
      toast.success("User activated successfully");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update status");
    }
  };

  const columns: TableProps<ApiUser>["columns"] = [
    {
      title: "User",
      key: "user",
      render: (_, record) => (
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate(`/users/${record._id}`)}
        >
          <Avatar
            size={40}
            src={getImageUrl(record.image)}
            className="bg-slate-200 text-slate-700 font-semibold"
          >
            {getInitials(record.name)}
          </Avatar>
          <div>
            <p className="font-semibold text-slate-800 text-sm group-hover:text-[#FE375D] transition-colors">
              {record.name}
            </p>
            <p className="text-xs text-slate-500">{record.email}</p>
          </div>
        </div>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: string) => (
        <Tag
          color={
            role === "ARTISAN"
              ? "magenta"
              : role === "ADMIN"
                ? "purple"
                : "blue"
          }
          className="font-semibold uppercase text-[11px]"
        >
          {role}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <StatusTag status={status} type="user" />,
    },
    {
      title: "Phone",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      render: (phone: string) => (
        <span className="text-xs text-slate-600">{phone || "—"}</span>
      ),
    },
    {
      title: "Joined",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => (
        <span className="text-xs text-slate-500">{formatDate(date)}</span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      render: (_, record) => {
        const menuItems: MenuProps["items"] = [
          {
            key: "view",
            icon: <EyeOutlined />,
            label: "View Profile",
            onClick: () => navigate(`/users/${record._id}`),
          },
          {
            key: "status",
            icon:
              record.status === "active" ? (
                <StopOutlined />
              ) : (
                <CheckCircleOutlined />
              ),
            label: record.status === "active" ? "Block User" : "Activate User",
            onClick: () => handleToggleStatus(record),
          },
          {
            key: "custom-status",
            icon: <EditOutlined />,
            label: "Edit Status & Reason",
            onClick: () => setModalUser(record),
          },
          { type: "divider" },
          {
            key: "delete",
            icon: <DeleteOutlined />,
            label: (
              <Popconfirm
                title="Delete this user?"
                description="This action cannot be undone."
                onConfirm={() => handleDelete(record._id)}
                okText="Yes, Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <span className="text-rose-600 block">Delete User</span>
              </Popconfirm>
            ),
            danger: true,
          },
        ];

        return (
          <Dropdown
            menu={{ items: menuItems }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button type="text" shape="circle" icon={<MoreOutlined />} />
          </Dropdown>
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
            User Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse, filter, inspect details, and manage status of all platform
            accounts
          </p>
        </div>

        <Button
          icon={<ReloadOutlined />}
          onClick={() => refetch()}
          className="self-start sm:self-auto"
        >
          Refresh
        </Button>
      </div>

      {/* Filter Toolbar */}
      <GlassCard className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-80">
          <Input
            prefix={<SearchOutlined className="text-slate-400 mr-1" />}
            placeholder="Search by name, email, or phone..."
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
            value={roleFilter}
            onChange={(val) => {
              setRoleFilter(val as string);
              setPage(1);
            }}
            options={[
              { label: "All Roles", value: "all" },
              { label: "Artisans", value: "ARTISAN" },
              { label: "Customers", value: "USER" },
              { label: "Admins", value: "ADMIN" },
            ]}
          />

          <Select
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
            className="w-32"
            options={[
              { label: "All Status", value: "all" },
              { label: "Active", value: "active" },
              { label: "Blocked", value: "blocked" },
              { label: "Pending", value: "pending" },
            ]}
          />
        </div>
      </GlassCard>

      {/* Users Table */}
      <GlassCard className="p-0 overflow-hidden">
        <Table
          columns={columns}
          dataSource={users}
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
                title="No users found"
                description="Try clearing search or changing your role and status filters."
              />
            ),
          }}
        />
      </GlassCard>

      {/* Status Modal */}
      <UserStatusModal
        open={!!modalUser}
        user={modalUser}
        onClose={() => setModalUser(null)}
      />
    </div>
  );
}
