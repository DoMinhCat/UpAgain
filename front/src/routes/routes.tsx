import { createBrowserRouter } from "react-router-dom";
import { adminRoutes } from "./adminRoutes.tsx";
import { guestRoutes } from "./guestRoutes.tsx";
import { NotFoundPage } from "../pages/error/404.tsx";
import { UnauthorizedPage } from "../pages/error/403.tsx";
import { PATHS } from "./paths.ts";
import GlobalErrorHandler from "../pages/error/GlobalErrorHandler.tsx";
import { InternalServerErrorPage } from "../pages/error/500.tsx";
import { userRoutes } from "./userRoutes.tsx";

export const router = createBrowserRouter([
  {
    errorElement: <GlobalErrorHandler />,
    children: [
      adminRoutes,
      guestRoutes,
      userRoutes,
      {
        path: PATHS.ERROR.NOT_FOUND,
        element: <NotFoundPage />,
      },
      {
        path: PATHS.ERROR.UNAUTHORIZED,
        element: <UnauthorizedPage />,
      },
      {
        path: PATHS.ERROR.INTERNAL_SERVER_ERROR,
        element: <InternalServerErrorPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
