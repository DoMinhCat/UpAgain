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
  IconChevronRight,
} from "@tabler/icons-react";
import {
  Center,
  Stack,
  Tooltip,
  UnstyledButton,
  Image,
  Menu,
  Avatar,
  Group,
  Text,
} from "@mantine/core";
import classes from "../../styles/Admin.module.css";
import { useMantineColorScheme, useComputedColorScheme } from "@mantine/core";
import { IconSun, IconMoon } from "@tabler/icons-react";
import { useNavigate, useLocation } from "react-router-dom";
import { PATHS } from "../../routes/paths";
import { useAuth } from "../../context/AuthContext";
import { useAccountDetails } from "../../hooks/accountHooks";
import { useTranslation } from "react-i18next";
import { LANGUAGES } from "../../i18n/index";

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
    <Tooltip
      label={label}
      position="right"
      transitionProps={{ duration: 0 }}
      visibleFrom="sm"
    >
      <UnstyledButton
        onClick={handleClick}
        className={classes.link}
        data-active={isActive || undefined}
        aria-label={label}
      >
        <Group gap="xs" wrap="nowrap">
          <Icon size={20} stroke={1.5} />
          <Text size="sm" fw={500} hiddenFrom="sm">
            {label}
          </Text>
        </Group>
      </UnstyledButton>
    </Tooltip>
  );
}

export function AdminNavbar({ onLinkClick }: { onLinkClick?: () => void }) {
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

  const { i18n } = useTranslation();
  const { t } = useTranslation();
  const currentLanguage =
    LANGUAGES.find((lang) => lang.lng === i18n.language)?.path ||
    "united-kingdom";

  const navButtonData = [
    {
      icon: IconHome2,
      label: t("home:title"),
      path: PATHS.ADMIN.HOME,
    },
    {
      icon: IconUsers,
      label: t("admin:users.title"),
      path: PATHS.ADMIN.USERS.ALL,
    },
    {
      icon: IconClipboardCheck,
      label: t("admin:validations.title"),
      path: PATHS.ADMIN.VALIDATIONS.ALL,
    },
    {
      icon: IconBox,
      label: t("admin:containers.title"),
      path: PATHS.ADMIN.CONTAINERS,
    },
    {
      icon: IconCalendarEventFilled,
      label: t("admin:events.title"),
      path: PATHS.ADMIN.EVENTS.ALL,
    },
    {
      icon: IconArticle,
      label: t("admin:posts.title"),
      path: PATHS.ADMIN.POSTS,
    },
    {
      icon: IconBuildingStore,
      label: t("admin:listings.title"),
      path: PATHS.ADMIN.LISTINGS,
    },
    {
      icon: IconDiamond,
      label: t("admin:subscriptions.title"),
      path: PATHS.ADMIN.SUBSCRIPTIONS.ALL,
    },
    {
      icon: IconPigMoney,
      label: t("admin:finance.title"),
      path: PATHS.ADMIN.FINANCE.ALL,
    },
  ];
  const links = navButtonData.map((link) => (
    <NavbarLink {...link} key={link.label} onClick={onLinkClick} />
  ));
  return (
    <nav className={classes.navbar}>
      <Center
        style={{ cursor: "pointer" }}
        onClick={() => {
          navigate(PATHS.HOME);
          if (onLinkClick) onLinkClick();
        }}
      >
        <Tooltip
          label={t("admin:navigation.to_front")}
          position="right"
          transitionProps={{ duration: 0 }}
        >
          <Image src="/common/logo.png" h={40} w="auto" />
        </Tooltip>
      </Center>

      <div className={classes.navbarMain}>
        <Stack justify="center" gap="sm">
          {links}
        </Stack>
      </div>

      <Stack align="center" gap="sm" py="md">
        {!errorAccountDetails && (
          <Menu shadow="md" width={200} position="bottom-start" zIndex={300}>
            <Menu.Target>
              <UnstyledButton
                style={{ backgroundColor: "transparent" }}
                className={classes.userButton}
                aria-label="User menu"
              >
                <Group gap="xs" wrap="nowrap">
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
                  <Text
                    size="sm"
                    fw={500}
                    hiddenFrom="sm"
                    truncate
                    c="var(--mantine-color-body)"
                  >
                    {accountDetails?.username}
                  </Text>
                </Group>
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconUser size={14} />}
                onClick={() => {
                  navigate(PATHS.USER.PROFILE);
                  if (onLinkClick) onLinkClick();
                }}
              >
                {t("common:profile")}
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
                {scheme === "dark"
                  ? t("common:light_mode")
                  : t("common:dark_mode")}
              </Menu.Item>

              <Menu trigger="click" position="right-start" offset={5} withArrow>
                <Menu.Target>
                  <Menu.Item
                    closeMenuOnClick={false}
                    leftSection={
                      <Image
                        src={`/flags/${currentLanguage}.png`}
                        w="14px"
                        fit="contain"
                      />
                    }
                    rightSection={<IconChevronRight size={14} />}
                  >
                    {
                      LANGUAGES.find(
                        (language) => language.path === currentLanguage,
                      )?.label
                    }
                  </Menu.Item>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>Select Language</Menu.Label>
                  {LANGUAGES.map((language) => (
                    <Menu.Item
                      disabled={language.path === currentLanguage}
                      key={language.path}
                      onClick={() => {
                        i18n.changeLanguage(language.lng);
                        localStorage.setItem("i18nextLng", language.lng);
                      }}
                      leftSection={
                        <Image
                          src={`/flags/${language.path}.png`}
                          w="14px"
                          fit="contain"
                        />
                      }
                    >
                      {language.label}
                    </Menu.Item>
                  ))}
                </Menu.Dropdown>
              </Menu>

              <Menu.Divider />
              <Menu.Item
                leftSection={<IconLogout size={14} />}
                onClick={() => {
                  handleLogout();
                  if (onLinkClick) onLinkClick();
                }}
              >
                {t("auth:logout")}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
      </Stack>
    </nav>
  );
}
