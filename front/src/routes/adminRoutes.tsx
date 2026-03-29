import { type RouteObject } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout.tsx";
import AdminHome from "../pages/admin/AdminHome.tsx";
import AdminUsersDeleted from "../pages/admin/usersAdmin/AdminUsersDeleted.tsx";
import { PATHS } from "./paths.ts";
import { useAuth } from "../context/AuthContext.tsx";
import FullScreenLoader from "../components/FullScreenLoader.tsx";
import AdminUsersModule from "../pages/admin/usersAdmin/AdminUsersModule.tsx";
import AdminUserDetails from "../pages/admin/usersAdmin/AdminUserDetails.tsx";
import AdminValidationHub from "../pages/admin/validationsAdmin/AdminValidationHub.tsx";
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AdminValidationDetails from "../pages/admin/validationsAdmin/AdminValidationDetails.tsx";
import AdminContainersModule from "../pages/admin/containersAdmin/AdminContainersModule.tsx";
import AdminContainersDetails from "../pages/admin/containersAdmin/AdminContainersDetails.tsx";
import AdminEventsModule from "../pages/admin/eventsAdmin/AdminEventsModule.tsx";
import AdminEventDetails from "../pages/admin/eventsAdmin/AdminEventDetails.tsx";
import { AdminPostsModule } from "../pages/admin/postsAdmin/AdminPostsModule.tsx";
import { AdminPostDetails } from "../pages/admin/postsAdmin/AdminPostDetails.tsx";

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
      <AdminLayout />
    </AdminGuard>
  ),
  children: [
    {
      index: true,
      element: <AdminHome />, // home page user hub
    },
    {
      path: "users",
      children: [
        { index: true, element: <AdminUsersModule /> },
        {
          path: "deleted", // "/admin/users/deleted
          element: <AdminUsersDeleted />,
        },
        {
          path: ":id", // Affiche <AdminUserDetails /> sur "/admin/users/:id"
          element: <AdminUserDetails />,
        },
      ],
    },
    {
      path: "validations",
      children: [
        { index: true, element: <AdminValidationHub /> },
        {
          path: ":type/:id", // Gérera /admin/validations/deposits/1
          element: <AdminValidationDetails />,
        },
      ],
    },
    {
      path: "containers",
      children: [
        { index: true, element: <AdminContainersModule /> },
        {
          path: ":id",
          element: <AdminContainersDetails />,
        },
      ],
    },
    {
      path: "events",
      children: [
        { index: true, element: <AdminEventsModule /> },
        {
          path: ":id",
          element: <AdminEventDetails />,
        },
      ],
    },
    {
      path: "posts",
      children: [
        { index: true, element: <AdminPostsModule /> },
        {
          path: ":id",
          element: <AdminPostDetails />,
        },
      ],
    },
    {
      path: "history",
      children: [
        {
          path: ":id",
          element: <div>History Details (empty for now)</div>,
        },
      ],
    },
  ],
};
