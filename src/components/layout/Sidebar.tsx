import { useLocation, useNavigate } from "react-router-dom";
import { Badge } from "antd";
import { NAV_ITEMS, type NavItem } from "./navConfig";
import { cn } from "@/lib/utils";
import { useGetUserStatsQuery } from "@/redux/features/users/usersApi";

export function Sidebar({
  mobile,
  onNavigate,
}: {
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: statsRes } = useGetUserStatsQuery();

  const pendingCount = statsRes?.data?.pendingVerifications ?? 0;

  const isPathActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleItemClick = (item: NavItem) => {
    navigate(item.path);
    if (onNavigate) onNavigate();
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-white border-r border-slate-200 select-none",
        mobile ? "w-full" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FE375D] to-[#e0284e] flex items-center justify-center text-white font-extrabold text-lg shadow-sm shadow-[#FE375D]/30">
          N
        </div>
        <div>
          <span className="font-bold text-slate-900 tracking-tight text-lg">
            Nutsumo
          </span>
          <span className="ml-1.5 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-rose-50 text-[#FE375D] border border-rose-200">
            Admin
          </span>
        </div>
      </div>

      {/* Nav list */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Management
        </div>

        {NAV_ITEMS.map((item) => {
          const active = isPathActive(item.path);
          const Icon = item.icon;
          const showBadge = item.badgeKey === "pendingVerifications" && pendingCount > 0;

          return (
            <button
              key={item.key}
              onClick={() => handleItemClick(item)}
              className={cn(
                "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors text-left",
                active
                  ? "bg-[#FE375D] text-white shadow-sm shadow-[#FE375D]/25 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <div className="flex items-center gap-3">
                <span className={cn("text-base flex items-center", active ? "text-white" : "text-slate-500")}>
                  <Icon />
                </span>
                <span>{item.label}</span>
              </div>

              {showBadge && (
                <span
                  className={cn(
                    "text-[11px] font-bold px-2 py-0.5 rounded-full",
                    active
                      ? "bg-white text-[#FE375D]"
                      : "bg-[#FE375D] text-white"
                  )}
                >
                  {pendingCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* System Status footer */}
      <div className="p-4 border-t border-slate-100">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100 animate-pulse" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-800">Nutsumo Backend</p>
            <p className="text-[11px] text-slate-500 truncate">Connected: 10.10.26.173:5005</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
