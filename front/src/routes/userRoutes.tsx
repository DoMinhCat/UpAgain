import { Navigate, type RouteObject } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isTokenExpired } from "../api/auth";
import { PATHS } from "./paths";

const UserGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const unauthorized = !user || user.role !== "admin" || isTokenExpired();

  if (unauthorized) {
    if (user && isTokenExpired()) logout();

    return <Navigate to={PATHS.GUEST.LOGIN} replace />;
  }

  return <>{children}</>;
};

export const adminRoutes: RouteObject = {
  path: PATHS.ADMIN.HOME,
  element: (
    <UserGuard>
      {/* TODO */}
      <UserLayout />,
    </UserGuard>
  ),
  children: [
    {
      index: true,
      // TODO
      element: <UserHome />, // page
    },
    // Future admin routes go here
    // { path: "settings", element: <AdminSettings /> }
  ],
};
