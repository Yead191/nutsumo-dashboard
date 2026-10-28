import { useState, useEffect } from "react";
import { Modal, Form, Input, Select, Button, Upload, Switch } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import {
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useGetCategoriesQuery,
} from "@/redux/features/categories/categoriesApi";
import type { CatalogService } from "@/redux/features/categories/categories.types";
import { getImageUrl } from "@/lib/getImageUrl";
import { toast } from "sonner";

interface CreateEditServiceModalProps {
  open: boolean;
  service: CatalogService | null;
  defaultCategoryId?: string;
  onClose: () => void;
}

export function CreateEditServiceModal({
  open,
  service,
  defaultCategoryId,
  onClose,
}: CreateEditServiceModalProps) {
  const [form] = Form.useForm();
  const [createService, { isLoading: isCreating }] = useCreateServiceMutation();
  const [updateService, { isLoading: isUpdating }] = useUpdateServiceMutation();

  const { data: categoriesRes } = useGetCategoriesQuery();
  const categories = categoriesRes?.data || [];

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const isEditing = !!service;

  useEffect(() => {
    if (service) {
      const catId =
        typeof service.category === "object"
          ? service.category._id
          : service.category;
      form.setFieldsValue({
        name: service.name,
        category: catId,
        description: service.description || "",
        isActive: service.isActive !== undefined ? service.isActive : true,
      });
      setPreviewUrl(service.image ? getImageUrl(service.image) : "");
    } else {
      form.resetFields();
      form.setFieldsValue({
        category: defaultCategoryId || (categories.length ? categories[0]._id : undefined),
        isActive: true,
      });
      setSelectedFile(null);
      setPreviewUrl("");
    }
  }, [service, defaultCategoryId, categories, form, open]);

  const handleSubmit = async (values: {
    name: string;
    category: string;
    description?: string;
    isActive?: boolean;
  }) => {
    try {
      if (isEditing && service) {
        await updateService({
          id: service._id,
          name: values.name,
          category: values.category,
          description: values.description,
          isActive: values.isActive,
          imageFile: selectedFile,
        }).unwrap();
        toast.success("Service updated successfully");
      } else {
        await createService({
          name: values.name,
          category: values.category,
          description: values.description,
          isActive: values.isActive,
          imageFile: selectedFile,
        }).unwrap();
        toast.success("Service created successfully");
      }
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save service");
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <span className="font-bold text-slate-900 text-lg">
          {isEditing ? "Edit Catalog Service" : "Add Catalog Service"}
        </span>
      }
      footer={null}
      destroyOnClose
      width={540}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-4 space-y-4"
      >
        <Form.Item
          name="category"
          label={<span className="text-xs font-semibold text-slate-700">Parent Category Folder</span>}
          rules={[{ required: true, message: "Please select a category" }]}
        >
          <Select
            placeholder="Select category..."
            options={categories.map((c) => ({
              label: c.name,
              value: c._id,
            }))}
          />
        </Form.Item>

        <Form.Item
          name="name"
          label={<span className="text-xs font-semibold text-slate-700">Service Title</span>}
          rules={[{ required: true, message: "Please enter service name" }]}
        >
          <Input placeholder="e.g. Bathroom Pipe Repair, Leak Detection, Ceiling Fan Installation..." />
        </Form.Item>

        <Form.Item
          name="description"
          label={<span className="text-xs font-semibold text-slate-700">Description</span>}
        >
          <Input.TextArea
            rows={3}
            placeholder="Service details and specifications..."
          />
        </Form.Item>

        {/* Service Image */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-2">
            Service Thumbnail Image (Optional)
          </label>
          <div className="flex items-center gap-4">
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-14 h-14 rounded-xl object-cover border border-slate-200 shadow-xs"
              />
            )}
            <Upload
              beforeUpload={(file) => {
                setSelectedFile(file);
                setPreviewUrl(URL.createObjectURL(file));
                return false;
              }}
              showUploadList={false}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>
                {previewUrl ? "Change Image" : "Upload Image"}
              </Button>
            </Upload>
          </div>
        </div>

        <Form.Item
          name="isActive"
          label={<span className="text-xs font-semibold text-slate-700">Catalog Availability</span>}
          valuePropName="checked"
        >
          <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
        </Form.Item>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isCreating || isUpdating}
            className="bg-[#FE375D] hover:bg-[#e0284e] border-none font-semibold px-5"
          >
            {isEditing ? "Save Changes" : "Create Service"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
