import { Button, Group, Modal, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconCalendarStats } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useReserveItem } from "../../hooks/itemHooks";

interface ConfirmReservationModalProps {
  opened: boolean;
  onClose: () => void;
  idItem: number;
  itemTitle?: string;
  title?: string;
}

export const ConfirmReservationModal = ({
  opened,
  onClose,
  idItem,
  itemTitle,
  title,
}: ConfirmReservationModalProps) => {
  const { t } = useTranslation(["marketplace", "common"]);
  const reserveMutation = useReserveItem();

  const handleConfirm = () => {
    reserveMutation.mutate(idItem, {
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
      title={
        title ||
        t("marketplace:detail.reserve_confirm_title", {
          defaultValue: "Confirm Reservation",
        })
      }
      centered
      radius="lg"
      size="md"
    >
      <Stack gap="md">
        <Group align="center" gap="sm">
          <ThemeIcon
            variant="light"
            color="var(--upagain-neutral-green)"
            size="xl"
            radius="md"
          >
            <IconCalendarStats size={24} />
          </ThemeIcon>
          <Stack gap={0}>
            <Text fw={700} size="lg">
              {itemTitle}
            </Text>
            <Text size="sm" c="dimmed">
              {t("marketplace:detail.reserve_period", {
                defaultValue: "3 days reservation",
              })}
            </Text>
          </Stack>
        </Group>

        <Text size="sm">
          {t("marketplace:detail.reserve_confirm_text", {
            defaultValue:
              "Are you sure you want to reserve this item? You will have 3 days to complete the purchase.",
          })}
        </Text>

        <Group justify="flex-end" gap="sm" mt="lg">
          <Button variant="secondary" onClick={onClose} radius="md">
            {t("common:actions.cancel")}
          </Button>
          <Button
            variant="cta-reverse"
            loading={reserveMutation.isPending}
            onClick={handleConfirm}
            radius="md"
            color="var(--upagain-neutral-green)"
          >
            {t("marketplace:detail.reserve_now", {
              defaultValue: "Reserve Now",
            })}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
