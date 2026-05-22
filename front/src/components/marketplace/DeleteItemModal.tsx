import { Button, Group, Modal, Stack, Text } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

interface DeleteItemModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: (e?: any) => void;
  loading?: boolean;
  title?: string;
  text?: string;
}

export const DeleteItemModal = ({
  opened,
  onClose,
  onConfirm,
  loading,
  title,
  text,
}: DeleteItemModalProps) => {
  const { t } = useTranslation(["marketplace", "common", "admin"]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        title ||
        t("marketplace:detail.delete_confirm_title", {
          defaultValue: "Delete item",
        })
      }
      centered
    >
      <Stack gap="md">
        <Text size="sm">
          {text ||
            t("marketplace:detail.delete_confirm_text", {
              defaultValue:
                "Are you sure you want to delete this item? This action is irreversible.",
            })}
        </Text>
        <Group justify="flex-end" gap="sm">
          <Button variant="secondary" onClick={onClose}>
            {t("common:actions.cancel")}
          </Button>
          <Button
            variant="delete"
            loading={loading}
            onClick={onConfirm}
            leftSection={<IconTrash size={18} />}
          >
            {t("common:actions.delete", { defaultValue: "Delete" })}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
