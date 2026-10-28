import { useState, useEffect } from "react";
import { Modal, Form, Select, Input, Button } from "antd";
import { useChangeUserStatusMutation } from "@/redux/features/users/usersApi";
import type { ApiUser } from "@/redux/features/users/users.types";
import { USER_STATUS, type UserStatus } from "@/config";
import { toast } from "sonner";

interface UserStatusModalProps {
  open: boolean;
  user: ApiUser | null;
  onClose: () => void;
}

export function UserStatusModal({ open, user, onClose }: UserStatusModalProps) {
  const [form] = Form.useForm();
  const [changeStatus, { isLoading }] = useChangeUserStatusMutation();
  const [selectedStatus, setSelectedStatus] = useState<UserStatus>(
    user?.status || USER_STATUS.ACTIVE
  );

  useEffect(() => {
    if (user) {
      setSelectedStatus(user.status);
      form.setFieldsValue({
        status: user.status,
        rejectionReason: user.rejectionReason || "",
      });
    }
  }, [user, form]);

  const handleSubmit = async (values: { status: UserStatus; rejectionReason?: string }) => {
    if (!user) return;
    try {
      await changeStatus({
        id: user._id,
        status: values.status,
        rejectionReason: values.rejectionReason,
      }).unwrap();
      toast.success(`User status changed to ${values.status}`);
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update user status");
    }
  };

  const isBlockingOrRejecting =
    selectedStatus === USER_STATUS.BLOCKED || selectedStatus === USER_STATUS.REJECTED;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={<span className="font-bold text-slate-900">Update User Status</span>}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-4"
      >
        <Form.Item
          name="status"
          label={<span className="text-xs font-semibold text-slate-700">Account Status</span>}
          rules={[{ required: true }]}
        >
          <Select
            onChange={(val) => setSelectedStatus(val)}
            options={[
              { label: "Active", value: USER_STATUS.ACTIVE },
              { label: "Blocked", value: USER_STATUS.BLOCKED },
              { label: "Pending", value: USER_STATUS.PENDING },
              { label: "Rejected", value: USER_STATUS.REJECTED },
            ]}
          />
        </Form.Item>

        {isBlockingOrRejecting && (
          <Form.Item
            name="rejectionReason"
            label={<span className="text-xs font-semibold text-slate-700">Reason / Admin Note</span>}
            rules={[{ required: true, message: "Please specify reason for blocking/rejecting" }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="e.g. Terms violation, suspicious activity, or identity mismatch..."
            />
          </Form.Item>
        )}

        <div className="flex justify-end gap-2 pt-3">
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            className="bg-[#FE375D] hover:bg-[#e0284e] border-none font-semibold"
          >
            Save Status
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
