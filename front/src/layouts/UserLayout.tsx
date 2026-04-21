import { Box } from "@mantine/core";
import { Outlet } from "react-router-dom";
import PageFooter from "../components/chart/PageFooter";
import { UserNavBar } from "../components/nav/UserNavBar";

export default function UserLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  // Define your header height here so it's consistent
  const HEADER_HEIGHT = 60;

  return (
    <Box>
      {/* 1. The Header Container */}
      <Box
        component="header"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: HEADER_HEIGHT,
          zIndex: 100,
          backgroundColor: "var(--mantine-color-body)",
          borderBottom: "1px solid var(--mantine-color-gray-3)",
        }}
      >
        <UserNavBar />
      </Box>

      {/* 2. The Main Content Area */}
      <Box
        component="main"
        style={{
          paddingTop: HEADER_HEIGHT, // Offset for the fixed header
          minHeight: "100vh",
        }}
      >
        {children || <Outlet />}
      </Box>

      {/* FOOTER */}
      <PageFooter />
    </Box>
  );
}
