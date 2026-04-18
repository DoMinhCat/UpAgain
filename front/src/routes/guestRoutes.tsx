import { type RouteObject } from "react-router-dom";
import GuestLayout from "../layouts/GuestLayout.tsx";
import Login from "../pages/guest/LoginPage.tsx";
import Register from "../pages/guest/RegisterPage.tsx";
import AboutPage from "../pages/guest/AboutPage.tsx";
import ContactPage from "../pages/guest/ContactPage.tsx";
import { PATHS } from "./paths.ts";
import Home from "../pages/common/Home.tsx";
import PricingPage from "../pages/guest/PricingPage.tsx";

export const guestRoutes: RouteObject = {
  element: <GuestLayout />,
  children: [
    {
      path: PATHS.GUEST.LOGIN,
      element: <Login />,
    },
    {
      path: PATHS.GUEST.REGISTER,
      element: <Register />,
    },
    {
      path: PATHS.GUEST.ABOUT,
      element: <AboutPage />,
    },
    {
      path: PATHS.GUEST.CONTACT,
      element: <ContactPage />,
    },
    {
      path: PATHS.HOME,
      element: <Home />,
    },
    {
      path: PATHS.GUEST.PRICING,
      element: <PricingPage />,
    },
  ],
};
