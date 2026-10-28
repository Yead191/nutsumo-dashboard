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

  // Category filter/pagination/modal states
  const [categorySearch, setCategorySearch] = useState("");
  const [categoryPage, setCategoryPage] = useState(1);
  const [categoryLimit, setCategoryLimit] = useState(10);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);

  // Service filter/pagination/modal states
  const [serviceSearch, setServiceSearch] = useState("");
  const [servicePage, setServicePage] = useState(1);
  const [serviceLimit, setServiceLimit] = useState(10);
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
    page: categoryPage,
    limit: categoryLimit,
  });

  const {
    data: servicesRes,
    isLoading: isServicesLoading,
    refetch: refetchServices,
  } = useGetServicesQuery({
    category: selectedCategoryFilter !== "all" ? selectedCategoryFilter : undefined,
    searchTerm: serviceSearch || undefined,
    page: servicePage,
    limit: serviceLimit,
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
      toast.success(
        `Category ${record.isActive ? "deactivated" : "activated"} successfully`
      );
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update category status");
    }
  };

  // Handlers for Service
  const handleDeleteService = async (id: string) => {
    try {
      await deleteService(id).unwrap();
      toast.success("Service deleted from catalog");
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
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update service status");
    }
  };

  // Category Columns
  const categoryColumns: TableProps<ServiceCategory>["columns"] = [
    {
      title: "Category",
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
                className="w-11 h-11 rounded-xl object-cover border border-slate-200 shadow-2xs group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-rose-50 text-[#FE375D] flex items-center justify-center font-bold text-base border border-rose-100 group-hover:scale-105 transition-transform">
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
          <div className="flex items-center justify-end gap-2">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/categories/${record._id}`)}
              className="text-slate-600 hover:text-[#FE375D]"
            >
              Services
            </Button>
            <Dropdown menu={{ items: menuItems }} trigger={["click"]} placement="bottomRight">
              <Button type="text" size="small" icon={<MoreOutlined />} />
            </Dropdown>
          </div>
        );
      },
    },
  ];

  // Service Columns
  const serviceColumns: TableProps<CatalogService>["columns"] = [
    {
      title: "Service Name",
      key: "name",
      render: (_, record) => {
        const imgUrl = record.image ? getImageUrl(record.image) : null;
        return (
          <div className="flex items-center gap-3">
            {imgUrl ? (
              <img
                src={imgUrl}
                alt={record.name}
                className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-2xs"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm">
                <ToolOutlined />
              </div>
            )}
            <div>
              <p className="font-bold text-slate-800 text-sm">{record.name}</p>
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
        const catName =
          typeof record.category === "object"
            ? record.category.name
            : "Assigned Category";
        const catId =
          typeof record.category === "object" ? record.category._id : record.category;
        return (
          <Tag
            color="volcano"
            className="font-semibold text-xs px-2.5 py-0.5 rounded-lg cursor-pointer hover:opacity-80"
            onClick={() => navigate(`/categories/${catId}`)}
          >
            {catName}
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
          {desc || "No description"}
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
          />
          <Popconfirm
            title="Delete this service?"
            description="Artisans who have selected this service might be affected."
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
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Service Catalog & Categories
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Organize services into category folders and manage offerings available to artisans.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              refetchCategories();
              refetchServices();
            }}
            className="rounded-xl border-slate-200"
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
              className="bg-[#FE375D] hover:bg-[#e02d4f] border-none rounded-xl font-bold shadow-md shadow-rose-500/20"
            >
              Add Category
            </Button>
          ) : (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingService(null);
                setServiceModalOpen(true);
              }}
              className="bg-[#FE375D] hover:bg-[#e02d4f] border-none rounded-xl font-bold shadow-md shadow-rose-500/20"
            >
              Add Service
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <GlassCard className="p-4 sm:p-6">
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as "categories" | "services")}
          items={[
            {
              key: "categories",
              label: (
                <span className="flex items-center gap-2 font-bold px-1 py-0.5">
                  <FolderOutlined />
                  Category Folders
                  <Tag className="rounded-full px-2 text-[10px] bg-slate-100 text-slate-700 border-none ml-1">
                    {categoriesRes?.pagination?.total ?? categories.length}
                  </Tag>
                </span>
              ),
              children: (
                <div className="space-y-4 pt-2">
                  {/* Search Bar */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <Input
                      placeholder="Search category by name..."
                      prefix={<SearchOutlined className="text-slate-400" />}
                      value={categorySearch}
                      onChange={(e) => {
                        setCategorySearch(e.target.value);
                        setCategoryPage(1);
                      }}
                      allowClear
                      className="max-w-md rounded-xl"
                    />
                    <span className="text-xs text-slate-400">
                      Click any category folder to view and manage its services
                    </span>
                  </div>

                  {/* Table with Regular Pagination */}
                  <Table
                    columns={categoryColumns}
                    dataSource={categories}
                    rowKey="_id"
                    loading={isCategoriesLoading}
                    onRow={(record) => ({
                      onClick: (e) => {
                        // Avoid triggering navigation when clicking on switch, dropdown or actions
                        const target = e.target as HTMLElement;
                        if (!target.closest("button, .ant-switch, .ant-dropdown-trigger")) {
                          navigate(`/categories/${record._id}`);
                        }
                      },
                      className: "cursor-pointer hover:bg-slate-50/70 transition-colors",
                    })}
                    pagination={{
                      current: categoryPage,
                      pageSize: categoryLimit,
                      total: categoriesRes?.pagination?.total,
                      showSizeChanger: true,
                      pageSizeOptions: ["10", "20", "50"],
                      onChange: (page, pageSize) => {
                        setCategoryPage(page);
                        setCategoryLimit(pageSize);
                      },
                    }}
                    locale={{
                      emptyText: (
                        <EmptyState
                          title="No Categories Found"
                          description="Get started by creating your first category folder."
                          actionText="Create Category"
                          onAction={() => {
                            setEditingCategory(null);
                            setCategoryModalOpen(true);
                          }}
                        />
                      ),
                    }}
                  />
                </div>
              ),
            },
            {
              key: "services",
              label: (
                <span className="flex items-center gap-2 font-bold px-1 py-0.5">
                  <ToolOutlined />
                  Services Catalog
                  <Tag className="rounded-full px-2 text-[10px] bg-slate-100 text-slate-700 border-none ml-1">
                    {servicesRes?.pagination?.total ?? services.length}
                  </Tag>
                </span>
              ),
              children: (
                <div className="space-y-4 pt-2">
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                      <Input
                        placeholder="Search service name or description..."
                        prefix={<SearchOutlined className="text-slate-400" />}
                        value={serviceSearch}
                        onChange={(e) => {
                          setServiceSearch(e.target.value);
                          setServicePage(1);
                        }}
                        allowClear
                        className="w-full sm:w-72 rounded-xl"
                      />
                      <Select
                        value={selectedCategoryFilter}
                        onChange={(v) => {
                          setSelectedCategoryFilter(v);
                          setServicePage(1);
                        }}
                        className="w-full sm:w-56"
                        options={[
                          { value: "all", label: "All Categories" },
                          ...categories.map((c) => ({
                            value: c._id,
                            label: c.name,
                          })),
                        ]}
                      />
                    </div>
                  </div>

                  {/* Table with Regular Pagination */}
                  <Table
                    columns={serviceColumns}
                    dataSource={services}
                    rowKey="_id"
                    loading={isServicesLoading}
                    pagination={{
                      current: servicePage,
                      pageSize: serviceLimit,
                      total: servicesRes?.pagination?.total,
                      showSizeChanger: true,
                      pageSizeOptions: ["10", "20", "50"],
                      onChange: (page, pageSize) => {
                        setServicePage(page);
                        setServiceLimit(pageSize);
                      },
                    }}
                    locale={{
                      emptyText: (
                        <EmptyState
                          title="No Services Found"
                          description="Add services under category folders to populate the catalog."
                          actionText="Add New Service"
                          onAction={() => {
                            setEditingService(null);
                            setServiceModalOpen(true);
                          }}
                        />
                      ),
                    }}
                  />
                </div>
              ),
            },
          ]}
        />
      </GlassCard>

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
