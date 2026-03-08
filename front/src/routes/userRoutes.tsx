import { type RouteObject, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PATHS } from "./paths";
import { useEffect } from "react";
import FullScreenLoader from "../components/FullScreenLoader";

const UserGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, isInitializing } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const unauthorized = !user || user.role !== "admin";

  useEffect(() => {
    if (unauthorized) {
      navigate(PATHS.GUEST.LOGIN, { replace: true, state: { from: location } });
    }
  }, [unauthorized]);

  if (isInitializing) {
    return <FullScreenLoader />;
  }
  if (unauthorized) return null;

  return <>{children}</>;
};

export const adminRoutes: RouteObject = {
  path: PATHS.ADMIN.HOME,
  element: (
    <UserGuard>
      {/* TODO */}
      {/* <UserLayout /> */}
      <div>User layout</div>
    </UserGuard>
  ),
  children: [
    {
      index: true,
      // TODO
      // element: <UserHome />, // page
      element: <div>User home</div>,
    },
    // Future admin routes go here
    // { path: "settings", element: <AdminSettings /> }
  ],
};
