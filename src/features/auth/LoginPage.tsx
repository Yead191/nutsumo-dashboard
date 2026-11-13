import { useNavigate } from "react-router-dom";
import { Form, Input, Button } from "antd";
import { useLoginMutation } from "@/redux/features/auth/authApi";
import { isDashboardRole } from "@/features/auth/roles";
import { apiErrorMessage } from "@/lib/ref";
import { toast } from "sonner";

export default function LoginPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [login, { isLoading }] = useLoginMutation();

  const handleSubmit = async (values: { email: string; password?: string }) => {
    try {
      const res = await login(values).unwrap();
      const role = res?.data?.user?.role || res?.data?.role;
      if (!isDashboardRole(role)) {
        toast.error("Only admin and super admin accounts can open this desk.");
        return;
      }
      toast.success(res?.message || "Signed in");
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(apiErrorMessage(err, "Those credentials were not accepted"));
    }
  };

  return (
    <div className="grid min-h-screen bg-[#fbf8f7] lg:grid-cols-[1.05fr_0.95fr]">
      <section className="hidden flex-col justify-between border-r border-[#f3e4e6] bg-[#fff7f8] px-12 py-10 text-stone-900 lg:flex">
        <img src="/logo.png" alt="Nutsumo" className="h-12 w-auto object-contain" />
        <div className="max-w-md">
          <p className="text-sm font-medium text-[#FE375D]">Operations</p>
          <h1 className="mt-3 text-4xl font-semibold leading-[1.15] tracking-tight text-stone-900">
            The desk for jobs, escrow, and the people who do the work.
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-stone-500">
            Identity checks, custom services, bookings, and payouts live here. Customers and artisans stay on the marketplace.
          </p>
        </div>
        <p className="text-xs text-stone-400">Ghana home services</p>
      </section>

      <section className="flex items-start justify-center px-5 py-10 sm:items-center">
        <div className="w-full max-w-sm">
          <img
            src="/logo.png"
            alt="Nutsumo"
            className="mb-8 h-12 w-auto object-contain lg:hidden"
          />
          <h2 className="text-2xl font-semibold tracking-tight text-stone-900">Sign in</h2>
          <p className="mt-1 mb-6 text-sm text-stone-500">Admin and super admin accounts only.</p>

          <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Enter your email" },
                { type: "email", message: "That email does not look right" },
              ]}
            >
              <Input placeholder="you@nutsumo.com" size="large" />
            </Form.Item>
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: "Enter your password" }]}
            >
              <Input.Password placeholder="Password" size="large" />
            </Form.Item>
            <Button type="primary" htmlType="submit" size="large" loading={isLoading} block>
              Continue
            </Button>
          </Form>
        </div>
      </section>
    </div>
  );
}
