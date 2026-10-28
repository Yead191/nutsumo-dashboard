import { useState, useEffect } from "react";
import { Modal, Form, Input, Button, Upload, Switch } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from "@/redux/features/categories/categoriesApi";
import type { ServiceCategory } from "@/redux/features/categories/categories.types";
import { getImageUrl } from "@/lib/getImageUrl";
import { toast } from "sonner";

interface CreateEditCategoryModalProps {
  open: boolean;
  category: ServiceCategory | null;
  onClose: () => void;
}

export function CreateEditCategoryModal({
  open,
  category,
  onClose,
}: CreateEditCategoryModalProps) {
  const [form] = Form.useForm();
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const isEditing = !!category;

  useEffect(() => {
    if (category) {
      form.setFieldsValue({
        name: category.name,
        description: category.description || "",
        isActive: category.isActive !== undefined ? category.isActive : true,
      });
      setPreviewUrl(category.image ? getImageUrl(category.image) : "");
    } else {
      form.resetFields();
      form.setFieldsValue({ isActive: true });
      setSelectedFile(null);
      setPreviewUrl("");
    }
  }, [category, form, open]);

  const handleSubmit = async (values: {
    name: string;
    description?: string;
    isActive?: boolean;
  }) => {
    try {
      if (isEditing && category) {
        await updateCategory({
          id: category._id,
          name: values.name,
          description: values.description,
          isActive: values.isActive,
          imageFile: selectedFile,
        }).unwrap();
        toast.success("Category updated successfully");
      } else {
        await createCategory({
          name: values.name,
          description: values.description,
          isActive: values.isActive,
          imageFile: selectedFile,
        }).unwrap();
        toast.success("Category created successfully");
      }
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save category");
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <span className="font-bold text-slate-900 text-lg">
          {isEditing ? "Edit Category Folder" : "Create New Category Folder"}
        </span>
      }
      footer={null}
      destroyOnClose
      width={520}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-4 space-y-4"
      >
        <Form.Item
          name="name"
          label={<span className="text-xs font-semibold text-slate-700">Category Name</span>}
          rules={[{ required: true, message: "Please enter category name" }]}
        >
          <Input placeholder="e.g. Plumbing, Electrical, Carpentry..." />
        </Form.Item>

        <Form.Item
          name="description"
          label={<span className="text-xs font-semibold text-slate-700">Description</span>}
        >
          <Input.TextArea
            rows={3}
            placeholder="Overview of the trade services grouped inside this category folder..."
          />
        </Form.Item>

        {/* Category Image */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-2">
            Category Folder Icon / Banner Image
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
          label={<span className="text-xs font-semibold text-slate-700">Active Status</span>}
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
            {isEditing ? "Save Changes" : "Create Category"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
