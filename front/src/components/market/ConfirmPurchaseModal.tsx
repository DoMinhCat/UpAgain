import { Button, Group, Modal, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconShoppingCart } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { usePurchaseItem } from "../../hooks/itemHooks";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../routes/paths";

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
  const { t } = useTranslation(["marketplace", "common"]);
  const purchaseMutation = usePurchaseItem(idItem);
  const navigate = useNavigate();

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
            {t("marketplace:detail.buy", {
              defaultValue: "Buy",
            })}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
