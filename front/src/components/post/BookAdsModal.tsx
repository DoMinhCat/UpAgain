import React, { useState } from "react";
import {
  Modal,
  Group,
  Stack,
  Text,
  NumberInput,
  Button,
  Card,
  Divider,
  Loader,
  ThemeIcon,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { IconCrownFilled, IconInfoCircle } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useCreateAds } from "../../hooks/adsHooks";
import { useGetFinanceSettingByKey } from "../../hooks/financeHooks";
import { showSuccessNotification } from "../common/NotificationToast";

interface BookAdsModalProps {
  opened: boolean;
  onClose: () => void;
  postId: number;
  role: string;
  postTitle?: string;
}

export function BookAdsModal({
  opened,
  onClose,
  postId,
  role,
  postTitle,
}: BookAdsModalProps) {
  const { t } = useTranslation(["admin", "common"]);
  const createAdsMutate = useCreateAds();

  // State
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [duration, setDuration] = useState<number | string>(1);
  const [errorStartDate, setErrorStartDate] = useState<string | null>(null);
  const [errorDuration, setErrorDuration] = useState<string | null>(null);

  // Load ads price setting (for pro payments)
  const isPro = role === "pro";
  const { data: pricePerMonth, isLoading: isLoadingPrice } =
    useGetFinanceSettingByKey("ads_price_per_month");

  // Validations
  const validateStartDate = () => {
    if (!startDate) {
      setErrorStartDate(
        t("admin:posts.ads_modal.errors.start_required", {
          defaultValue: "Start date is required",
        }),
      );
      return false;
    }
    // Allow today but not past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(startDate);
    selected.setHours(0, 0, 0, 0);
    if (selected < today) {
      setErrorStartDate(
        t("admin:posts.ads_modal.errors.start_future", {
          defaultValue: "Start date must be today or in the future",
        }),
      );
      return false;
    }
    setErrorStartDate(null);
    return true;
  };

  const validateDuration = () => {
    if (!duration) {
      setErrorDuration(
        t("admin:posts.ads_modal.errors.duration_required", {
          defaultValue: "Duration is required",
        }),
      );
      return false;
    }
    const durNum = Number(duration);
    if (isNaN(durNum) || durNum <= 0) {
      setErrorDuration(
        t("admin:posts.ads_modal.errors.duration_min", {
          defaultValue: "Duration must be at least 1 month",
        }),
      );
      return false;
    }
    setErrorDuration(null);
    return true;
  };

  // Submit Handler
  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStartDate() || !validateDuration()) {
      return;
    }

    const fromDate =
      startDate instanceof Date ? startDate : new Date(startDate!);
    const payload: any = {
      id_post: postId,
      from: fromDate,
      duration: Number(duration),
    };

    if (isPro) {
      // 1st Phase: Request Stripe Session
      const queryParams = `?ads_from=${fromDate.toISOString()}&ads_duration=${duration}`;
      payload.origin_url =
        window.location.origin + window.location.pathname + queryParams;
      payload.paid = false;
    }

    createAdsMutate.mutate(payload, {
      onSuccess: (data) => {
        if (isPro && data?.checkout_url) {
          // Redirect to Stripe checkout
          window.location.href = data.checkout_url;
        } else {
          // Admin free creation completed
          setStartDate(null);
          setDuration(1);
          onClose();
          showSuccessNotification(
            "admin:posts.notifications.ads_created_title",
            "admin:posts.notifications.ads_created_msg",
          );
        }
      },
    });
  };

  // Pricing Calculations (for Pro users)
  const basePrice =
    isPro && pricePerMonth ? pricePerMonth * Number(duration) : 0;
  const vat = basePrice * 0.2; // 20% VAT in France
  const processingFee = basePrice > 0 ? basePrice * 0.015 + 0.25 : 0; // 1.5% + 0.25 € Stripe commission
  const totalPrice = basePrice + vat + processingFee;

  return (
    <Modal
      title={
        <Group gap="xs">
          <ThemeIcon variant="light" color="var(--upagain-yellow)" radius="md">
            <IconCrownFilled size={18} />
          </ThemeIcon>
          <Text fw={700}>
            {t("admin:posts.ads_modal.add_title", {
              defaultValue: "Add sponsor status",
            })}
          </Text>
        </Group>
      }
      opened={opened}
      onClose={onClose}
      centered
      radius="lg"
      size="md"
      overlayProps={{
        opacity: 0.55,
        blur: 3,
      }}
    >
      <Stack gap="md" mt="xs">
        {postTitle && (
          <Text size="sm" c="dimmed">
            {t("common:post", { defaultValue: "Post" })}:{" "}
            <strong>{postTitle}</strong>
          </Text>
        )}

        <Group justify="space-between" gap="md" grow>
          <DatePickerInput
            label={t("admin:posts.ads_modal.start_date", {
              defaultValue: "Start date",
            })}
            withAsterisk
            placeholder={t("admin:posts.ads_modal.date_placeholder", {
              defaultValue: "Pick a date",
            })}
            value={startDate}
            onChange={(val) => {
              setStartDate(val as Date | null);
              setErrorStartDate(null);
            }}
            onBlur={validateStartDate}
            error={errorStartDate}
          />
          <NumberInput
            label={t("admin:posts.ads_modal.duration", {
              defaultValue: "Duration (months)",
            })}
            min={1}
            withAsterisk
            value={duration}
            onChange={(val) => {
              setDuration(val);
              setErrorDuration(null);
            }}
            onBlur={validateDuration}
            error={errorDuration}
          />
        </Group>

        {isPro && (
          <Card withBorder radius="md" padding="md">
            <Text fw={700} size="sm" mb="xs" c="var(--upagain-dark-green)">
              {t("admin:finance.settings_modal.title", {
                defaultValue: "Financial breakdown",
              })}
            </Text>
            {isLoadingPrice ? (
              <Group justify="center" py="xs">
                <Loader size="xs" />
              </Group>
            ) : (
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">
                    {t(
                      "admin:finance.settings_modal.labels.ads_price_per_month",
                      {
                        defaultValue: "Ads price / month",
                      },
                    )}
                  </Text>
                  <Text size="xs" fw={600}>
                    {pricePerMonth?.toFixed(2)} €
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">
                    {t("common:price_details.base_price", {
                      defaultValue: "Base Price",
                    })}{" "}
                    ({duration}{" "}
                    {t("admin:posts.ads_modal.duration", {
                      defaultValue: "months",
                    }).toLowerCase()}
                    )
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

        <Group justify="flex-end" gap="sm" mt="md">
          <Button onClick={onClose} variant="grey" radius="md">
            {t("admin:posts.ads_modal.cancel", { defaultValue: "Cancel" })}
          </Button>
          <Button
            onClick={handleConfirm}
            loading={createAdsMutate.isPending}
            variant="primary"
            radius="md"
          >
            {isPro
              ? t("marketplace:detail.buy", { defaultValue: "Pay with Stripe" })
              : t("admin:posts.ads_modal.confirm", { defaultValue: "Confirm" })}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
