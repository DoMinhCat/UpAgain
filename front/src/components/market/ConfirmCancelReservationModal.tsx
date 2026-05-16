import { Button, Group, Modal, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useCancelItemReservation } from "../../hooks/itemHooks";

export function ConfirmCancelReservationModal({
  opened,
  onClose,
  idItem,
}: {
  opened: boolean;
  onClose: () => void;
  idItem: number;
}) {
  const { t } = useTranslation(["marketplace", "common"]);
  const cancelReservationMutation = useCancelItemReservation(idItem);

  const handleConfirm = () => {
    cancelReservationMutation.mutate(undefined, {
      onSuccess: () => {
        onClose();
      },
      onError: () => {
        onClose();
      },
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t("marketplace:detail.cancel_reserve_confirm_title", {
        defaultValue: "Confirm Cancel Reservation",
      })}
      overlayProps={{
        opacity: 0.55,
        blur: 3,
      }}
      zIndex={1000}
    >
      <Text size="md">
        {t("marketplace:detail.cancel_reserve_confirm_text", {
          defaultValue: "Are you sure you want to cancel this reservation?",
        })}
      </Text>
      <Group justify="flex-end" mt="md">
        <Button variant="secondary" onClick={onClose}>
          {t("common:actions.cancel")}
        </Button>
        <Button
          variant="delete"
          onClick={handleConfirm}
          loading={cancelReservationMutation.isPending}
        >
          {t("marketplace:detail.cancel_reservation_button", {
            defaultValue: "Confirm Cancel Reservation",
          })}
        </Button>
      </Group>
    </Modal>
  );
}
