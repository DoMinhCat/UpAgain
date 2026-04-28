import { Button, Group, Modal, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";

interface ConfirmAccountUpdateModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export default function ConfirmAccountUpdateModal({
  opened,
  onClose,
  onConfirm,
  loading,
}: ConfirmAccountUpdateModalProps) {
  const { t } = useTranslation("common");

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t("modals.confirm_update_title", { defaultValue: "Confirm Update" })}
      centered
    >
      <Text size="sm">
        {t("modals.confirm_update_text", {
          defaultValue: "Are you sure you want to update your account information?",
        })}
      </Text>

      <Group justify="flex-end" mt="xl">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          {t("actions.cancel", { defaultValue: "Cancel" })}
        </Button>
        <Button
          variant="primary"
          onClick={onConfirm}
          loading={loading}
        >
          {t("actions.confirm", { defaultValue: "Confirm" })}
        </Button>
      </Group>
    </Modal>
  );
}
