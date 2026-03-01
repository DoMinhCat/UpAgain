import { type RouteObject, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PATHS } from "./paths";
import { useEffect } from "react";
import { Center, Loader } from "@mantine/core";

const UserGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, isInitializing } = useAuth();
  const unauthorized = !user || user.role !== "admin";
  const navigate = useNavigate();

  useEffect(() => {
    if (unauthorized) {
      navigate(PATHS.GUEST.LOGIN, { replace: true });
    }
  }, [unauthorized]);

  if (isInitializing) {
    return (
      <Center style={{ width: "100vw", height: "100vh" }}>
        <Loader size="xl" />
      </Center>
    );
  }
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
