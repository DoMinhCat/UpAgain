import { type RouteObject } from "react-router-dom";
import GuestLayout from "../layouts/GuestLayout.tsx";
import Login from "../pages/guest/LoginPage.tsx";
import { PATHS } from "./paths.ts";

export const guestRoutes: RouteObject = {
  path: PATHS.GUEST.LOGIN,
  element: <GuestLayout />,
  children: [
    {
      index: true,
      element: <Login />, // page
    },
    // Future guest routes go here
  ],
};
