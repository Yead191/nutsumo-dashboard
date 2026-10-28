import { Avatar, Button, Dropdown, type MenuProps } from "antd";
import {
  MenuOutlined,
  LogoutOutlined,
  UserOutlined,
  BellOutlined,
  } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logout, selectCurrentUser } from "@/redux/features/auth/authSlice";
import { getInitials } from "@/lib/utils";
import { toast } from "sonner";

interface TopbarProps {
  onToggleSidebar?: () => void;
}

export function Topbar({ onToggleSidebar }: TopbarProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const userMenuItems: MenuProps["items"] = [
    {
      key: "info",
      label: (
        <div className="py-1 px-1">
          <p className="font-semibold text-slate-800 text-sm">{user?.name || "Administrator"}</p>
          <p className="text-xs text-slate-500">{user?.email || "admin@nutsumo.com"}</p>
        </div>
      ),
      disabled: true,
    },
    { type: "divider" },
    {
      key: "logout",
      label: "Sign Out",
      icon: <LogoutOutlined className="text-rose-600" />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <header className="h-16 px-4 md:px-8 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Mobile toggle & breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
        >
          <MenuOutlined className="text-lg" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="hover:text-slate-800 cursor-pointer" onClick={() => navigate("/")}>
            Nutsumo Platform
          </span>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Management Console</span>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <Dropdown menu={{ items: userMenuItems }} trigger={["click"]} placement="bottomRight">
          <button className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-200">
            <Avatar
              size={36}
              className="bg-gradient-to-tr from-[#FE375D] to-[#e0284e] text-white font-semibold shadow-xs"
            >
              {getInitials(user?.name)}
            </Avatar>
            <div className="hidden md:block text-left text-xs">
              <p className="font-semibold text-slate-800 leading-tight">
                {user?.name || "Admin"}
              </p>
              <p className="text-[11px] text-slate-500 uppercase font-medium">
                {user?.role || "SUPER_ADMIN"}
              </p>
            </div>
          </button>
        </Dropdown>
      </div>
    </header>
  );
}
