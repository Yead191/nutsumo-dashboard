import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

export function PageLoader({ text = "Loading dashboard..." }: { text?: string }) {
  const antIcon = <LoadingOutlined style={{ fontSize: 36, color: "#FE375D" }} spin />;
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
      <Spin indicator={antIcon} />
      <span className="text-sm font-medium text-slate-500">{text}</span>
    </div>
  );
}
