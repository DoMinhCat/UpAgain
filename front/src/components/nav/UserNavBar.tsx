import {
  Avatar,
  Group,
  Image,
  UnstyledButton,
  Menu,
  ActionIcon,
  Burger,
  Drawer,
  Stack,
  Badge,
  Tooltip,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import classes from "../../styles/Guest.module.css";
import { PATHS } from "../../routes/paths";
import {
  IconSun,
  IconMoon,
  IconUser,
  IconLogout,
  IconBellFilled,
  IconChevronRight,
  IconLeaf,
  IconDeviceDesktopCode,
} from "@tabler/icons-react";
import { useAuth } from "../../context/AuthContext";
import { HeaderLink } from "./NavBarComponents";
import { LANGUAGES } from "../../i18n/index";
import { Indicator } from "@mantine/core";
import { useAccountDetails } from "../../hooks/accountHooks";
import { useMantineColorScheme, useComputedColorScheme } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "react-i18next";
import { changeLanguage } from "../../utils/langUtils";

export function UserNavBar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const currentLanguage =
    LANGUAGES.find((lang) => lang.lng === i18n.language)?.path ||
    "united-kingdom";
  const { data: accountDetails, error: errorAccountDetails } =
    useAccountDetails(user?.id || 0, true);

  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);
  const scheme = useComputedColorScheme("light");
  const { setColorScheme } = useMantineColorScheme();
  const toggle = () => {
    setColorScheme(scheme === "dark" ? "light" : "dark");
  };

  const handleLogout = () => {
    logout();
    navigate(PATHS.HOME, { replace: true });
  };

  return (
    <>
      <Group
        justify="space-between"
        h="100%"
        px="xl"
        className={classes.header}
      >
        {/* 1. Brand Section */}
        <UnstyledButton onClick={() => navigate(PATHS.HOME)}>
          <Group gap="xs">
            <Image src="/common/logo.png" h={28} w="auto" />
            <Image src="/common/brand-name.png" h={32} w="auto" />
          </Group>
        </UnstyledButton>

        {/* 2. Navigation Section */}
        <Group h="100%" gap="sm" visibleFrom="sm">
          <HeaderLink
            label={t("marketplace:marketplace")}
            path={PATHS.MARKETPLACE.HOME}
          />
          <HeaderLink
            label={t("community:community")}
            path={PATHS.GUEST.POSTS}
          />
          <HeaderLink label={t("events:events")} path={PATHS.EVENTS.HOME} />
        </Group>

        {/* User Actions - Desktop */}
        <Group gap="md" visibleFrom="sm">
          {user?.role === "user" && (
            <>
              <Tooltip label="Upcycling Score">
                <Badge
                  onClick={() => navigate(PATHS.USER.SCORE)}
                  size="lg"
                  radius="xl"
                  color="var(--upagain-neutral-green)"
                  leftSection={<IconLeaf size={16} />}
                  style={{ padding: "0 10px", cursor: "pointer" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "translateY(-2px)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "translateY(0)")
                  }
                >
                  {accountDetails?.score ?? 0} pts
                </Badge>
              </Tooltip>
              <Menu shadow="md" width={300} position="bottom-end">
                <Menu.Target>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="lg"
                    style={{ backgroundColor: "transparent" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.transform = "translateY(-2px)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = "translateY(0)")
                    }
                    radius="md"
                  >
                    <Indicator color="red" size={8} offset={2} processing>
                      <IconBellFilled
                        size={24}
                        stroke={1.5}
                        color="var(--upagain-yellow)"
                      />
                    </Indicator>
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>Notifications</Menu.Label>
                  <Menu.Item>No new notifications</Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </>
          )}

          {accountDetails?.role === "admin" && (
            <Tooltip label="Back office">
              <ActionIcon
                variant="subtle"
                color="gray"
                size="lg"
                radius="md"
                onClick={() => navigate(PATHS.ADMIN.HOME)}
              >
                <IconDeviceDesktopCode size={24} stroke={1.5} />
              </ActionIcon>
            </Tooltip>
          )}

          {!errorAccountDetails && (
            <Menu shadow="md" width={220} position="bottom-end" trigger="click">
              <Menu.Target>
                <UnstyledButton
                  className={classes.toggleButton}
                  style={{ padding: 2, borderRadius: "50%" }}
                >
                  {accountDetails?.avatar ? (
                    <Avatar
                      src={accountDetails?.avatar}
                      name={accountDetails?.username}
                      color="initials"
                      size={40}
                      radius="xl"
                      className={classes.avatarNavbar}
                    />
                  ) : (
                    <Avatar
                      name={accountDetails?.username}
                      color="initials"
                      size={40}
                      radius="xl"
                      className={classes.avatarNavbar}
                    />
                  )}
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>{accountDetails?.username}</Menu.Label>
                <Menu.Item
                  leftSection={<IconUser size={14} />}
                  onClick={() => navigate(PATHS.USER.PROFILE)}
                >
                  My Profile
                </Menu.Item>

                <Menu.Divider />

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
                  {scheme === "dark" ? "Light Mode" : "Dark Mode"}
                </Menu.Item>

                <Menu
                  trigger="click"
                  position="left-start"
                  offset={5}
                  withArrow
                >
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
                        onClick={() => changeLanguage(language.lng)}
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
                  color="red"
                  onClick={() => {
                    handleLogout();
                  }}
                >
                  {t("auth:logout")}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
        </Group>

        <Burger
          opened={drawerOpened}
          onClick={toggleDrawer}
          hiddenFrom="sm"
          size="sm"
        />
      </Group>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding="md"
        title="Menu"
        hiddenFrom="sm"
        zIndex={1000000}
      >
        <Stack gap="lg">
          <Stack gap="md">
            <HeaderLink
              label={t("marketplace:marketplace")}
              path={PATHS.MARKETPLACE.HOME}
              onClick={closeDrawer}
            />
            <HeaderLink
              label={t("community:community")}
              path={PATHS.GUEST.POSTS}
              onClick={closeDrawer}
            />
            <HeaderLink
              label={t("events:events")}
              path={PATHS.EVENTS.HOME}
              onClick={closeDrawer}
            />
          </Stack>

          <div
            style={{
              height: "1px",
              backgroundColor: "var(--mantine-color-gray-2)",
            }}
          />

          <Stack gap="md">
            {user?.role === "user" && (
              <Group justify="space-between">
                <Badge
                  onClick={() => {
                    navigate(PATHS.USER.SCORE);
                    closeDrawer();
                  }}
                  size="lg"
                  radius="xl"
                  color="var(--upagain-neutral-green)"
                  leftSection={<IconLeaf size={16} />}
                  style={{ padding: "0 10px", cursor: "pointer" }}
                >
                  {accountDetails?.score ?? 0} pts
                </Badge>

                <Menu
                  shadow="md"
                  width={300}
                  position="bottom-end"
                  zIndex={1000001}
                >
                  <Menu.Target>
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      size="lg"
                      radius="md"
                    >
                      <Indicator color="red" size={8} offset={2} processing>
                        <IconBellFilled
                          size={24}
                          stroke={1.5}
                          color="var(--upagain-yellow)"
                        />
                      </Indicator>
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Label>Notifications</Menu.Label>
                    <Menu.Item>No new notifications</Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
            )}

            {accountDetails?.role === "admin" && (
              <UnstyledButton
                onClick={() => {
                  navigate(PATHS.ADMIN.HOME);
                  closeDrawer();
                }}
                className={classes.link}
              >
                <Group>
                  <IconDeviceDesktopCode size={20} stroke={1.5} />
                  <span>Back office</span>
                </Group>
              </UnstyledButton>
            )}

            {!errorAccountDetails && (
              <>
                <UnstyledButton
                  onClick={() => {
                    navigate(PATHS.USER.PROFILE);
                    closeDrawer();
                  }}
                  className={classes.link}
                >
                  <Group>
                    <IconUser size={20} stroke={1.5} />
                    <span>My Profile</span>
                  </Group>
                </UnstyledButton>

                <UnstyledButton onClick={toggle} className={classes.link}>
                  <Group>
                    {scheme === "dark" ? (
                      <IconSun size={20} stroke={1.5} />
                    ) : (
                      <IconMoon size={20} stroke={1.5} />
                    )}
                    <span>
                      {scheme === "dark" ? "Light Mode" : "Dark Mode"}
                    </span>
                  </Group>
                </UnstyledButton>

                <Menu
                  trigger="click"
                  position="bottom-start"
                  offset={5}
                  zIndex={1000001}
                >
                  <Menu.Target>
                    <UnstyledButton className={classes.link}>
                      <Group justify="space-between" style={{ width: "100%" }}>
                        <Group>
                          <Image
                            src={`/flags/${currentLanguage}.png`}
                            w="20px"
                            fit="contain"
                          />
                          <span>
                            {
                              LANGUAGES.find(
                                (language) => language.path === currentLanguage,
                              )?.label
                            }
                          </span>
                        </Group>
                        <IconChevronRight size={14} />
                      </Group>
                    </UnstyledButton>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Label>Select Language</Menu.Label>
                    {LANGUAGES.map((language) => (
                      <Menu.Item
                        disabled={language.path === currentLanguage}
                        key={language.path}
                        onClick={() => {
                          changeLanguage(language.lng);
                          closeDrawer();
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

                <UnstyledButton
                  onClick={() => {
                    handleLogout();
                    closeDrawer();
                  }}
                  className={classes.link}
                  style={{ color: "var(--mantine-color-red-6)" }}
                >
                  <Group>
                    <IconLogout size={20} stroke={1.5} />
                    <span>{t("auth:logout")}</span>
                  </Group>
                </UnstyledButton>
              </>
            )}
          </Stack>
        </Stack>
      </Drawer>
    </>
  );
}
