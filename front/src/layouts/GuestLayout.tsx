import { Box } from "@mantine/core";
import { Outlet } from "react-router-dom";
import { GuestHeader } from "../components/guest/GuestHeader";

export default function GuestLayout() {
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
          zIndex: 1000,
          backgroundColor: "var(--mantine-color-body)",
          borderBottom: "1px solid var(--mantine-color-gray-3)",
        }}
      >
        <GuestHeader />
      </Box>

      {/* 2. The Main Content Area */}
      <Box
        component="main"
        style={{
          paddingTop: HEADER_HEIGHT, // Offset for the fixed header
          minHeight: "100vh",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
