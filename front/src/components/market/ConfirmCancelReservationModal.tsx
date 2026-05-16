import { Button, Group, Modal, Text } from "@mantine/core";
import { IconCalendarStats } from "@tabler/icons-react";

export function ConfirmCancelReservationModal({
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Confirm Cancel Reservation"
      overlayProps={{
        opacity: 0.55,
        blur: 3,
      }}
      zIndex={1000}
    >
      <Text size="md">Are you sure you want to cancel this reservation?</Text>
      <Group justify="flex-end" mt="md">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          color="red"
          onClick={() => {
            // handleCancelReservation();
            // closeCancelReservation();
          }}
          // loading={cancelReservationMutation.isPending}
        >
          Confirm Cancel Reservation
        </Button>
      </Group>
    </Modal>
  );
}
