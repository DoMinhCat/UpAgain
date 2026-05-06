import { Modal, Group, Button, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useDeletePost } from "../../hooks/postHooks";

interface DeletePostModalProps {
  opened: boolean;
  onClose: () => void;
  postId: number | null;
  onSuccess?: () => void;
}

export function DeletePostModal({
  opened,
  onClose,
  postId,
  onSuccess,
}: DeletePostModalProps) {
  const { t } = useTranslation(["admin", "post"]);
  const deletePostMutation = useDeletePost();

  const handleDeletePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (postId) {
      deletePostMutation.mutate(postId, {
        onSuccess: () => {
          onClose();
          if (onSuccess) {
            onSuccess();
          }
        },
      });
    }
  };

  return (
    <Modal
      title={t("admin:posts.delete_modal.title")}
      opened={opened}
      onClose={onClose}
    >
      <Text>{t("admin:posts.delete_modal.text")}</Text>
      <Group mt="lg" justify="flex-end">
        <Button onClick={onClose} variant="grey">
          {t("admin:posts.delete_modal.cancel")}
        </Button>
        <Button
          onClick={handleDeletePost}
          variant="delete"
          loading={deletePostMutation.isPending}
        >
          {t("admin:posts.delete_modal.confirm")}
        </Button>
      </Group>
    </Modal>
  );
}
