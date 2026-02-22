import { AppShell } from "@mantine/core";
import { Outlet } from "react-router-dom";
import { AdminNavbar } from "../components/admin/AdminNavbar";

export default function AdminLayout() {
  return (
    <AppShell
      padding="md"
      navbar={{
        width: 80,
        breakpoint: "sm",
      }}
    >
      <AppShell.Navbar>
        <AdminNavbar />
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
