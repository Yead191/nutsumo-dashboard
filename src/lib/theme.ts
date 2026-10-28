import type { ThemeConfig } from "antd";

export const nutsumoTheme: ThemeConfig = {
  token: {
    colorPrimary: "#FE375D",
    colorPrimaryHover: "#e0284e",
    colorPrimaryActive: "#c91d41",
    colorInfo: "#0284c7",
    colorSuccess: "#10b981",
    colorWarning: "#f59e0b",
    colorError: "#ef4444",
    borderRadius: 8,
    fontFamily: "'Geist', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: 14,
    colorBgBase: "#ffffff",
    colorTextBase: "#0f172a",
    colorBorder: "#e2e8f0",
  },
  components: {
    Button: {
      controlHeight: 40,
      borderRadius: 8,
      fontWeight: 600,
    },
    Table: {
      borderRadius: 12,
      headerBg: "#f8fafc",
      headerColor: "#475569",
      rowHoverBg: "#f1f5f9",
    },
    Card: {
      borderRadiusLG: 12,
    },
    Modal: {
      borderRadiusLG: 16,
    },
    Input: {
      controlHeight: 40,
      borderRadius: 8,
    },
    Select: {
      controlHeight: 40,
      borderRadius: 8,
    },
    Tag: {
      borderRadiusSM: 6,
    },
    Segmented: {
      controlHeight: 38,
      borderRadius: 8,
    },
  },
};
