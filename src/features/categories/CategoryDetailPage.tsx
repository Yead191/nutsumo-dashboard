import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Tag,
  Spin,
  Table,
  Switch,
  Popconfirm,
  Dropdown,
  Input,
  Segmented,
  Tooltip,
  type MenuProps,
  type TableProps,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  PlusOutlined,
  DeleteOutlined,
  ToolOutlined,
  MoreOutlined,
  FolderOpenOutlined,
  SearchOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  CheckCircleOutlined,
  StopOutlined,
  CalendarOutlined,
  FolderOutlined,
} from "@ant-design/icons";
import { GlassCard } from "@/components/ui/GlassCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { CreateEditCategoryModal } from "./components/CreateEditCategoryModal";
import { CreateEditServiceModal } from "./components/CreateEditServiceModal";
import {
  useGetCategoryByIdQuery,
  useGetServicesQuery,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteServiceMutation,
  useUpdateServiceMutation,
} from "@/redux/features/categories/categoriesApi";
import type { CatalogService } from "@/redux/features/categories/categories.types";
import { getImageUrl } from "@/lib/getImageUrl";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function CategoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Pagination for services
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);

  // Modals
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<CatalogService | null>(null);

  // 1. Fetch Category Header
  const {
    data: catRes,
    isLoading: isCatLoading,
    refetch: refetchCategory,
  } = useGetCategoryByIdQuery(id || "", {
    skip: !id,
  });

  // 2. Fetch Connected Services with Clean Pagination & Search
  const {
    data: servicesRes,
    isLoading: isServicesLoading,
    refetch: refetchServices,
  } = useGetServicesQuery(
    id
      ? {
          category: id,
          searchTerm: searchTerm || undefined,
          page,
          limit,
          isActive:
            statusFilter === "all" ? undefined : statusFilter === "active",
        }
      : undefined,
    { skip: !id }
  );

  const [deleteCategory] = useDeleteCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteService] = useDeleteServiceMutation();
  const [updateService] = useUpdateServiceMutation();

  const category = catRes?.data;
  const services = servicesRes?.data || [];
  const pagination = servicesRes?.pagination;

  const totalServices = pagination?.total ?? services.length;
  const activeServicesCount = useMemo(
    () => services.filter((s) => s.isActive).length,
    [services]
  );
  const inactiveServicesCount = totalServices - activeServicesCount;

  if (isCatLoading) {
    return (
      <div className="py-24 text-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!category) {
    return (
      <GlassCard className="p-12 text-center max-w-lg mx-auto my-12 space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-[#FE375D] flex items-center justify-center mx-auto text-2xl font-bold">
          <FolderOutlined />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Category Not Found</h3>
        <p className="text-xs text-slate-500">
          The requested category folder does not exist or may have been removed.
        </p>
        <Button
          type="primary"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/categories")}
          className="mt-2 bg-[#FE375D] border-none rounded-xl font-bold"
        >
          Back to Categories
        </Button>
      </GlassCard>
    );
  }

  const handleDeleteCategory = async () => {
    try {
      await deleteCategory(category._id).unwrap();
      toast.success("Category deleted");
      navigate("/categories");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete category");
    }
  };

  const handleToggleCategoryActive = async () => {
    try {
      await updateCategory({
        id: category._id,
        isActive: !category.isActive,
      }).unwrap();
      toast.success(
        `Category ${category.isActive ? "deactivated" : "activated"} successfully`
      );
      refetchCategory();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update category status");
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      await deleteService(serviceId).unwrap();
      toast.success("Service deleted from catalog");
      refetchServices();
      refetchCategory();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete service");
    }
  };

  const handleToggleServiceActive = async (record: CatalogService) => {
    try {
      await updateService({
        id: record._id,
        isActive: !record.isActive,
      }).unwrap();
      toast.success(
        `Service ${record.isActive ? "deactivated" : "activated"} successfully`
      );
      refetchServices();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update service status");
    }
  };

  const catImage = category.image ? getImageUrl(category.image) : null;

  // Table Columns
  const serviceColumns: TableProps<CatalogService>["columns"] = [
    {
      title: "Service",
      key: "name",
      render: (_, record) => {
        const imgUrl = record.image ? getImageUrl(record.image) : null;
        return (
          <div className="flex items-center gap-3">
            {imgUrl ? (
              <img
                src={imgUrl}
                alt={record.name}
                className="w-11 h-11 rounded-xl object-cover border border-slate-200 shadow-2xs"
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm">
                <ToolOutlined />
              </div>
            )}
            <div>
              <p className="font-bold text-slate-900 text-sm leading-tight">
                {record.name}
              </p>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                /{record.slug}
              </p>
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
        <span className="text-xs text-slate-600 line-clamp-1 max-w-md">
          {desc || "No description provided"}
        </span>
      ),
    },
    {
      title: "Status",
      key: "isActive",
      render: (_, record) => (
        <Switch
          size="small"
          checked={record.isActive}
          onChange={() => handleToggleServiceActive(record)}
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
      render: (_, record) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingService(record);
              setServiceModalOpen(true);
            }}
            className="text-slate-600 hover:text-slate-900"
          />
          <Popconfirm
            title="Delete this service?"
            description="Artisans offering this service might be affected."
            onConfirm={() => handleDeleteService(record._id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Breadcrumbs & Top Back Link */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/categories")}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#FE375D] transition-colors py-1 px-2.5 rounded-lg hover:bg-rose-50/50"
        >
          <ArrowLeftOutlined className="text-[11px]" />
          <span>Back to Category Folders</span>
        </button>

        <div className="text-xs font-mono text-slate-400">
          Folder ID: <span className="text-slate-600 font-semibold">{category._id}</span>
        </div>
      </div>

      {/* 2. Executive Hero Banner */}
      <GlassCard className="p-6 sm:p-8 relative overflow-hidden bg-gradient-to-br from-white via-white to-rose-50/20 border-slate-200/90 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* Category Info */}
          <div className="flex items-start sm:items-center gap-5">
            {catImage ? (
              <img
                src={catImage}
                alt={category.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border border-slate-200/80 shadow-md shadow-slate-200/50 shrink-0"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-rose-50 to-rose-100 text-[#FE375D] flex items-center justify-center font-bold text-3xl border border-rose-200/60 shadow-md shadow-rose-500/10 shrink-0">
                <FolderOpenOutlined />
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {category.name}
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold ${
                    category.isActive
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      category.isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                    }`}
                  />
                  {category.isActive ? "Active Folder" : "Inactive Folder"}
                </span>
              </div>

              <p className="text-xs font-mono text-slate-400">/{category.slug}</p>

              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed pt-1">
                {category.description ||
                  "Official category folder. All services under this folder are cataloged for artisans."}
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-600">Folder Status:</span>
              <Switch
                size="small"
                checked={category.isActive}
                onChange={handleToggleCategoryActive}
                checkedChildren="Active"
                unCheckedChildren="Inactive"
              />
            </div>

            <Button
              icon={<EditOutlined />}
              onClick={() => setCategoryModalOpen(true)}
              className="rounded-xl border-slate-200 font-semibold"
            >
              Edit Category
            </Button>

            <Popconfirm
              title="Delete Category Folder?"
              description="Make sure all services under this folder are removed first."
              onConfirm={handleDeleteCategory}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <Button danger icon={<DeleteOutlined />} className="rounded-xl" />
            </Popconfirm>
          </div>
        </div>

        {/* Metric Pills inside Hero */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 mt-6 border-t border-slate-100">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-cyan-50/70 border border-cyan-200/60">
            <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-base">
              <ToolOutlined />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-800">
                Connected Services
              </p>
              <p className="text-lg font-black text-cyan-900">{totalServices}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/60">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-base">
              <CheckCircleOutlined />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                Active in Catalog
              </p>
              <p className="text-lg font-black text-emerald-900">{activeServicesCount}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200/70">
            <div className="w-9 h-9 rounded-xl bg-slate-200/70 text-slate-700 flex items-center justify-center font-bold text-base">
              <CalendarOutlined />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Created Date
              </p>
              <p className="text-xs font-bold text-slate-800 mt-0.5">
                {formatDate(category.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* 3. Services Catalog Toolbar & Content */}
      <GlassCard className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <ToolOutlined className="text-[#FE375D]" />
              Services Catalog
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {totalServices}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Individual trade offerings under this folder. Artisans can select these services and set their custom rates.
            </p>
          </div>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingService(null);
              setServiceModalOpen(true);
            }}
            className="bg-[#FE375D] hover:bg-[#e02d4f] border-none rounded-xl font-bold px-5 shadow-md shadow-rose-500/20"
          >
            Add Service to this Category
          </Button>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <Input
              placeholder="Search services by name..."
              prefix={<SearchOutlined className="text-slate-400 mr-1" />}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              allowClear
              className="w-full sm:w-72 rounded-xl border-slate-200"
            />

            <Segmented
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val as any);
                setPage(1);
              }}
              options={[
                { value: "all", label: `All (${totalServices})` },
                { value: "active", label: `Active (${activeServicesCount})` },
                { value: "inactive", label: `Inactive (${inactiveServicesCount})` },
              ]}
              className="bg-slate-100 p-0.5 rounded-xl"
            />
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <Segmented
              value={viewMode}
              onChange={(val) => setViewMode(val as "grid" | "table")}
              options={[
                {
                  value: "grid",
                  icon: <AppstoreOutlined />,
                  label: "Cards",
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
        </div>

        {/* 4. Services Render */}
        {isServicesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 animate-pulse shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-200" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-4 w-32 bg-slate-200 rounded" />
                    <div className="h-3 w-16 bg-slate-100 rounded" />
                  </div>
                </div>
                <div className="h-8 bg-slate-100 rounded-lg" />
              </div>
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="py-12 text-center">
            <EmptyState
              title="No Services Connected Yet"
              description={`There are currently no services under the ${category.name} folder.`}
              actionText="Add New Service"
              onAction={() => {
                setEditingService(null);
                setServiceModalOpen(true);
              }}
            />
          </div>
        ) : viewMode === "grid" ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((svc) => {
                const imgUrl = svc.image ? getImageUrl(svc.image) : null;
                return (
                  <div
                    key={svc._id}
                    className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={svc.name}
                              className="w-11 h-11 rounded-xl object-cover border border-slate-200 shadow-2xs group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-xl bg-rose-50 text-[#FE375D] flex items-center justify-center font-bold text-base border border-rose-100 group-hover:scale-105 transition-transform">
                              <ToolOutlined />
                            </div>
                          )}
                          <div>
                            <h3 className="font-bold text-slate-900 text-sm group-hover:text-[#FE375D] transition-colors leading-snug">
                              {svc.name}
                            </h3>
                            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                              /{svc.slug}
                            </p>
                          </div>
                        </div>

                        <Switch
                          size="small"
                          checked={svc.isActive}
                          onChange={() => handleToggleServiceActive(svc)}
                        />
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4 min-h-[32px]">
                        {svc.description || "Professional service offering for artisans."}
                      </p>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                          svc.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {svc.isActive ? "Active" : "Inactive"}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => {
                            setEditingService(svc);
                            setServiceModalOpen(true);
                          }}
                          className="text-slate-600 hover:text-slate-900"
                        >
                          Edit
                        </Button>
                        <Popconfirm
                          title="Delete this service?"
                          description="Artisans offering this service might be affected."
                          onConfirm={() => handleDeleteService(svc._id)}
                          okText="Delete"
                          cancelText="Cancel"
                          okButtonProps={{ danger: true }}
                        >
                          <Button
                            type="text"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                          />
                        </Popconfirm>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination for Grid */}
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
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <Table
              columns={serviceColumns}
              dataSource={services}
              rowKey="_id"
              pagination={{
                current: page,
                pageSize: limit,
                total: totalServices,
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50"],
                onChange: (p, l) => {
                  setPage(p);
                  setLimit(l);
                },
              }}
            />
          </div>
        )}
      </GlassCard>

      {/* Modals */}
      <CreateEditCategoryModal
        open={categoryModalOpen}
        category={category}
        onClose={() => setCategoryModalOpen(false)}
      />

      <CreateEditServiceModal
        open={serviceModalOpen}
        service={editingService}
        defaultCategoryId={category._id}
        onClose={() => {
          setServiceModalOpen(false);
          setEditingService(null);
          refetchServices();
          refetchCategory();
        }}
      />
    </div>
  );
}
