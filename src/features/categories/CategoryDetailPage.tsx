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
  FolderOpenOutlined,
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

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<CatalogService | null>(null);

  // Pagination for services within this category
  const [servicePage, setServicePage] = useState(1);
  const [serviceLimit, setServiceLimit] = useState(10);

  const { data: catRes, isLoading: isCatLoading, refetch: refetchCategory } = useGetCategoryByIdQuery(id || "", {
    skip: !id,
  });

  const {
    data: servicesRes,
    isLoading: isServicesLoading,
    refetch: refetchServices,
  } = useGetServicesQuery(
    id
      ? {
          category: id,
          page: servicePage,
          limit: serviceLimit,
        }
      : undefined,
    { skip: !id }
  );

  const [deleteCategory] = useDeleteCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteService] = useDeleteServiceMutation();
  const [updateService] = useUpdateServiceMutation();

  const category = catRes?.data;
  const services = servicesRes?.data || (category as any)?.services || [];
  const totalServices = servicesRes?.pagination?.total ?? services.length;

  if (isCatLoading) {
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
      toast.success("Service deleted successfully");
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
                className="w-10 h-10 rounded-xl object-cover border border-slate-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-bold">
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
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (desc: string) => (
        <span className="text-xs text-slate-600 line-clamp-1 max-w-md">
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
                description="Make sure artisans are not actively offering it."
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
            <Button type="text" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  const catImage = category.image ? getImageUrl(category.image) : null;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/categories")}
          className="text-slate-600 hover:text-slate-900 font-medium -ml-2"
        >
          Back to All Categories
        </Button>
      </div>

      {/* Category Overview Card */}
      <GlassCard className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {catImage ? (
              <img
                src={catImage}
                alt={category.name}
                className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-rose-50 text-[#FE375D] flex items-center justify-center font-bold text-2xl border border-rose-100">
                <FolderOpenOutlined />
              </div>
            )}
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-slate-900">{category.name}</h1>
                <Tag color={category.isActive ? "success" : "default"}>
                  {category.isActive ? "Active Folder" : "Inactive Folder"}
                </Tag>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">/{category.slug}</p>
              {category.description && (
                <p className="text-xs text-slate-600 mt-2 max-w-2xl leading-relaxed">
                  {category.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <Switch
              checked={category.isActive}
              onChange={handleToggleCategoryActive}
              checkedChildren="Active"
              unCheckedChildren="Inactive"
            />
            <Button
              icon={<EditOutlined />}
              onClick={() => setCategoryModalOpen(true)}
              className="rounded-xl border-slate-200"
            >
              Edit Category
            </Button>
            <Popconfirm
              title="Delete Category?"
              description="Are you sure you want to remove this category? All child services must be removed first."
              onConfirm={handleDeleteCategory}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <Button danger icon={<DeleteOutlined />} className="rounded-xl" />
            </Popconfirm>
          </div>
        </div>
      </GlassCard>

      {/* Services List Card */}
      <GlassCard className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ToolOutlined className="text-[#FE375D]" />
              Services Connected with {category.name}
              <Tag color="cyan" className="rounded-full px-2.5 font-bold ml-1">
                {totalServices}
              </Tag>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              These are the individual services available for artisans to select within this trade folder.
            </p>
          </div>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingService(null);
              setServiceModalOpen(true);
            }}
            className="bg-[#FE375D] hover:bg-[#e02d4f] border-none rounded-xl font-bold shadow-md shadow-rose-500/20"
          >
            Add Service to this Category
          </Button>
        </div>

        {/* Regular Ant Design Pagination */}
        <Table
          columns={serviceColumns}
          dataSource={services}
          rowKey="_id"
          loading={isServicesLoading}
          pagination={{
            current: servicePage,
            pageSize: serviceLimit,
            total: totalServices,
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
                title="No Services Connected Yet"
                description={`Add the first service under the ${category.name} folder.`}
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
