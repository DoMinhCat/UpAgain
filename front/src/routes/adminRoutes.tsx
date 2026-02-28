import { type RouteObject, Navigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout.tsx";
import AdminHome from "../pages/admin/AdminHome.tsx";
import { PATHS } from "./paths.ts";
import { useAuth } from "../context/AuthContext.tsx";
import { isTokenExpired } from "../api/auth.ts";
import AdminUsersModule from "../pages/admin/AdminUsersModule.tsx";
import { Center, Loader } from "@mantine/core";
import AdminUserDetails from "../pages/admin/AdminUserDetails.tsx";

// implement the same Guard component for user and pro
const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, logout, isInitializing } = useAuth();
  const unauthorized = !user || user.role !== "admin" || isTokenExpired();

  if (isInitializing) {
    return (
      <Center style={{ width: "100vw", height: "100vh" }}>
        <Loader size="xl" />
      </Center>
    );
  }

  if (unauthorized) {
    if (user && isTokenExpired()) logout();

    return <Navigate to={PATHS.GUEST.LOGIN} replace />;
  }

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
      path: "users", // Affiche <AdminUsersModule /> sur "/admin/users"
      element: <AdminUsersModule />,
    },
    {
      path: "users/:id",
      element: <AdminUserDetails />,
    },
  ],
};
