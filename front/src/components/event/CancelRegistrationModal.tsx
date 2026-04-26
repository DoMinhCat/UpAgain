import { Modal, Stack, Group, Title, Text, Button, Divider } from "@mantine/core";
import { IconCalendarOff, IconAlertCircle } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

interface CancelRegistrationModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export function CancelRegistrationModal({
  opened,
  onClose,
  onConfirm,
  loading,
}: CancelRegistrationModalProps) {
  const { t } = useTranslation("events");

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <IconCalendarOff size={24} color="var(--mantine-color-red-6)" />
          <Title order={4}>{t("detail.cancel_registration_title")}</Title>
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
        <Text size="sm">
          {t("detail.cancel_registration_msg")}
        </Text>

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

        <Divider variant="dashed" />

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
            variant="delete"
            color="red"
            onClick={onConfirm}
            loading={loading}
            radius="md"
          >
            {t("common:actions.confirm")}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
