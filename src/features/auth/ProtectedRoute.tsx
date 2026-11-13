import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logout, selectCurrentToken } from "@/redux/features/auth/authSlice";
import { isDashboardRole, readTokenRole } from "./roles";

export function ProtectedRoute() {
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectCurrentToken);
  const allowed = isDashboardRole(readTokenRole(token));

  useEffect(() => {
    if (token && !allowed) {
      dispatch(logout());
    }
  }, [allowed, dispatch, token]);

  if (!allowed) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
