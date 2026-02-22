import { type RouteObject } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout.tsx";
import AdminHome from "../pages/admin/AdminHome.tsx";
import { PATHS } from "./paths.ts";

export const adminRoutes: RouteObject = {
  path: PATHS.ADMIN.HOME,
  element: <AdminLayout />,
  children: [
    {
      index: true,
      element: <AdminHome />, // page
    },
    // Future admin routes go here
    // { path: "settings", element: <AdminSettings /> }
  ],
};
