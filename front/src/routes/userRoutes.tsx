import { type RouteObject, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PATHS } from "./paths";
import FullScreenLoader from "../components/common/FullScreenLoader";
import UserLayout from "../layouts/UserLayout";
import UserHome from "../pages/user/UserHome";
import GuestLayout from "../layouts/GuestLayout";
import GuestHome from "../pages/guest/GuestHome";
import { Navigate } from "react-router-dom";
import UserScorePage from "../pages/user/UserScorePage";
import UserPostsPage from "../pages/user/posts/UserPostsPage";
import UserPostDetailPage from "../pages/user/posts/UserPostDetailPage";

const UserGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, isInitializing } = useAuth();
  const location = useLocation();

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
    // Oherwise if guest go to user routes, redirect to login
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
      element: <UserHome />,
    },
    { path: "score", element: <UserScorePage /> },
    { path: "community", element: <UserPostsPage /> },
    { path: "community/:id", element: <UserPostDetailPage /> },
  ],
};
