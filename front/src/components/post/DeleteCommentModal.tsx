import { Modal, Stack, Text, Group, Button } from "@mantine/core";
import { useTranslation } from "react-i18next";

interface DeleteCommentModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export function DeleteCommentModal({
  opened,
  onClose,
  onConfirm,
  loading,
}: DeleteCommentModalProps) {
  const { t } = useTranslation(["post", "common"]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t("post:delete_comment_modal_title")}
      centered
    >
      <Stack>
        <Text size="sm">{t("post:delete_comment_modal_text")}</Text>
        <Group justify="flex-end" mt="md">
          <Button variant="grey" onClick={onClose}>
            {t("common:actions.cancel")}
          </Button>
          <Button variant="delete" onClick={onConfirm} loading={loading}>
            {t("common:actions.confirm")}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
