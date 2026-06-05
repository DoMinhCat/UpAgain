import { Button, Group, Modal, Stack, Text, ThemeIcon, Card, Divider, Loader } from "@mantine/core";
import { IconShoppingCart, IconInfoCircle } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { usePurchaseItem } from "../../hooks/itemHooks";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../routes/paths";
import { useGetFinanceSettingByKey } from "../../hooks/financeHooks";

interface ConfirmPurchaseModalProps {
  opened: boolean;
  onClose: () => void;
  idItem: number;
  itemTitle?: string;
  price?: number;
  title?: string;
  isVerifying: boolean;
}

export function ConfirmPurchaseModal({
  opened,
  onClose,
  idItem,
  itemTitle,
  price,
  title,
  isVerifying,
}: ConfirmPurchaseModalProps) {
  const { t } = useTranslation(["marketplace", "common", "admin"]);
  const purchaseMutation = usePurchaseItem(idItem);
  const navigate = useNavigate();

  const { data: commissionRate, isLoading: isLoadingCommission } =
    useGetFinanceSettingByKey("commission_rate");

  const isPaid = price !== undefined && price > 0;
  const basePrice = price || 0;
  const upAgainCommission = isPaid && commissionRate ? basePrice * (commissionRate / 100) : 0;
  const vat = isPaid ? basePrice * 0.2 : 0;
  const processingFee = isPaid ? basePrice * 0.015 + 0.25 : 0;
  const totalPrice = basePrice + upAgainCommission + vat + processingFee;

  const handleConfirm = () => {
    // not free
    if (price && price > 0) {
      purchaseMutation.mutate(
        {
          origin_url: window.location.origin + window.location.pathname,
        },
        {
          onSuccess: (data) => {
            onClose();
            if (data.checkout_url && data.checkout_url != "") {
              // 1st phase: checkout to stripe
              window.location.href = data.checkout_url;
            }
          },
          onError: () => {
            onClose();
          },
        },
      );
    } else {
      // free
      purchaseMutation.mutate(
        {},
        {
          onSuccess: () => {
            onClose();
            navigate(PATHS.MARKETPLACE.ME + "/" + idItem);
          },
          onError: () => {
            onClose();
          },
        },
      );
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        title ||
        t("marketplace:detail.buy_confirm_title", {
          defaultValue: "Confirm Purchase",
        })
      }
      overlayProps={{
        opacity: 0.55,
        blur: 3,
      }}
      zIndex={1000}
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
            <IconShoppingCart size={24} />
          </ThemeIcon>
          <Stack gap={0}>
            <Text fw={700} size="lg">
              {itemTitle || "—"}
            </Text>
            <Text size="sm" c="dimmed">
              {price !== undefined && price > 0
                ? `${price} €`
                : t("marketplace:detail.free", { defaultValue: "Free" })}
            </Text>
          </Stack>
        </Group>

        <Text size="sm">
          {t("marketplace:detail.buy_confirm_text", {
            defaultValue: "Are you sure you want to purchase this item?",
          })}
        </Text>

        {isPaid && (
          <Card withBorder radius="md" padding="md">
            <Text fw={700} size="sm" mb="xs" c="var(--upagain-dark-green)">
              {t("admin:finance.settings_modal.title", {
                defaultValue: "Financial breakdown",
              })}
            </Text>
            {isLoadingCommission ? (
              <Group justify="center" py="xs">
                <Loader size="xs" />
              </Group>
            ) : (
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">
                    {t("common:price_details.item_price", {
                      defaultValue: "Item Price",
                    })}
                  </Text>
                  <Text size="xs" fw={600}>
                    {basePrice.toFixed(2)} €
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">
                    {t("common:price_details.commission", {
                      defaultValue: "UpAgain Commission",
                    })}{" "}
                    ({commissionRate}%)
                  </Text>
                  <Text size="xs" fw={600}>
                    {upAgainCommission.toFixed(2)} €
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
            )}
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

        <Group justify="flex-end" gap="sm" mt="lg">
          <Button variant="secondary" onClick={onClose} radius="md">
            {t("common:actions.cancel")}
          </Button>
          <Button
            variant="cta-reverse"
            loading={purchaseMutation.isPending || isVerifying}
            onClick={handleConfirm}
            radius="md"
          >
            {isPaid
              ? t("marketplace:detail.pay_stripe", {
                  defaultValue: "Pay with Stripe",
                })
              : t("marketplace:detail.buy", {
                  defaultValue: "Buy",
                })}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
