import {
  Modal,
  Stack,
  Group,
  Title,
  Text,
  Paper,
  Button,
  Divider,
} from "@mantine/core";
import {
  IconCalendarEvent,
  IconMapPin,
  IconClock,
  IconCoinEuro,
  IconAlertCircle,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import type { AppEvent } from "../../api/interfaces/event";

interface EventRegistrationModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  event: AppEvent | null;
}

export function EventRegistrationModal({
  opened,
  onClose,
  onConfirm,
  loading,
  event,
}: EventRegistrationModalProps) {
  const { t } = useTranslation("events");

  if (!event) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="lg"
      title={
        <Group gap="xs">
          <IconCalendarEvent size={24} color="var(--upagain-neutral-green)" />
          <Title order={4}>{t("detail.register_now")}</Title>
        </Group>
      }
      centered
      radius="lg"
      padding="xl"
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {t("detail.confirm_registration_msg")}
        </Text>

        <Paper
          withBorder
          p="md"
          radius="md"
          bg="var(--upagain-neutral-green-soft)"
          style={{ borderColor: "var(--upagain-neutral-green)" }}
        >
          <Stack gap="sm">
            <Text fw={700} size="lg">
              {event.title}
            </Text>

            <Divider variant="dashed" />

            <Group gap="xs">
              <IconMapPin size={18} color="var(--upagain-neutral-green)" />
              <Stack gap={0}>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  {t("detail.location")}
                </Text>
                <Text size="sm" fw={500}>
                  {event.street}, {event.city}
                </Text>
              </Stack>
            </Group>

            <Group gap="xl">
              <Group gap="xs">
                <IconClock size={18} color="var(--upagain-neutral-green)" />
                <Stack gap={0}>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    {t("detail.start_date")}
                  </Text>
                  <Text size="sm" fw={500}>
                    {dayjs(event.start_at).format("DD/MM/YYYY HH:mm")}
                  </Text>
                </Stack>
              </Group>

              <Group gap="xs">
                <IconCoinEuro size={18} color="var(--upagain-neutral-green)" />
                <Stack gap={0}>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    {t("detail.price")}
                  </Text>
                  <Text size="sm" fw={500}>
                    {event.price && event.price > 0
                      ? `${event.price} €`
                      : t("detail.free_entry")}
                  </Text>
                </Stack>
              </Group>
            </Group>
          </Stack>
        </Paper>

        <Group
          gap="xs"
          p="sm"
          bg="var(--mantine-color-red-0)"
          style={{
            borderRadius: "8px",
            border: "1px solid var(--mantine-color-red-1)",
          }}
        >
          <IconAlertCircle size={18} color="var(--mantine-color-red-6)" />
          <Text size="xs" c="red.7" fw={600}>
            {t("detail.refund_warning")}
          </Text>
        </Group>

        <Group grow mt="lg">
          <Button
            variant="secondary"
            color="gray"
            onClick={onClose}
            radius="md"
          >
            {t("common:actions.cancel")}
          </Button>
          <Button
            variant="cta-reverse"
            color="var(--upagain-neutral-green)"
            onClick={onConfirm}
            loading={loading}
            radius="md"
          >
            {t("common:confirm")}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
