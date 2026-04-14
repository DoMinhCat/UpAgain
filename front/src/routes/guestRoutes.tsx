import { type RouteObject } from "react-router-dom";
import GuestLayout from "../layouts/GuestLayout.tsx";
import Login from "../pages/guest/LoginPage.tsx";
import Register from "../pages/guest/RegisterPage.tsx";
import AboutPage from "../pages/guest/AboutPage.tsx";
import { PATHS } from "./paths.ts";
import Home from "../pages/common/Home.tsx";

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
    {
      path: PATHS.GUEST.ABOUT,
      element: <AboutPage />, // page
    },
    {
      path: PATHS.HOME,
      element: <Home />, // page
    },
  ],
};
