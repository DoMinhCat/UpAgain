import { Modal, Stack, Text, Group, Button, ThemeIcon } from "@mantine/core";
import { IconAlertCircle, IconPointFilled } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

interface ConfirmAdsCancelModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  warningMessage?: string;
}

export function ConfirmAdsCancelModal({
  opened,
  onClose,
  onConfirm,
  loading,
  warningMessage,
}: ConfirmAdsCancelModalProps) {
  const { t } = useTranslation(["admin", "common"]);

  return (
    <Modal
      title={t("admin:posts.ads_modal.remove_title", {
        defaultValue: "Remove Sponsor Status",
      })}
      opened={opened}
      onClose={onClose}
      centered
      size="md"
      radius="md"
      overlayProps={{
        opacity: 0.55,
        blur: 3,
      }}
    >
      <Stack gap="sm">
        <Text size="sm">
          {t("admin:posts.ads_modal.remove_text", {
            defaultValue:
              "Are you sure you want to remove the sponsor status from this post?",
          })}
        </Text>
        {warningMessage && (
          <Group gap="xs" mt="sm" align="center" wrap="nowrap">
            <ThemeIcon color="red.6" radius="md" size="sm">
              <IconAlertCircle size={14} />{" "}
            </ThemeIcon>
            <Text size="sm" c="red.6" fw={600}>
              {warningMessage}
            </Text>
          </Group>
        )}
      </Stack>
      <Group mt="lg" justify="flex-end" gap="sm">
        <Button onClick={onClose} variant="grey" radius="md">
          {t("admin:posts.ads_modal.cancel", { defaultValue: "Cancel" })}
        </Button>
        <Button
          onClick={onConfirm}
          loading={loading}
          variant="delete"
          radius="md"
        >
          {t("admin:posts.ads_modal.remove_confirm", {
            defaultValue: "Remove",
          })}
        </Button>
      </Group>
    </Modal>
  );
}
