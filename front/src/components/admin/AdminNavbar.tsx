import { useState } from "react";
import {
  IconCalendarEventFilled,
  IconClipboardCheck,
  IconDiamond,
  IconUsers,
  IconHome2,
  IconLogout,
  IconPigMoney,
  IconBox,
  IconArticle,
  IconBuildingStore,
} from "@tabler/icons-react";
import { Center, Stack, Tooltip, UnstyledButton, Image } from "@mantine/core";
import classes from "./Admin.module.css";
import { useMantineColorScheme, useComputedColorScheme } from "@mantine/core";
import { IconSun, IconMoon } from "@tabler/icons-react";

interface NavbarLinkProps {
  icon: typeof IconHome2;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export function NavbarLink({
  icon: Icon,
  label,
  active,
  onClick,
}: NavbarLinkProps) {
  return (
    <Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
      <UnstyledButton
        onClick={onClick}
        className={classes.link}
        data-active={active || undefined}
        aria-label={label}
      >
        <Icon size={20} stroke={1.5} />
      </UnstyledButton>
    </Tooltip>
  );
}

const navButtonData = [
  { icon: IconHome2, label: "Overview" },
  { icon: IconUsers, label: "Users" },
  { icon: IconClipboardCheck, label: "Validations" },
  { icon: IconBox, label: "Containers" },
  { icon: IconCalendarEventFilled, label: "Events" },
  { icon: IconDiamond, label: "Subscriptions" },
  { icon: IconArticle, label: "Posts" },
  { icon: IconBuildingStore, label: "Listings" },
  { icon: IconPigMoney, label: "Finance" },
];

function ThemeToggleButton() {
  const { setColorScheme } = useMantineColorScheme();
  const scheme = useComputedColorScheme("light");

  const toggle = () => setColorScheme(scheme === "dark" ? "light" : "dark");

  return (
    <NavbarLink
      icon={scheme === "dark" ? IconSun : IconMoon}
      label="Toggle theme"
      onClick={toggle}
    />
  );
}

export function AdminNavbar() {
  const [active, setActive] = useState(2);

  const links = navButtonData.map((link, index) => (
    <NavbarLink
      {...link}
      key={link.label}
      active={index === active}
      onClick={() => setActive(index)}
    />
  ));

  return (
    <nav className={classes.navbar}>
      <Center>
        <Image src="../../src/assets/logo.png" />
      </Center>

      <div className={classes.navbarMain}>
        <Stack justify="center" gap={0}>
          {links}
        </Stack>
      </div>

      <Stack justify="center" gap={0}>
        <ThemeToggleButton />

        {/* TODO: User avatar */}
        <NavbarLink icon={IconLogout} label="Logout" />
      </Stack>
    </nav>
  );
}
