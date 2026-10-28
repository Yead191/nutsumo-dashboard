import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Button,
  Input,
  Tag,
  Tabs,
  Select,
  Popconfirm,
  Dropdown,
  Switch,
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
  FolderOutlined,
  ToolOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { GlassCard } from "@/components/ui/GlassCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { CreateEditCategoryModal } from "./components/CreateEditCategoryModal";
import { CreateEditServiceModal } from "./components/CreateEditServiceModal";
import {
  useGetCategoriesQuery,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
  useGetServicesQuery,
  useDeleteServiceMutation,
  useUpdateServiceMutation,
} from "@/redux/features/categories/categoriesApi";
import type {
  ServiceCategory,
  CatalogService,
} from "@/redux/features/categories/categories.types";
import { getImageUrl } from "@/lib/getImageUrl";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function CategoriesPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"categories" | "services">("categories");

  // Category filter/modal states
  const [categorySearch, setCategorySearch] = useState("");
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);

  // Service filter/modal states
  const [serviceSearch, setServiceSearch] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<CatalogService | null>(null);

  // Queries & Mutations
  const {
    data: categoriesRes,
    isLoading: isCategoriesLoading,
    refetch: refetchCategories,
  } = useGetCategoriesQuery({
    searchTerm: categorySearch || undefined,
  });

  const {
    data: servicesRes,
    isLoading: isServicesLoading,
    refetch: refetchServices,
  } = useGetServicesQuery({
    category: selectedCategoryFilter !== "all" ? selectedCategoryFilter : undefined,
    searchTerm: serviceSearch || undefined,
  });

  const [deleteCategory] = useDeleteCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteService] = useDeleteServiceMutation();
  const [updateService] = useUpdateServiceMutation();

  const categories = categoriesRes?.data || [];
  const services = servicesRes?.data || [];

  // Handlers for Category
  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id).unwrap();
      toast.success("Category deleted successfully");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete category");
    }
  };

  const handleToggleCategoryActive = async (record: ServiceCategory) => {
    try {
      await updateCategory({
        id: record._id,
        isActive: !record.isActive,
      }).unwrap();
      toast.success(`Category ${!record.isActive ? "activated" : "deactivated"}`);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update category status");
    }
  };

  // Handlers for Service
  const handleDeleteService = async (id: string) => {
    try {
      await deleteService(id).unwrap();
      toast.success("Service deleted successfully");
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
      toast.success(`Service ${!record.isActive ? "activated" : "deactivated"}`);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update service status");
    }
  };

  // Columns for Categories Table
  const categoryColumns: TableProps<ServiceCategory>["columns"] = [
    {
      title: "Category Folder",
      key: "category",
      render: (_, record) => {
        const img = getImageUrl(record.image);
        return (
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate(`/categories/${record._id}`)}
          >
            {img ? (
              <img
                src={img}
                alt={record.name}
                className="w-11 h-11 rounded-xl object-cover border border-slate-200 shadow-2xs"
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-rose-50 text-[#FE375D] flex items-center justify-center font-bold text-base border border-rose-100">
                {record.name.charAt(0)}
              </div>
            )}
            <div>
              <p className="font-bold text-slate-800 text-sm group-hover:text-[#FE375D] transition-colors flex items-center gap-1.5">
                {record.name}
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
          <Tag color="cyan" className="font-semibold text-xs px-2.5 py-0.5 rounded-lg">
            {count} {count === 1 ? "Service" : "Services"}
          </Tag>
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
          onChange={() => handleToggleCategoryActive(record)}
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
            label: "Open Category Folder",
            onClick: () => navigate(`/categories/${record._id}`),
          },
          {
            key: "edit",
            icon: <EditOutlined />,
            label: "Edit Category",
            onClick: () => {
              setEditingCategory(record);
              setCategoryModalOpen(true);
            },
          },
          { type: "divider" },
          {
            key: "delete",
            icon: <DeleteOutlined />,
            label: (
              <Popconfirm
                title="Delete this category?"
                description="Make sure all services under this category are removed first."
                onConfirm={() => handleDeleteCategory(record._id)}
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
          <div className="flex items-center justify-end gap-1.5">
            <Button
              size="small"
              onClick={() => navigate(`/categories/${record._id}`)}
              className="text-xs rounded-lg"
            >
              Services ({record.servicesCount ?? 0})
            </Button>
            <Dropdown menu={{ items: menuItems }} trigger={["click"]} placement="bottomRight">
              <Button type="text" shape="circle" icon={<MoreOutlined />} />
            </Dropdown>
          </div>
        );
      },
    },
  ];

  // Columns for Services Table
  const serviceColumns: TableProps<CatalogService>["columns"] = [
    {
      title: "Service Name",
      key: "name",
      render: (_, record) => {
        const img = getImageUrl(record.image);
        return (
          <div className="flex items-center gap-3">
            {img ? (
              <img
                src={img}
                alt={record.name}
                className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-2xs"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm border border-blue-100">
                <ToolOutlined />
              </div>
            )}
            <div>
              <p className="font-semibold text-slate-800 text-sm">{record.name}</p>
              <p className="text-[11px] text-slate-400 font-mono">/{record.slug}</p>
            </div>
          </div>
        );
      },
    },
    {
      title: "Category",
      key: "category",
      render: (_, record) => {
        const cat =
          typeof record.category === "object"
            ? (record.category as ServiceCategory)
            : null;
        return (
          <Tag color="purple" className="font-medium text-xs">
            {cat?.name || "General"}
          </Tag>
        );
      },
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (desc: string) => (
        <span className="text-xs text-slate-600 line-clamp-1 max-w-sm">
          {desc || "—"}
        </span>
      ),
    },
    {
      title: "Catalog Status",
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
      render: (_, record) => {
        const menuItems: MenuProps["items"] = [
          {
            key: "edit",
            icon: <EditOutlined />,
            label: "Edit Service",
            onClick: () => {
              setEditingService(record);
              setServiceModalOpen(true);
            },
          },
          { type: "divider" },
          {
            key: "delete",
            icon: <DeleteOutlined />,
            label: (
              <Popconfirm
                title="Delete this service?"
                description="If artisans have selected this service, deletion is blocked. Deactivate it instead."
                onConfirm={() => handleDeleteService(record._id)}
                okText="Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <span className="text-rose-600 block">Delete Service</span>
              </Popconfirm>
            ),
            danger: true,
          },
        ];

        return (
          <Dropdown menu={{ items: menuItems }} trigger={["click"]} placement="bottomRight">
            <Button type="text" shape="circle" icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Categories & Service Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage category folders and organize specific services that artisans can select and rate
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              refetchCategories();
              refetchServices();
            }}
            className="rounded-xl"
          >
            Refresh
          </Button>

          {activeTab === "categories" ? (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingCategory(null);
                setCategoryModalOpen(true);
              }}
              className="bg-[#FE375D] hover:bg-[#e0284e] border-none font-semibold rounded-xl px-4"
            >
              Create Category Folder
            </Button>
          ) : (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingService(null);
                setServiceModalOpen(true);
              }}
              className="bg-[#FE375D] hover:bg-[#e0284e] border-none font-semibold rounded-xl px-4"
            >
              Add Catalog Service
            </Button>
          )}
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <Tabs
        activeKey={activeTab}
        onChange={(k) => setActiveTab(k as "categories" | "services")}
        type="card"
        items={[
          {
            key: "categories",
            label: (
              <span className="flex items-center gap-2 px-1">
                <FolderOutlined /> Category Folders ({categories.length})
              </span>
            ),
            children: (
              <div className="space-y-4 pt-2">
                {/* Search Bar */}
                <GlassCard className="p-4 flex items-center justify-between gap-4">
                  <div className="w-full md:w-80">
                    <Input
                      prefix={<SearchOutlined className="text-slate-400 mr-1" />}
                      placeholder="Search category folders..."
                      allowClear
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                    />
                  </div>
                </GlassCard>

                {/* Table */}
                <GlassCard className="p-0 overflow-hidden">
                  <Table
                    columns={categoryColumns}
                    dataSource={categories}
                    rowKey="_id"
                    loading={isCategoriesLoading}
                    pagination={false}
                    locale={{
                      emptyText: (
                        <EmptyState
                          title="No category folders found"
                          description="Create a category folder to begin organizing your service catalog."
                          actionText="Create Category"
                          onAction={() => {
                            setEditingCategory(null);
                            setCategoryModalOpen(true);
                          }}
                        />
                      ),
                    }}
                  />
                </GlassCard>
              </div>
            ),
          },
          {
            key: "services",
            label: (
              <span className="flex items-center gap-2 px-1">
                <ToolOutlined /> Services Catalog ({services.length})
              </span>
            ),
            children: (
              <div className="space-y-4 pt-2">
                {/* Filters */}
                <GlassCard className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="w-full md:w-80">
                    <Input
                      prefix={<SearchOutlined className="text-slate-400 mr-1" />}
                      placeholder="Search services by title..."
                      allowClear
                      value={serviceSearch}
                      onChange={(e) => setServiceSearch(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <span className="text-xs text-slate-500 whitespace-nowrap">
                      Filter Category:
                    </span>
                    <Select
                      value={selectedCategoryFilter}
                      onChange={(val) => setSelectedCategoryFilter(val)}
                      className="w-52"
                      options={[
                        { label: "All Categories", value: "all" },
                        ...categories.map((c) => ({
                          label: c.name,
                          value: c._id,
                        })),
                      ]}
                    />
                  </div>
                </GlassCard>

                {/* Table */}
                <GlassCard className="p-0 overflow-hidden">
                  <Table
                    columns={serviceColumns}
                    dataSource={services}
                    rowKey="_id"
                    loading={isServicesLoading}
                    pagination={{ pageSize: 12 }}
                    locale={{
                      emptyText: (
                        <EmptyState
                          title="No services found"
                          description="Add services under your categories so artisans can select them."
                          actionText="Add Service"
                          onAction={() => {
                            setEditingService(null);
                            setServiceModalOpen(true);
                          }}
                        />
                      ),
                    }}
                  />
                </GlassCard>
              </div>
            ),
          },
        ]}
      />

      {/* Modals */}
      <CreateEditCategoryModal
        open={categoryModalOpen}
        category={editingCategory}
        onClose={() => {
          setCategoryModalOpen(false);
          setEditingCategory(null);
        }}
      />

      <CreateEditServiceModal
        open={serviceModalOpen}
        service={editingService}
        onClose={() => {
          setServiceModalOpen(false);
          setEditingService(null);
        }}
      />
    </div>
  );
}
