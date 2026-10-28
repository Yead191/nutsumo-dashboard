import type { ReactNode } from "react";
import { ConfigProvider, App as AntdApp } from "antd";
import { Toaster } from "sonner";
import { nutsumoTheme } from "@/lib/theme";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider theme={nutsumoTheme}>
      <AntdApp>
        {children}
        <Toaster
          theme="light"
          position="top-right"
          richColors
          toastOptions={{
            style: {
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              color: "#0f172a",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
            },
          }}
        />
      </AntdApp>
    </ConfigProvider>
  );
}
