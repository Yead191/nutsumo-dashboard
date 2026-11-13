import { useLocation, useNavigate } from "react-router-dom";
import { NAV_GROUPS, type NavItem } from "./navConfig";
import { cn } from "@/lib/utils";
import { useGetUserStatsQuery } from "@/redux/features/users/usersApi";
import { useAppSelector } from "@/redux/hooks";
import { selectCurrentUser } from "@/redux/features/auth/authSlice";

export function Sidebar({
  mobile,
  onNavigate,
}: {
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAppSelector(selectCurrentUser);
  const { data: statsRes } = useGetUserStatsQuery();
  const pendingCount = statsRes?.data?.pendingVerifications ?? 0;

  const isPathActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleItemClick = (item: NavItem) => {
    navigate(item.path);
    onNavigate?.();
  };

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-[#f0e4e6] bg-white text-stone-600",
        mobile ? "w-full" : "w-[248px]",
      )}
    >
      <div className="flex h-[72px] items-center px-5">
        <img src="/logo.png" alt="Nutsumo" className="h-10 w-auto object-contain" />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="px-3 pb-2 text-[11px] font-medium text-stone-400">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isPathActive(item.path);
                const Icon = item.icon;
                const showBadge =
                  item.badgeKey === "pendingVerifications" && pendingCount > 0;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleItemClick(item)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[13.5px]",
                      active
                        ? "bg-[#fff1f3] font-medium text-[#d4234c]"
                        : "text-stone-600 hover:bg-[#faf6f6] hover:text-stone-900",
                    )}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon size={16} strokeWidth={1.75} />
                      {item.label}
                    </span>
                    {showBadge && (
                      <span className="rounded-full bg-[#FE375D] px-1.5 py-0.5 text-[10px] font-semibold text-white tabular-nums">
                        {pendingCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-[#f3e8ea] px-5 py-4">
        <p className="truncate text-sm font-medium text-stone-900">{user?.name || "Admin"}</p>
        <p className="mt-0.5 truncate text-xs text-stone-400">
          {user?.role?.replaceAll("_", " ") || "Operations"}
        </p>
      </div>
    </aside>
  );
}
