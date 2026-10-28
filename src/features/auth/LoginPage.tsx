import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Card } from "antd";
import { MailOutlined, LockOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { useLoginMutation } from "@/redux/features/auth/authApi";
import { toast } from "sonner";

export default function LoginPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [login, { isLoading }] = useLoginMutation();

  const handleSubmit = async (values: { email: string; password?: string }) => {
    try {
      const res = await login(values).unwrap();
      toast.success(res?.message || "Welcome back to Nutsumo Admin!");
      navigate("/", { replace: true });
    } catch (err: any) {
      toast.error(err?.data?.message || "Invalid credentials or sign-in failed");
    }
  };

  const handleFillDemo = () => {
    form.setFieldsValue({
      email: "superadmin@gmail.com",
      password: "password@",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glow decorations */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[#FE375D]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FE375D] to-[#e0284e] items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-[#FE375D]/40 mb-3">
            N
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Nutsumo Admin Portal
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Sign in to manage artisans, users, and service categories
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
          >
            <Form.Item
              name="email"
              label={<span className="text-xs font-semibold uppercase text-slate-600">Email Address</span>}
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Please enter a valid email address" },
              ]}
            >
              <Input
                prefix={<MailOutlined className="text-slate-400 mr-1" />}
                placeholder="admin@nutsumo.com"
                size="large"
                className="rounded-xl"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span className="text-xs font-semibold uppercase text-slate-600">Password</span>}
              rules={[{ required: true, message: "Please enter your password" }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-slate-400 mr-1" />}
                placeholder="••••••••"
                size="large"
                className="rounded-xl"
              />
            </Form.Item>

            <div className="pt-2">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={isLoading}
                block
                className="bg-[#FE375D] hover:bg-[#e0284e] text-white font-semibold rounded-xl h-11 shadow-md shadow-[#FE375D]/30 border-none cursor-pointer"
              >
                Sign In to Dashboard
              </Button>
            </div>
          </Form>

          {/* Quick Demo Helper */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Quick fill credentials:</span>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-[#FE375D] hover:underline font-medium cursor-pointer"
            >
              Fill Admin Demo
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          © {new Date().getFullYear()} Nutsumo. All rights reserved.
        </p>
      </div>
    </div>
  );
}
