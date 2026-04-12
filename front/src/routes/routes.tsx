import { createBrowserRouter } from "react-router-dom";
import { adminRoutes } from "./adminRoutes.tsx";
import { guestRoutes } from "./guestRoutes.tsx";
import { NotFoundPage } from "../pages/error/404.tsx";
import { UnauthorizedPage } from "../pages/error/403.tsx";
import { PATHS } from "./paths.ts";
import Home from "../pages/Home.tsx";
import GlobalErrorHandler from "../pages/error/GlobalErrorHandler.tsx";

export const router = createBrowserRouter([
  {
    errorElement: <GlobalErrorHandler />,
    children: [
      adminRoutes,
      guestRoutes,
      {
        path: PATHS.HOME,
        element: <Home />,
      },
      {
        path: "/404",
        element: <NotFoundPage />,
      },
      {
        path: "/403",
        element: <UnauthorizedPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
