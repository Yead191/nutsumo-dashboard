import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Drawer } from "antd";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function DashboardLayout() {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f6f4f1]">
      <div className="sticky top-0 hidden h-screen w-[248px] shrink-0 md:block">
        <Sidebar />
      </div>

      <Drawer
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        placement="left"
        title={null}
        closable={false}
        styles={{ body: { padding: 0, background: "#ffffff" } }}
        size={248}
      >
        <Sidebar mobile onNavigate={() => setMobileDrawerOpen(false)} />
      </Drawer>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onToggleSidebar={() => setMobileDrawerOpen(true)} />
        <main className="w-full flex-1 px-4 py-6 md:px-8 md:py-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
