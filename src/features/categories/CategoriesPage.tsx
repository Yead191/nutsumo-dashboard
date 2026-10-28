import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Button,
  Input,
  Tag,
  Popconfirm,
  Dropdown,
  Switch,
  Segmented,
  Tooltip,
  type MenuProps,
  type TableProps,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
  FolderOpenOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  RightOutlined,
  CheckCircleOutlined,
  StopOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import { GlassCard } from "@/components/ui/GlassCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { CreateEditCategoryModal } from "./components/CreateEditCategoryModal";
import {
  useGetCategoriesQuery,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
} from "@/redux/features/categories/categoriesApi";
import type { ServiceCategory } from "@/redux/features/categories/categories.types";
import { getImageUrl } from "@/lib/getImageUrl";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function CategoriesPage() {
  const navigate = useNavigate();

  // Search & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);

  // View Mode: Grid cards or Table
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);

  // Queries & Mutations
  const {
    data: categoriesRes,
    isLoading,
    refetch,
  } = useGetCategoriesQuery({
    searchTerm: searchTerm || undefined,
    page,
    limit,
  });

  const [deleteCategory] = useDeleteCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();

  const categories = categoriesRes?.data || [];
  const pagination = categoriesRes?.pagination;

  // Stats calculation
  const totalCategories = pagination?.total ?? categories.length;
  const activeCount = categories.filter((c) => c.isActive).length;
  const totalServicesAcross = categories.reduce(
    (acc, curr) => acc + (curr.servicesCount ?? (curr.services?.length || 0)),
    0
  );

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id).unwrap();
      toast.success("Category folder deleted successfully");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete category");
    }
  };

  const handleToggleActive = async (record: ServiceCategory) => {
    try {
      await updateCategory({
        id: record._id,
        isActive: !record.isActive,
      }).unwrap();
      toast.success(
        `Category folder ${record.isActive ? "deactivated" : "activated"} successfully`
      );
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update category status");
    }
  };

  // Table Columns
  const columns: TableProps<ServiceCategory>["columns"] = [
    {
      title: "Category Folder",
      key: "category",
      render: (_, record) => {
        const imgUrl = record.image ? getImageUrl(record.image) : null;
        return (
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate(`/categories/${record._id}`)}
          >
            {imgUrl ? (
              <img
                src={imgUrl}
                alt={record.name}
                className="w-12 h-12 rounded-2xl object-cover border border-slate-200/80 shadow-2xs group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100/60 text-[#FE375D] flex items-center justify-center font-bold text-lg border border-rose-200/50 group-hover:scale-105 transition-transform">
                <FolderOpenOutlined />
              </div>
            )}
            <div>
              <p className="font-bold text-slate-900 text-sm group-hover:text-[#FE375D] transition-colors flex items-center gap-2">
                {record.name}
                <RightOutlined className="text-[10px] text-slate-300 group-hover:text-[#FE375D] transition-all group-hover:translate-x-0.5" />
              </p>
              <p className="text-[11px] text-slate-400 font-mono">/{record.slug}</p>
            </div>
          </div>
        );
      },
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (desc: string) => (
        <span className="text-xs text-slate-600 line-clamp-1 max-w-sm">
          {desc || "No description provided"}
        </span>
      ),
    },
    {
      title: "Services Count",
      key: "servicesCount",
      render: (_, record) => {
        const count = record.servicesCount ?? (record.services?.length || 0);
        return (
          <span
            onClick={() => navigate(`/categories/${record._id}`)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-50 border border-cyan-200/70 text-cyan-800 text-xs font-bold cursor-pointer hover:bg-cyan-100/80 transition-colors"
          >
            <ToolOutlined className="text-cyan-600 text-[11px]" />
            {count} {count === 1 ? "Service" : "Services"}
          </span>
        );
      },
    },
    {
      title: "Status",
      key: "isActive",
      render: (_, record) => (
        <Switch
          size="small"
          checked={record.isActive}
          onChange={() => handleToggleActive(record)}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
        />
      ),
    },
    {
      title: "Created",
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
            label: "Open Services Page",
            onClick: () => navigate(`/categories/${record._id}`),
          },
          {
            key: "edit",
            icon: <EditOutlined />,
            label: "Edit Folder",
            onClick: () => {
              setEditingCategory(record);
              setModalOpen(true);
            },
          },
          { type: "divider" },
          {
            key: "delete",
            icon: <DeleteOutlined />,
            label: (
              <Popconfirm
                title="Delete this category folder?"
                description="All services under this folder must be removed first."
                onConfirm={() => handleDelete(record._id)}
                okText="Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <span className="text-rose-600 block">Delete Category</span>
              </Popconfirm>
            ),
            danger: true,
          },
        ];

        return (
          <div className="flex items-center justify-end gap-2">
            <Button
              type="primary"
              ghost
              size="small"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/categories/${record._id}`)}
              className="text-xs font-semibold rounded-lg border-slate-300 text-slate-700 hover:border-[#FE375D] hover:text-[#FE375D]"
            >
              View Services
            </Button>
            <Dropdown menu={{ items: menuItems }} trigger={["click"]} placement="bottomRight">
              <Button type="text" size="small" icon={<MoreOutlined />} />
            </Dropdown>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Service Categories
            </h1>
            <Tag color="cyan" className="rounded-full px-2.5 font-bold text-[11px] border-none bg-cyan-50 text-cyan-700">
              {totalCategories} Folders
            </Tag>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Each category represents a trade folder grouping related services. Click any category to open its dedicated services page.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            icon={<ReloadOutlined />}
            onClick={() => refetch()}
            className="rounded-xl border-slate-200 text-slate-700 font-medium"
          >
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingCategory(null);
              setModalOpen(true);
            }}
            className="bg-[#FE375D] hover:bg-[#e02d4f] border-none rounded-xl font-bold px-4 shadow-md shadow-rose-500/20"
          >
            Create Category
          </Button>
        </div>
      </div>

      {/* 2. Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard className="p-4 sm:p-5 flex items-center justify-between border-slate-200/80">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Categories
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalCategories}</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center text-lg">
            <FolderOpenOutlined />
          </div>
        </GlassCard>

        <GlassCard className="p-4 sm:p-5 flex items-center justify-between border-slate-200/80">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Active Folders
            </p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{activeCount}</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg border border-emerald-100">
            <CheckCircleOutlined />
          </div>
        </GlassCard>

        <GlassCard className="p-4 sm:p-5 flex items-center justify-between border-slate-200/80">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Catalog Services
            </p>
            <p className="text-2xl font-black text-cyan-600 mt-1">{totalServicesAcross}</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center text-lg border border-cyan-100">
            <ToolOutlined />
          </div>
        </GlassCard>
      </div>

      {/* 3. Filter Toolbar */}
      <GlassCard className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search category folders..."
            prefix={<SearchOutlined className="text-slate-400 mr-1" />}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            allowClear
            className="rounded-xl border-slate-200"
          />
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          <span className="text-xs text-slate-400 hidden sm:inline">
            Click any folder to view connected services
          </span>
          <Segmented
            value={viewMode}
            onChange={(val) => setViewMode(val as "grid" | "table")}
            options={[
              {
                value: "grid",
                icon: <AppstoreOutlined />,
                label: "Grid",
              },
              {
                value: "table",
                icon: <UnorderedListOutlined />,
                label: "Table",
              },
            ]}
            className="bg-slate-100 p-0.5 rounded-xl"
          />
        </div>
      </GlassCard>

      {/* 4. Category Views */}
      {viewMode === "grid" ? (
        <div className="space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 animate-pulse"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-200" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-4 w-28 bg-slate-200 rounded" />
                      <div className="h-3 w-16 bg-slate-100 rounded" />
                    </div>
                  </div>
                  <div className="h-10 bg-slate-100 rounded-xl" />
                </div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <EmptyState
                title="No Category Folders Found"
                description="Create your first service category folder to start grouping services."
                actionText="Create Category"
                onAction={() => {
                  setEditingCategory(null);
                  setModalOpen(true);
                }}
              />
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {categories.map((cat) => {
                const imgUrl = cat.image ? getImageUrl(cat.image) : null;
                const count = cat.servicesCount ?? (cat.services?.length || 0);

                const menuItems: MenuProps["items"] = [
                  {
                    key: "view",
                    icon: <EyeOutlined />,
                    label: "Open Services Page",
                    onClick: () => navigate(`/categories/${cat._id}`),
                  },
                  {
                    key: "edit",
                    icon: <EditOutlined />,
                    label: "Edit Folder",
                    onClick: () => {
                      setEditingCategory(cat);
                      setModalOpen(true);
                    },
                  },
                  { type: "divider" },
                  {
                    key: "delete",
                    icon: <DeleteOutlined />,
                    label: (
                      <Popconfirm
                        title="Delete category folder?"
                        description="All child services must be removed first."
                        onConfirm={() => handleDelete(cat._id)}
                        okText="Delete"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true }}
                      >
                        <span className="text-rose-600 block">Delete Category</span>
                      </Popconfirm>
                    ),
                    danger: true,
                  },
                ];

                return (
                  <GlassCard
                    key={cat._id}
                    className="p-5 group hover:border-[#FE375D]/40 hover:shadow-lg hover:shadow-rose-500/5 transition-all duration-300 flex flex-col justify-between cursor-pointer relative"
                    onClick={() => navigate(`/categories/${cat._id}`)}
                  >
                    <div>
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3.5">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={cat.name}
                              className="w-13 h-13 rounded-2xl object-cover border border-slate-200/90 shadow-2xs group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100 text-[#FE375D] flex items-center justify-center font-bold text-xl border border-rose-200/60 shadow-2xs group-hover:scale-105 transition-transform">
                              <FolderOpenOutlined />
                            </div>
                          )}
                          <div>
                            <h3 className="font-bold text-base text-slate-900 group-hover:text-[#FE375D] transition-colors leading-snug">
                              {cat.name}
                            </h3>
                            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                              /{cat.slug}
                            </p>
                          </div>
                        </div>

                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1.5"
                        >
                          <Switch
                            size="small"
                            checked={cat.isActive}
                            onChange={() => handleToggleActive(cat)}
                          />
                          <Dropdown
                            menu={{ items: menuItems }}
                            trigger={["click"]}
                            placement="bottomRight"
                          >
                            <Button type="text" size="small" icon={<MoreOutlined />} />
                          </Dropdown>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4 min-h-[32px]">
                        {cat.description || "Official trade category folder for organizing services."}
                      </p>
                    </div>

                    {/* Bottom row banner */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-cyan-50 border border-cyan-200/60 text-cyan-800 font-bold text-[11px]">
                        <ToolOutlined className="text-cyan-600" />
                        {count} {count === 1 ? "Service" : "Services"}
                      </span>

                      <span className="text-[#FE375D] font-bold text-xs flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        Explore Services <RightOutlined className="text-[10px]" />
                      </span>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}

          {/* Regular Pagination */}
          {pagination && pagination.total > limit && (
            <div className="flex justify-center pt-4">
              <Table
                dataSource={[]}
                pagination={{
                  current: page,
                  pageSize: limit,
                  total: pagination.total,
                  showSizeChanger: true,
                  pageSizeOptions: ["12", "24", "48"],
                  onChange: (p, l) => {
                    setPage(p);
                    setLimit(l);
                  },
                }}
              />
            </div>
          )}
        </div>
      ) : (
        /* Table View */
        <GlassCard className="p-0 overflow-hidden">
          <Table
            columns={columns}
            dataSource={categories}
            rowKey="_id"
            loading={isLoading}
            onRow={(record) => ({
              onClick: (e) => {
                const target = e.target as HTMLElement;
                if (!target.closest("button, .ant-switch, .ant-dropdown-trigger")) {
                  navigate(`/categories/${record._id}`);
                }
              },
              className: "cursor-pointer hover:bg-slate-50/70 transition-colors",
            })}
            pagination={{
              current: page,
              pageSize: limit,
              total: pagination?.total ?? categories.length,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50"],
              onChange: (p, l) => {
                setPage(p);
                setLimit(l);
              },
            }}
            locale={{
              emptyText: (
                <EmptyState
                  title="No Categories Found"
                  description="Create your first category folder to start grouping services."
                  actionText="Create Category"
                  onAction={() => {
                    setEditingCategory(null);
                    setModalOpen(true);
                  }}
                />
              ),
            }}
          />
        </GlassCard>
      )}

      {/* Modal */}
      <CreateEditCategoryModal
        open={modalOpen}
        category={editingCategory}
        onClose={() => {
          setModalOpen(false);
          setEditingCategory(null);
        }}
      />
    </div>
  );
}
