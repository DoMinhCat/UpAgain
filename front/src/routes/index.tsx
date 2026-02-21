import { createBrowserRouter } from "react-router-dom";
import { adminRoutes } from "./admin.routes.tsx";

export const router = createBrowserRouter([
  adminRoutes,
  // You can still add global routes here, like 404 pages
  // {
  //   path: "*",
  //   element: <NotFound />,
  // },
]);
