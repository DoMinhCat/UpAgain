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
  ScrollArea,
  Text,
  Divider,
  Box,
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
  IconX,
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
import { resolveUrl } from "../../utils/imageUtils";
import {
  useGetNotifications,
  useMarkNotificationsAsRead,
  useDeleteNotification,
} from "../../hooks/notificationHooks";
import { getTimeAgo } from "../../utils/timeUtils";
import { useState } from "react";

interface NotificationMenuContentProps {
  setOpenedMenu: (value: boolean) => void;
  notificationsData: any[];
  unreadNotifications: any[];
  hasUnread: boolean;
  handleMarkAsRead: (ids: string[]) => void;
  handleMarkAllAsRead: () => void;
  handleDeleteNoti: (uuid: string) => void;
  navigate: any;
  t: any;
  scheme: "light" | "dark";
}

function NotificationMenuContent({
  setOpenedMenu,
  notificationsData,
  hasUnread,
  handleMarkAsRead,
  handleMarkAllAsRead,
  handleDeleteNoti,
  navigate,
  t,
  scheme,
}: NotificationMenuContentProps) {
  const notifications = notificationsData || [];
  return (
    <Menu.Dropdown style={{ padding: 0 }}>
      <Menu.Label style={{ padding: "8px 12px", fontWeight: 600 }}>
        {t("common:notifications.title")}
      </Menu.Label>
      <Divider />

      {notifications && notifications.length === 0 ? (
        <Box style={{ padding: "16px 12px", textAlign: "center" }}>
          <Text size="sm" color="dimmed">
            {t("common:notifications.no_new")}
          </Text>
        </Box>
      ) : (
        <>
          <ScrollArea.Autosize mah={300}>
            {notifications.map((noti) => {
              const isUnread = !noti.read_at;
              const borderCol =
                scheme === "dark"
                  ? "var(--mantine-color-dark-4)"
                  : "var(--mantine-color-gray-2)";
              return (
                <Box
                  key={noti.uuid}
                  style={{
                    padding: "10px 12px",
                    borderBottom: `1px solid ${borderCol}`,
                    cursor: "pointer",
                    backgroundColor: isUnread
                      ? "var(--mantine-color-green-light)"
                      : "transparent",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    transition: "background-color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isUnread
                      ? "var(--mantine-color-green-light-hover)"
                      : scheme === "dark"
                        ? "var(--mantine-color-dark-6)"
                        : "var(--mantine-color-gray-0)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isUnread
                      ? "var(--mantine-color-green-light)"
                      : "transparent";
                  }}
                  onClick={() => {
                    if (isUnread) {
                      handleMarkAsRead([noti.uuid]);
                    }
                    if (noti.entity_type === "item") {
                      navigate(PATHS.MARKETPLACE.HOME + "/" + noti.entity_id);
                    } else if (noti.entity_type === "event") {
                      navigate(PATHS.EVENTS.HOME + "/" + noti.entity_id);
                    } else if (noti.entity_type === "profile") {
                      navigate(PATHS.USER.PROFILE);
                    }
                    setOpenedMenu(false);
                  }}
                >
                  <Box style={{ flex: 1 }}>
                    <Text
                      size="sm"
                      lineClamp={2}
                      style={{
                        whiteSpace: "normal",
                        color: "var(--mantine-color-text)",
                      }}
                    >
                      {t(`common:notifications.types.${noti.type}`, {
                        title: noti.entity_title,
                      })}
                    </Text>
                    <Text size="xs" color="dimmed" style={{ marginTop: "2px" }}>
                      {getTimeAgo(noti.created_at, t)}
                    </Text>
                  </Box>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNoti(noti.uuid);
                    }}
                  >
                    <IconX size={14} />
                  </ActionIcon>
                </Box>
              );
            })}
          </ScrollArea.Autosize>

          <Divider />
          <Group justify="space-between" p="xs" gap="xs">
            {hasUnread ? (
              <UnstyledButton
                onClick={handleMarkAllAsRead}
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "var(--upagain-neutral-green)",
                  cursor: "pointer",
                  padding: "4px 8px",
                  borderRadius: "var(--mantine-radius-sm)",
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    scheme === "dark"
                      ? "var(--mantine-color-dark-6)"
                      : "var(--mantine-color-gray-0)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                {t("common:notifications.mark_all_read")}
              </UnstyledButton>
            ) : (
              <Box />
            )}
            <UnstyledButton
              onClick={() => {
                navigate(PATHS.NOTIFICATIONS);
                setOpenedMenu(false);
              }}
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--upagain-neutral-green)",
                cursor: "pointer",
                padding: "4px 8px",
                borderRadius: "var(--mantine-radius-sm)",
                transition: "background-color 0.2s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  scheme === "dark"
                    ? "var(--mantine-color-dark-6)"
                    : "var(--mantine-color-gray-0)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              {t("common:notifications.see_all")}
            </UnstyledButton>
          </Group>
        </>
      )}
    </Menu.Dropdown>
  );
}

