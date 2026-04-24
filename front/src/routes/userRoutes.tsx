import { type ReactNode, useEffect, useRef } from "react";
import { type RouteObject, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PATHS } from "./paths";
import FullScreenLoader from "../components/common/FullScreenLoader";
import UserLayout from "../layouts/UserLayout";
import GuestLayout from "../layouts/GuestLayout";
import GuestHome from "../pages/guest/GuestHome";
import UserScorePage from "../pages/user/UserScorePage";
import Profile from "../pages/common/Profile";
import Home from "../pages/common/Home";
import EventPage from "../pages/common/event/EventPage";
import EventCategoryPage from "../pages/common/event/EventCategoryPage";
import { showErrorNotification } from "../components/common/NotificationToast";
import EventDetailPage from "../pages/common/event/EventDetailPage";

const UserGuard = ({ children }: { children: ReactNode }) => {
  const { user, isInitializing } = useAuth();
  const location = useLocation();
  const pathname = location.pathname;
  const prevUser = useRef(user);

  useEffect(() => {
    // Only show notification if user is NOT logged in AND they didn't just log out
    // (i.e. they were already logged out and are trying to access the page)
    if (
      !isInitializing &&
      !user &&
      !prevUser.current &&
      (pathname.includes("events") ||
        pathname.includes("score") ||
        pathname.includes("profile") ||
        pathname.includes("marketplace"))
    ) {
      if (pathname !== PATHS.GUEST.LOGIN) {
        showErrorNotification(
          "Login required",
          "You must be logged in to access this page",
        );
      }
    }
    prevUser.current = user;
  }, [isInitializing, user, location.pathname]);

  if (isInitializing) {
    return <FullScreenLoader />;
  }

  if (!user) {
    // If guest is on the home page, show the guest home view with GuestLayout
    if (location.pathname === PATHS.HOME) {
      return (
        <GuestLayout>
          <GuestHome />
        </GuestLayout>
      );
    }

    return (
      <Navigate to={PATHS.GUEST.LOGIN} replace state={{ from: location }} />
    );
  }

  return <>{children}</>;
};

export const userRoutes: RouteObject = {
  path: PATHS.HOME,
  element: (
    <UserGuard>
      <UserLayout />
    </UserGuard>
  ),
  children: [
    {
      index: true,
      element: <Home />,
    },
    { path: "score", element: <UserScorePage /> },
    { path: "profile", element: <Profile /> },
    {
      path: "events",
      children: [
        { index: true, element: <EventPage /> },
        {
          path: ":category",
          children: [
            { index: true, element: <EventCategoryPage /> },
            { path: ":id", element: <EventDetailPage /> },
          ],
        },
      ],
    },
  ],
};
