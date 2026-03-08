import { type RouteObject } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout.tsx";
import AdminHome from "../pages/admin/AdminHome.tsx";
import { PATHS } from "./paths.ts";
import { useAuth } from "../context/AuthContext.tsx";
import FullScreenLoader from "../components/FullScreenLoader.tsx";
import AdminUsersModule from "../pages/admin/AdminUsersModule.tsx";
import AdminUserDetails from "../pages/admin/AdminUserDetails.tsx";
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AdminContainersModule from "../pages/admin/AdminContainersModule.tsx";

// implement the same Guard component for user and pro
const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isInitializing } = useAuth();
  const unauthorized = !user || user.role !== "admin";

  useEffect(() => {
    if (unauthorized) {
      navigate(PATHS.GUEST.LOGIN, { replace: true, state: { from: location } });
    }
  }, [unauthorized]);

  if (isInitializing) {
    return <FullScreenLoader />;
  }
  if (unauthorized) return null;

  return <>{children}</>;
};

export const adminRoutes: RouteObject = {
  path: PATHS.ADMIN.HOME,
  element: (
    <AdminGuard>
      <AdminLayout />,
    </AdminGuard>
  ),
  children: [
    {
      index: true,
      element: <AdminHome />, // home page user hub
    },
    {
      path: PATHS.ADMIN.USERS, // Affiche <AdminUsersModule /> sur "/admin/users"
      element: <AdminUsersModule />,
    },
    {
      path: PATHS.ADMIN.USERS + "/:id", // Affiche <AdminUserDetails /> sur "/admin/users/:id"
      element: <AdminUserDetails />,
    },
    {
      path: PATHS.ADMIN.CONTAINERS, 
      element: <AdminContainersModule />,
    },
  ],
};