export function UserNavBar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const [openedMenu, setOpenedMenu] = useState(false);
  const currentLanguage =
    LANGUAGES.find((lang) => lang.lng === i18n.language)?.path ||
    "united-kingdom";
  const { data: accountDetails, error: errorAccountDetails } =
    useAccountDetails(user?.id || 0, true);

  const { data: notifications = [] } = useGetNotifications(!!user?.id);
  const markAsReadMutation = useMarkNotificationsAsRead();
  const deleteNotiMutation = useDeleteNotification();

  const unreadNotifications = notifications
    ? notifications.filter((n) => !n.read_at)
    : [];
  const hasUnread = unreadNotifications.length > 0;

  const handleMarkAsRead = (ids: string[]) => {
    markAsReadMutation.mutate({ ids });
  };

  const handleMarkAllAsRead = () => {
    const unreadIds = unreadNotifications.map((n) => n.uuid);
    if (unreadIds.length > 0) {
      handleMarkAsRead(unreadIds);
    }
  };

  const handleDeleteNoti = (uuid: string) => {
    deleteNotiMutation.mutate(uuid);
  };

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
          {user?.role !== "employee" && (
            <HeaderLink
              label={t("marketplace:market")}
              path={PATHS.MARKETPLACE.HOME}
            />
          )}
          <HeaderLink
            label={t("community:community")}
            path={PATHS.GUEST.POSTS}
          />
          <HeaderLink label={t("events:events")} path={PATHS.EVENTS.HOME} />
          {user?.role === "pro" && (
            <HeaderLink
              label={t("common:pricing")}
              path={PATHS.GUEST.PRICING}
            />
          )}
        </Group>

        {/* User Actions - Desktop */}
        <Group gap="md" visibleFrom="sm">
          {user?.role === "user" && (
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
          )}

          {user && (
            <Menu
              shadow="md"
              width={300}
              position="bottom-end"
              opened={openedMenu}
              onChange={setOpenedMenu}
            >
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
                  onClick={() => setOpenedMenu(true)}
                >
                  {hasUnread ? (
                    <Indicator color="red" size={8} offset={2} processing>
                      <IconBellFilled
                        size={24}
                        stroke={1.5}
                        color="var(--upagain-yellow)"
                      />
                    </Indicator>
                  ) : (
                    <IconBellFilled
                      size={24}
                      stroke={1.5}
                      color="var(--upagain-yellow)"
                    />
                  )}
                </ActionIcon>
              </Menu.Target>
              <NotificationMenuContent
                setOpenedMenu={setOpenedMenu}
                notificationsData={notifications}
                unreadNotifications={unreadNotifications}
                hasUnread={hasUnread}
                handleMarkAsRead={handleMarkAsRead}
                handleMarkAllAsRead={handleMarkAllAsRead}
                handleDeleteNoti={handleDeleteNoti}
                navigate={navigate}
                t={t}
                scheme={scheme}
              />
            </Menu>
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
                      src={resolveUrl(accountDetails?.avatar)}
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
            {user?.role !== "employee" && (
              <HeaderLink
                label={t("marketplace:market")}
                path={PATHS.MARKETPLACE.HOME}
                onClick={closeDrawer}
              />
            )}
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
            {user && (
              <Group justify="space-between">
                {user.role === "user" ? (
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
                ) : (
                  <div />
                )}

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
                      {hasUnread ? (
                        <Indicator color="red" size={8} offset={2} processing>
                          <IconBellFilled
                            size={24}
                            stroke={1.5}
                            color="var(--upagain-yellow)"
                          />
                        </Indicator>
                      ) : (
                        <IconBellFilled
                          size={24}
                          stroke={1.5}
                          color="var(--upagain-yellow)"
                        />
                      )}
                    </ActionIcon>
                  </Menu.Target>
                  <NotificationMenuContent
                    setOpenedMenu={setOpenedMenu}
                    notificationsData={notifications}
                    unreadNotifications={unreadNotifications}
                    hasUnread={hasUnread}
                    handleMarkAsRead={handleMarkAsRead}
                    handleMarkAllAsRead={handleMarkAllAsRead}
                    handleDeleteNoti={handleDeleteNoti}
                    navigate={navigate}
                    t={t}
                    scheme={scheme}
                  />
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
