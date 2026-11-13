import { Dropdown, type MenuProps } from "antd";
import { Menu } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logout, selectCurrentUser } from "@/redux/features/auth/authSlice";
import { getInitials } from "@/lib/utils";
import { toast } from "sonner";
import { titleForPath } from "./navConfig";

interface TopbarProps {
  onToggleSidebar?: () => void;
}

export function Topbar({ onToggleSidebar }: TopbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Signed out");
    navigate("/login");
  };

  const userMenuItems: MenuProps["items"] = [
    {
      key: "info",
      label: (
        <div className="px-1 py-1">
          <p className="text-sm font-medium text-stone-900">{user?.name || "Admin"}</p>
          <p className="text-xs text-stone-500">{user?.email}</p>
        </div>
      ),
      disabled: true,
    },
    { type: "divider" },
    {
      key: "logout",
      label: "Sign out",
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[#e7e2da] bg-[#f6f4f1]/95 px-4 backdrop-blur-sm md:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded-md p-1.5 text-stone-600 hover:bg-stone-200/70 md:hidden"
          aria-label="Open navigation"
        >
          <Menu size={18} />
        </button>
        <h1 className="text-[15px] font-semibold text-stone-900">
          {titleForPath(location.pathname)}
        </h1>
      </div>

      <Dropdown menu={{ items: userMenuItems }} trigger={["click"]} placement="bottomRight">
        <button
          type="button"
          className="flex items-center gap-2 rounded-full py-1 pr-2 pl-1 hover:bg-white"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FE375D] text-[11px] font-semibold text-white">
            {getInitials(user?.name)}
          </span>
          <span className="hidden text-left text-xs md:block">
            <span className="block font-medium text-stone-800">{user?.name || "Admin"}</span>
            <span className="block text-stone-500">{user?.role?.replaceAll("_", " ")}</span>
          </span>
        </button>
      </Dropdown>
    </header>
  );
}
