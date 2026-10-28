import { Tag } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

interface StatusTagProps {
  status?: string;
  type?: "user" | "identity" | "availability";
}

export function StatusTag({ status, type = "user" }: StatusTagProps) {
  if (!status) return <Tag>—</Tag>;

  const val = status.toLowerCase();

  // User status
  if (type === "user") {
    switch (val) {
      case "active":
        return (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            Active
          </Tag>
        );
      case "blocked":
        return (
          <Tag color="error" icon={<CloseCircleOutlined />}>
            Blocked
          </Tag>
        );
      case "pending":
        return (
          <Tag color="warning" icon={<ClockCircleOutlined />}>
            Pending
          </Tag>
        );
      case "rejected":
        return (
          <Tag color="error" icon={<CloseCircleOutlined />}>
            Rejected
          </Tag>
        );
      default:
        return <Tag>{status}</Tag>;
    }
  }

  // Identity verification status
  if (type === "identity") {
    switch (val) {
      case "verified":
        return (
          <Tag color="success" icon={<SafetyCertificateOutlined />}>
            Verified
          </Tag>
        );
      case "pending":
        return (
          <Tag color="processing" icon={<ClockCircleOutlined />}>
            Pending Review
          </Tag>
        );
      case "needs_update":
        return (
          <Tag color="warning" icon={<ExclamationCircleOutlined />}>
            Needs Update
          </Tag>
        );
      case "not_submitted":
      default:
        return <Tag color="default">Not Submitted</Tag>;
    }
  }

  // Availability status
  if (type === "availability") {
    switch (val) {
      case "available":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Available
          </span>
        );
      case "booked":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Booked
          </span>
        );
      case "unavailable":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Unavailable
          </span>
        );
    }
  }

  return <Tag>{status}</Tag>;
}
