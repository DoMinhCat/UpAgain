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
  IconUser,
} from "@tabler/icons-react";
import {
  Center,
  Stack,
  Tooltip,
  UnstyledButton,
  Image,
  Menu,
  Avatar,
} from "@mantine/core";
import classes from "../../styles/Admin.module.css";
import { useMantineColorScheme, useComputedColorScheme } from "@mantine/core";
import { IconSun, IconMoon } from "@tabler/icons-react";
import { useNavigate, useLocation } from "react-router-dom";
import { PATHS } from "../../../src/routes/paths";
import { useAuth } from "../../context/AuthContext";
import { useAccountDetails } from "../../hooks/accountHooks";

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

  let isActive = false;
  if (path) {
    if (path !== PATHS.ADMIN.HOME) {
      isActive = location.pathname.startsWith(path);
    } else {
      isActive = location.pathname === PATHS.ADMIN.HOME;
    }
  }

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
  { icon: IconUsers, label: "Users", path: PATHS.ADMIN.USERS.ALL },
  {
    icon: IconClipboardCheck,
    label: "Validations",
    path: PATHS.ADMIN.VALIDATIONS.ALL,
  },
  { icon: IconBox, label: "Containers", path: PATHS.ADMIN.CONTAINERS },
  {
    icon: IconCalendarEventFilled,
    label: "Events",
    path: PATHS.ADMIN.EVENTS.ALL,
  },
  { icon: IconArticle, label: "Posts", path: PATHS.ADMIN.POSTS },
  { icon: IconBuildingStore, label: "Listings", path: PATHS.ADMIN.LISTINGS },
  {
    icon: IconDiamond,
    label: "Subscriptions",
    path: PATHS.ADMIN.SUBSCRIPTIONS,
  },
  { icon: IconPigMoney, label: "Finance", path: PATHS.ADMIN.FINANCE.ALL },
];

export function AdminNavbar({ onLinkClick }: { onLinkClick?: () => void }) {
  const links = navButtonData.map((link) => (
    <NavbarLink {...link} key={link.label} onClick={onLinkClick} />
  ));
  const { logout } = useAuth();
  const navigate = useNavigate();

  const { user } = useAuth();
  const accountId = user?.id ? user.id : 0;
  const isValidId = !isNaN(accountId) && accountId > 0;
  const { data: accountDetails, error: errorAccountDetails } =
    useAccountDetails(accountId, isValidId);
  const handleLogout = () => {
    logout();
    navigate(PATHS.HOME, { replace: true });
  };

  // theme toggle
  const { setColorScheme } = useMantineColorScheme();
  const scheme = useComputedColorScheme("light");

  const toggle = () => {
    setColorScheme(scheme === "dark" ? "light" : "dark");
  };

  return (
    <nav className={classes.navbar}>
      <Center>
        <Image src="/common/logo.png" />
      </Center>

      <div className={classes.navbarMain}>
        <Stack justify="center" gap="sm">
          {links}
        </Stack>
      </div>

      <Stack justify="center" gap="sm" py="md">
        {!errorAccountDetails && (
          <Menu shadow="md" width={150}>
            <Menu.Target>
              {accountDetails?.avatar ? (
                <Avatar
                  src={accountDetails?.avatar}
                  name={accountDetails?.username}
                  color="initials"
                  size="40"
                  className={classes.avatarNavbar}
                />
              ) : (
                <Avatar
                  name={accountDetails?.username}
                  color="initials"
                  size="40"
                  className={classes.avatarNavbar}
                />
              )}
            </Menu.Target>

            <Menu.Dropdown>
              {/* TODO: navigate to personal profile page */}
              <Menu.Item leftSection={<IconUser size={14} />}>
                Profile
              </Menu.Item>
              <Menu.Item
                leftSection={
                  scheme === "dark" ? (
                    <IconSun size={14} />
                  ) : (
                    <IconMoon size={14} />
                  )
                }
                onClick={toggle}
              >
                {scheme === "dark" ? "Light mode" : "Dark mode"}
              </Menu.Item>

              <Menu.Divider />

              <Menu.Item
                leftSection={<IconLogout size={14} />}
                onClick={() => {
                  handleLogout();
                  if (onLinkClick) onLinkClick();
                }}
              >
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
      </Stack>
    </nav>
  );
}
