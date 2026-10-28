import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Tag,
  Spin,
  Table,
  Switch,
  Popconfirm,
  Dropdown,
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
} from "@ant-design/icons";
import { GlassCard } from "@/components/ui/GlassCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { CreateEditCategoryModal } from "./components/CreateEditCategoryModal";
import { CreateEditServiceModal } from "./components/CreateEditServiceModal";
import {
  useGetCategoryByIdQuery,
  useDeleteCategoryMutation,
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

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<CatalogService | null>(null);

  const { data: catRes, isLoading, refetch } = useGetCategoryByIdQuery(id || "", {
    skip: !id,
  });

  const [deleteCategory, { isLoading: isDeletingCat }] = useDeleteCategoryMutation();
  const [deleteService] = useDeleteServiceMutation();
  const [updateService] = useUpdateServiceMutation();

  const category = catRes?.data;
  const services: CatalogService[] = (category as any)?.services || [];

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!category) {
    return (
      <GlassCard className="p-8 text-center">
        <h3 className="text-lg font-bold text-slate-800">Category Not Found</h3>
        <Button
          type="primary"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/categories")}
          className="mt-4 bg-[#FE375D] border-none"
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

  const handleDeleteService = async (serviceId: string) => {
    try {
      await deleteService(serviceId).unwrap();
      toast.success("Service deleted successfully");
      refetch();
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
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update service");
    }
  };

  const img = getImageUrl(category.image);

  const serviceColumns: TableProps<CatalogService>["columns"] = [
    {
      title: "Service Name",
      key: "name",
      render: (_, record) => {
        const sImg = getImageUrl(record.image);
        return (
          <div className="flex items-center gap-3">
            {sImg ? (
              <img
                src={sImg}
                alt={record.name}
                className="w-9 h-9 rounded-lg object-cover border border-slate-200"
              />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs border border-blue-100">
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
      {/* Top action header */}
      <div className="flex items-center justify-between">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/categories")}
          className="rounded-xl"
        >
          Back to Categories
        </Button>

        <div className="flex items-center gap-2">
          <Button
            icon={<EditOutlined />}
            onClick={() => setCategoryModalOpen(true)}
            className="rounded-xl font-medium"
          >
            Edit Category
          </Button>

          <Popconfirm
            title="Delete category?"
            description="Ensure all services in this category are removed or reassigned."
            onConfirm={handleDeleteCategory}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              loading={isDeletingCat}
              className="rounded-xl"
            />
          </Popconfirm>
        </div>
      </div>

      {/* Banner Card */}
      <GlassCard className="p-6 md:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            {img ? (
              <img
                src={img}
                alt={category.name}
                className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shadow-sm"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-rose-50 text-[#FE375D] font-extrabold text-3xl flex items-center justify-center border border-rose-100">
                {category.name.charAt(0)}
              </div>
            )}

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {category.name}
                </h1>
                <Tag color="magenta" className="font-mono text-xs">
                  /{category.slug}
                </Tag>
                <Tag color={category.isActive ? "success" : "default"}>
                  {category.isActive ? "Active Folder" : "Inactive Folder"}
                </Tag>
              </div>
              <p className="text-xs text-slate-600 mt-2 max-w-xl">
                {category.description || "No description specified for this category folder."}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:items-end text-xs text-slate-400">
            <span>Created on {formatDate(category.createdAt)}</span>
            <span className="mt-1 font-semibold text-slate-700">
              {services.length} Total Services Configured
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Services List Table */}
      <GlassCard className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ToolOutlined className="text-[#FE375D]" /> Services inside {category.name} ({services.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Specific services that artisans offering {category.name} can select and set custom rates for
            </p>
          </div>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingService(null);
              setServiceModalOpen(true);
            }}
            className="bg-[#FE375D] hover:bg-[#e0284e] border-none font-semibold rounded-xl"
          >
            Add Service to this Category
          </Button>
        </div>

        <Table
          columns={serviceColumns}
          dataSource={services}
          rowKey="_id"
          pagination={false}
          locale={{
            emptyText: (
              <EmptyState
                title="No services in this category yet"
                description="Add the first service item so artisans can find it."
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

      {/* Modals */}
      <CreateEditCategoryModal
        open={categoryModalOpen}
        category={category}
        onClose={() => {
          setCategoryModalOpen(false);
          refetch();
        }}
      />

      <CreateEditServiceModal
        open={serviceModalOpen}
        service={editingService}
        defaultCategoryId={category._id}
        onClose={() => {
          setServiceModalOpen(false);
          setEditingService(null);
          refetch();
        }}
      />
    </div>
  );
}
