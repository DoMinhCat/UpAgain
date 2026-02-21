import { type RouteObject } from "react-router-dom";
import AdminLayout from "../layouts/admin/AdminLayout.tsx";
import AdminHome from "../pages/admin/AdminHome.tsx";

export const adminRoutes: RouteObject = {
  path: "/admin",
  element: <AdminLayout />,
  children: [
    {
      index: true,
      element: <AdminHome />,
    },
    // Future admin routes go here
    // { path: "settings", element: <AdminSettings /> }
  ],
};
