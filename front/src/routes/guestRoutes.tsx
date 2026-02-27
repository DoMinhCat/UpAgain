import { type RouteObject } from "react-router-dom";
import GuestLayout from "../layouts/GuestLayout.tsx";
import Login from "../pages/guest/LoginPage.tsx";
import Register from "../pages/guest/RegisterPage.tsx";
import { PATHS } from "./paths.ts";

export const guestRoutes: RouteObject = {
  element: <GuestLayout />,
  children: [
    {
      path: PATHS.GUEST.LOGIN,
      element: <Login />, // page
    },
    {
      path: PATHS.GUEST.REGISTER,
      element: <Register />, // page
    },
  ],
};
