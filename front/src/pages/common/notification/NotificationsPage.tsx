import {
  Container,
  Title,
  Paper,
  Text,
  Group,
  ActionIcon,
  Stack,
  Button,
  Box,
  Skeleton,
} from "@mantine/core";
import { IconBell, IconX, IconCheck } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../context/AuthContext";
import { useComputedColorScheme } from "@mantine/core";
import {
  useGetNotifications,
  useMarkNotificationsAsRead,
  useDeleteNotification,
} from "../../../hooks/notificationHooks";
import { getTimeAgo } from "../../../utils/timeUtils";
import { PATHS } from "../../../routes/paths";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const scheme = useComputedColorScheme("light");

  const { data: notificationsData = [], isLoading } = useGetNotifications(
    !!user?.id,
  );
  const notifications = notificationsData || [];
  const markAsReadMutation = useMarkNotificationsAsRead();
  const deleteNotiMutation = useDeleteNotification();

  const unreadNotifications = notifications.filter((n) => !n.read_at);
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

  if (isLoading) {
    return (
      <Container size="md" py="xl">
        <Title order={2} mb="lg">
          {t("common:notifications.title")}
        </Title>
        <Stack gap="md">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} h={80} radius="md" />
          ))}
        </Stack>
      </Container>
    );
  }

  const borderCol =
    scheme === "dark"
      ? "var(--mantine-color-dark-4)"
      : "var(--mantine-color-gray-2)";

  return (
    <Container size="md" py="xl">
      <Group justify="space-between" mb="lg">
        <Title order={2}>{t("common:notifications.title")}</Title>
        {hasUnread && (
          <Button
            variant="light"
            color="var(--upagain-neutral-green)"
            leftSection={<IconCheck size={16} />}
            onClick={handleMarkAllAsRead}
          >
            {t("common:notifications.mark_all_read")}
          </Button>
        )}
      </Group>

      {notifications.length === 0 ? (
        <Paper
          p="xl"
          radius="md"
          withBorder
          style={{
            textAlign: "center",
            borderColor: borderCol,
            backgroundColor:
              scheme === "dark"
                ? "var(--mantine-color-dark-7)"
                : "var(--mantine-color-white)",
          }}
        >
          <IconBell
            size={48}
            stroke={1.5}
            color="var(--mantine-color-gray-4)"
            style={{ marginBottom: "12px" }}
          />
          <Text size="lg" fw={500} mb="xs">
            {t("common:notifications.no_new")}
          </Text>
          <Text size="sm" color="dimmed">
            You will receive updates here when items are updated, approved, or
            reserved.
          </Text>
        </Paper>
      ) : (
        <Stack gap="md">
          {notifications.map((noti) => {
            const isUnread = !noti.read_at;
            return (
              <Paper
                key={noti.uuid}
                p="md"
                radius="md"
                withBorder
                style={{
                  borderColor: borderCol,
                  cursor: "pointer",
                  backgroundColor: isUnread
                    ? "var(--mantine-color-green-light)"
                    : scheme === "dark"
                      ? "var(--mantine-color-dark-7)"
                      : "var(--mantine-color-white)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "var(--mantine-shadow-sm)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "none";
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
                }}
              >
                <Group justify="space-between" align="center" wrap="nowrap">
                  <Box style={{ flex: 1 }}>
                    <Text
                      size="sm"
                      fw={isUnread ? 600 : 400}
                      style={{
                        color: "var(--mantine-color-text)",
                        wordBreak: "break-word",
                      }}
                    >
                      {t(`common:notifications.types.${noti.type}`, {
                        title: noti.entity_title,
                      })}
                    </Text>
                    <Text size="xs" color="dimmed" mt="xs">
                      {getTimeAgo(noti.created_at, t)}
                    </Text>
                  </Box>

                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNoti(noti.uuid);
                    }}
                  >
                    <IconX size={16} />
                  </ActionIcon>
                </Group>
              </Paper>
            );
          })}
        </Stack>
      )}
    </Container>
  );
}
