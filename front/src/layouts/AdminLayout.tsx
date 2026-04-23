import { AppShell, Burger, Group, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Outlet } from "react-router-dom";
import { AdminNavbar } from "../components/nav/AdminNavbar";

export default function AdminLayout() {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: { base: 60, sm: 0 } }}
      navbar={{
        width: { base: "100%", sm: 80 },
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
      withBorder={false}
    >
      {/* Mobile-only top bar — always visible so burger is always reachable */}
      <AppShell.Header hiddenFrom="sm" zIndex={200}>
        <Group h="100%" px="md" justify="space-between">
          <Burger opened={opened} onClick={toggle} size="sm" />
          <Text fw={700} size="sm" c="dimmed">
            Admin Panel
          </Text>
          <div style={{ width: 28 }} />
        </Group>
      </AppShell.Header>

      <AppShell.Navbar>
        <AdminNavbar
          onLinkClick={() => {
            if (opened) toggle();
          }}
        />
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
