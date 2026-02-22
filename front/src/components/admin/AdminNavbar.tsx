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
import classes from "../../styles/Admin.module.css";
import { useMantineColorScheme, useComputedColorScheme } from "@mantine/core";
import { IconSun, IconMoon } from "@tabler/icons-react";
import { useNavigate, useLocation } from "react-router-dom";
import { PATHS } from "../../../src/routes/paths";

interface NavbarLinkProps {
  icon: typeof IconHome2;
  label: string;
  active?: boolean;
  path?: string;
  onClick?: () => void;
}

function NavbarLink({ icon: Icon, label, path, onClick }: NavbarLinkProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = path && location.pathname.startsWith(path);

  const handleClick = () => {
    if (path) {
      navigate(path);
    }
    if (onClick) {
      onClick();
    }
  };

  return (
    <Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
      <UnstyledButton
        onClick={handleClick}
        className={classes.link}
        data-active={isActive || undefined}
        aria-label={label}
      >
        <Icon size={20} stroke={1.5} />
      </UnstyledButton>
    </Tooltip>
  );
}

const navButtonData = [
  { icon: IconHome2, label: "Overview", path: PATHS.ADMIN.HOME },
  { icon: IconUsers, label: "Users", path: PATHS.ADMIN.USERS },
  {
    icon: IconClipboardCheck,
    label: "Validations",
    path: "/admin/validations",
  },
  { icon: IconBox, label: "Containers", path: PATHS.ADMIN.CONTAINERS },
  { icon: IconCalendarEventFilled, label: "Events", path: PATHS.ADMIN.EVENTS },
  {
    icon: IconDiamond,
    label: "Subscriptions",
    path: PATHS.ADMIN.SUBSCRIPTIONS,
  },
  { icon: IconArticle, label: "Posts", path: PATHS.ADMIN.POSTS },
  { icon: IconBuildingStore, label: "Listings", path: PATHS.ADMIN.LISTINGS },
  { icon: IconPigMoney, label: "Finance", path: PATHS.ADMIN.FINANCE },
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
  const links = navButtonData.map((link) => (
    <NavbarLink {...link} key={link.label} />
  ));

  return (
    <nav className={classes.navbar}>
      <Center>
        <Image src="/logo.png" />
      </Center>

      <div className={classes.navbarMain}>
        <Stack justify="center" gap="sm">
          {links}
        </Stack>
      </div>

      <Stack justify="center" gap="sm">
        <ThemeToggleButton />

        {/* TODO: User avatar */}
        <NavbarLink icon={IconLogout} label="Logout" />
      </Stack>
    </nav>
  );
}
