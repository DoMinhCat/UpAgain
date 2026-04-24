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
import { LANGUAGES } from "../../i18n/languages";
import { Indicator } from "@mantine/core";
import { useState } from "react";
import { useAccountDetails } from "../../hooks/accountHooks";
import { useMantineColorScheme, useComputedColorScheme } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

export function UserNavBar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [currentLanguage, setCurrentLanguage] = useState("united-kingdom");
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
    <Group justify="space-between" h="100%" px="xl" className={classes.header}>
      {/* 1. Brand Section */}
      <UnstyledButton onClick={() => navigate(PATHS.HOME)}>
        <Group gap="xs">
          <Image src="/common/logo.png" h={28} w="auto" />
          <Image src="/common/brand-name.png" h={32} w="auto" />
        </Group>
      </UnstyledButton>

      {/* 2. Navigation Section */}
      <Group h="100%" gap="sm" visibleFrom="sm">
        <HeaderLink label="Marketplace" path="/marketplace" />
        <HeaderLink label="Community" path={PATHS.USER.POSTS.ALL} />
        <HeaderLink label="Events" path="/events" />
      </Group>

      {/* 3. Actions Section */}
      <Group gap="md">
        {user?.role === "user" && (
          <>
            {" "}
            <Tooltip label="Upcycling Score">
              <Badge
                onClick={() => navigate(PATHS.USER.SCORE)}
                size="lg"
                radius="xl"
                color="var(--upagain-neutral-green)"
                leftSection={<IconLeaf size={16} />}
                style={{ padding: "0 10px", cursor: "pointer" }}
              >
                {accountDetails?.score ?? 0} pts
              </Badge>
            </Tooltip>
            <Menu shadow="md" width={300} position="bottom-end">
              <Menu.Target>
                <ActionIcon variant="subtle" color="gray" size="lg" radius="md">
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
                {/* TODO: map notifications */}
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
              <Menu.Item leftSection={<IconUser size={14} />}>
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

              <Menu trigger="click" position="left-start" offset={5} withArrow>
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
                      key={language.path}
                      onClick={() => setCurrentLanguage(language.path)}
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
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}

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
        title="Navigation"
        hiddenFrom="sm"
        zIndex={1000000}
      >
        <Stack gap="md">
          <HeaderLink
            label="Marketplace"
            path="/marketplace"
            onClick={closeDrawer}
          />
          <HeaderLink
            label="Community"
            path={PATHS.USER.POSTS.ALL}
            onClick={closeDrawer}
          />
          <HeaderLink label="Events" path="/events" onClick={closeDrawer} />
        </Stack>
      </Drawer>
    </Group>
  );
}
