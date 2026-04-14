import { type RouteObject, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PATHS } from "./paths";
import { useEffect } from "react";
import FullScreenLoader from "../components/common/FullScreenLoader";

const UserGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, isInitializing } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const unauthorized = !user || user.role !== "admin";

  useEffect(() => {
    if (!isInitializing && unauthorized) {
      navigate(PATHS.HOME, { replace: true, state: { from: location } });
    }
  }, [unauthorized, isInitializing, navigate, location]);

  if (isInitializing) {
    return <FullScreenLoader />;
  }
  if (unauthorized) return null;

  return <>{children}</>;
};

export const userRoutes: RouteObject = {
  path: PATHS.ADMIN.HOME,
  element: (
    <UserGuard>
      {/* <UserLayout /> */}
      <div>User layout</div>
    </UserGuard>
  ),
  children: [
    {
      index: true,
      // element: <UserHome />, // page
      element: <div>User home</div>,
    },
    // Future admin routes go here
    // { path: "settings", element: <AdminSettings /> }
  ],
};
