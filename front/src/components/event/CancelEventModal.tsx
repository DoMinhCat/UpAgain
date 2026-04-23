import { Modal, Text, Group, Button, Stack } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";

interface CancelEventModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
}

export function CancelEventModal({
  opened,
  onClose,
  onConfirm,
  loading = false,
  title = "Cancel Event",
  message = "Are you sure you want to cancel this event? This action will notify all registered participants.",
  confirmLabel = "Confirm Cancellation",
}: CancelEventModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title={title} centered>
      <Stack gap="md">
        <Group wrap="nowrap" align="flex-start">
          <IconAlertCircle
            size={24}
            color="var(--mantine-color-red-6)"
            style={{ marginTop: 2, flexShrink: 0 }}
          />
          <Text size="sm">{message}</Text>
        </Group>

        <Group mt="lg" justify="flex-end">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            No, go back
          </Button>
          <Button variant="delete" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
