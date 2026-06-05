import {
  Modal,
  Stack,
  Group,
  Title,
  Text,
  Paper,
  Button,
  Divider,
  Card,
  ThemeIcon,
} from "@mantine/core";
import {
  IconCalendarEvent,
  IconMapPin,
  IconClock,
  IconCoinEuro,
  IconAlertCircle,
  IconInfoCircle,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import type { AppEvent } from "../../api/interfaces/event";

interface EventRegistrationModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  event: AppEvent | null;
}

export function EventRegistrationModal({
  opened,
  onClose,
  onConfirm,
  loading,
  event,
}: EventRegistrationModalProps) {
  const { t } = useTranslation(["events", "common", "admin"]);

  if (!event) return null;

  const isPaid = event.price !== undefined && event.price > 0;
  const basePrice = event.price || 0;
  const vat = isPaid ? basePrice * 0.2 : 0;
  const processingFee = isPaid ? basePrice * 0.015 + 0.25 : 0;
  const totalPrice = basePrice + vat + processingFee;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="lg"
      title={
        <Group gap="xs">
          <IconCalendarEvent size={24} color="var(--upagain-neutral-green)" />
          <Title order={4}>{t("detail.register_now")}</Title>
        </Group>
      }
      centered
      radius="lg"
      padding="xl"
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {t("detail.confirm_registration_msg")}
        </Text>

        <Paper
          withBorder
          p="md"
          radius="md"
          bg="var(--upagain-neutral-green-soft)"
          style={{ borderColor: "var(--upagain-neutral-green)" }}
        >
          <Stack gap="sm">
            <Text fw={700} size="lg">
              {event.title}
            </Text>

            <Divider variant="dashed" />

            <Group gap="xs">
              <IconMapPin size={18} color="var(--upagain-neutral-green)" />
              <Stack gap={0}>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  {t("detail.location")}
                </Text>
                <Text size="sm" fw={500}>
                  {event.street}, {event.city}
                </Text>
              </Stack>
            </Group>

            <Group gap="xl">
              <Group gap="xs">
                <IconClock size={18} color="var(--upagain-neutral-green)" />
                <Stack gap={0}>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    {t("detail.start_date")}
                  </Text>
                  <Text size="sm" fw={500}>
                    {dayjs(event.start_at).format("DD/MM/YYYY HH:mm")}
                  </Text>
                </Stack>
              </Group>

              <Group gap="xs">
                <IconCoinEuro size={18} color="var(--upagain-neutral-green)" />
                <Stack gap={0}>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    {t("detail.price")}
                  </Text>
                  <Text size="sm" fw={500}>
                    {event.price && event.price > 0
                      ? `${event.price} €`
                      : t("detail.free_entry")}
                  </Text>
                </Stack>
              </Group>
            </Group>
          </Stack>
        </Paper>

        {isPaid && (
          <Card withBorder radius="md" padding="md">
            <Text fw={700} size="sm" mb="xs" c="var(--upagain-dark-green)">
              {t("admin:finance.settings_modal.title", {
                defaultValue: "Financial breakdown",
              })}
            </Text>
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="xs" c="dimmed">
                  {t("common:price_details.base_price", {
                    defaultValue: "Base Price",
                  })}
                </Text>
                <Text size="xs" fw={600}>
                  {basePrice.toFixed(2)} €
                </Text>
              </Group>
              <Group justify="space-between">
                <Text size="xs" c="dimmed">
                  VAT (20%)
                </Text>
                <Text size="xs" fw={600}>
                  {vat.toFixed(2)} €
                </Text>
              </Group>
              <Group justify="space-between">
                <Text size="xs" c="dimmed">
                  {t("common:price_details.processing_fee", {
                    defaultValue: "Processing Fee",
                  })}
                </Text>
                <Text size="xs" fw={600}>
                  {processingFee.toFixed(2)} €
                </Text>
              </Group>
              <Divider my={2} />
              <Group justify="space-between">
                <Text fw={700} size="sm">
                  {t("common:price_details.total", { defaultValue: "Total" })}
                </Text>
                <Text fw={700} size="sm" c="var(--upagain-neutral-green)">
                  {totalPrice.toFixed(2)} €
                </Text>
              </Group>
            </Stack>
            <Group gap="xs" mt="sm" align="center" wrap="nowrap">
              <ThemeIcon size="xs">
                <IconInfoCircle size={12} />
              </ThemeIcon>
              <Text size="10px" c="dimmed" style={{ lineHeight: 1.3 }}>
                {t("common:price_details.stripe_disclaimer", {
                  defaultValue:
                    "You will be redirected to Stripe to make a secure payment.",
                })}
              </Text>
            </Group>
          </Card>
        )}

        <Group gap="xs" p="sm" bg="var(--mantine-color-red-0)" style={{ borderRadius: "8px", border: "1px solid var(--mantine-color-red-1)" }}>
          <IconAlertCircle size={18} color="var(--mantine-color-red-6)" />
          <Text size="xs" c="red.7" fw={600}>
            {t("detail.refund_warning")}
          </Text>
        </Group>

        <Group grow mt="lg">
          <Button
            variant="secondary"
            color="gray"
            onClick={onClose}
            radius="md"
          >
            {t("common:actions.cancel")}
          </Button>
          <Button
            variant="cta-reverse"
            color="var(--upagain-neutral-green)"
            onClick={onConfirm}
            loading={loading}
            radius="md"
          >
            {isPaid
              ? t("common:price_details.pay_stripe", {
                  defaultValue: "Pay with Stripe",
                })
              : t("common:confirm", { defaultValue: "Confirm" })}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
