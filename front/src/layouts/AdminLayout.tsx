import { AppShell, Burger, Group, Image } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Outlet } from "react-router-dom";
import { AdminNavbar } from "../components/admin/AdminNavbar";

export default function AdminLayout() {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60, collapsed: !opened, offset: false }}
      navbar={{
        width: 80,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header hiddenFrom="sm" zIndex={100}>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Image src="/brand-name.png" h={30} w="auto" />
        </Group>
      </AppShell.Header>

      <AppShell.Navbar>
        <AdminNavbar onLinkClick={() => {
          if (opened) toggle();
        }} />
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
