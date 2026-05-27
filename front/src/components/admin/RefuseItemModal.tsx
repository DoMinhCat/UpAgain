import { Modal, Textarea, Group, Button } from "@mantine/core";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface RefuseItemModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  loading: boolean;
  title?: string;
  placeholder?: string;
}

export function RefuseItemModal({
  opened,
  onClose,
  onConfirm,
  loading,
  title,
  placeholder,
}: RefuseItemModalProps) {
  const { t } = useTranslation(["admin", "common"]);
  const [refuseReason, setRefuseReason] = useState("");

  const handleConfirm = () => {
    if (refuseReason.trim().length > 0) {
      onConfirm(refuseReason);
    }
  };

  const handleClose = () => {
    setRefuseReason("");
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={title || t("admin:validations.details.refuse_modal.title")}
      centered
    >
      <Textarea
        placeholder={
          placeholder || t("admin:validations.details.refuse_modal.placeholder")
        }
        value={refuseReason}
        onChange={(event) => setRefuseReason(event.currentTarget.value)}
        minRows={3}
        data-autofocus
      />
      <Group justify="flex-end" mt="md">
        <Button variant="grey" onClick={handleClose} disabled={loading}>
          {t("common:actions.cancel", { defaultValue: "Cancel" })}
        </Button>
        <Button
          variant="delete"
          onClick={handleConfirm}
          disabled={refuseReason.trim().length === 0}
          loading={loading}
        >
          {t("admin:validations.details.refuse_modal.confirm")}
        </Button>
      </Group>
    </Modal>
  );
}
