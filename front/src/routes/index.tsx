import { createBrowserRouter } from "react-router-dom";
import { adminRoutes } from "./admin.routes.tsx";
import { guestRoutes } from "./guest.routes.tsx";
import { NotFoundPage } from "../pages/error/404.tsx";
export const router = createBrowserRouter([
  adminRoutes,
  guestRoutes,
  // You can still add global routes here, like 404 pages
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
