import {
  Paper,
  Text,
  Title,
  Stack,
  Group,
  List,
  ThemeIcon,
  Button,
  Badge,
  Loader,
} from "@mantine/core";
import { useTranslation, Trans } from "react-i18next";
import { IconCheck, IconStar } from "@tabler/icons-react";
import { useGetFinanceSettingByKey } from "../../hooks/financeHooks";

interface PremiumCardProps {
  selected?: boolean;
  onClick?: () => void;
  selectedTrial?: boolean;
  onTrialClick?: () => void;
}

export function PremiumCard({
  selected,
  onClick,
  selectedTrial,
  onTrialClick,
}: PremiumCardProps) {
  const { t } = useTranslation("auth");
  const { data: trialDays, isLoading: isTrialDaysLoading } =
    useGetFinanceSettingByKey("trial_days");
  const { data: subscriptionPrice, isLoading: isSubscriptionPriceLoading } =
    useGetFinanceSettingByKey("subscription_price");

  if (isTrialDaysLoading || isSubscriptionPriceLoading) {
    return <Loader />;
  }
  return (
    <Paper
      withBorder
      shadow={selected ? "xl" : "sm"}
      p="xl"
      radius="lg"
      style={{
        width: 360,
        backgroundColor: "var(--mantine-color-body)",
        borderColor: selected
          ? "var(--upagain-primary)"
          : "var(--upagain-neutral-green)",
        borderWidth: selected ? 3 : 2,
        position: "relative",
        cursor: "pointer",
        transition: "all 0.3s ease",
      }}
      onClick={onClick}
      onMouseEnter={(e) =>
        (e.currentTarget.style.transform = "translateY(-8px)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
    >
      {selected && (
        <ThemeIcon
          variant="filled"
          radius="xl"
          size="lg"
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            zIndex: 10,
            backgroundColor: "var(--upagain-primary)",
          }}
        >
          <IconCheck stroke={3} />
        </ThemeIcon>
      )}
      <Badge
        variant="filled"
        size="lg"
        radius="sm"
        style={{
          backgroundColor: "var(--upagain-yellow)",
          color: "#2a2a28", // Dark text for contrast on yellow
          position: "absolute",
          top: -14,
          left: "50%",
          transform: "translateX(-50%)",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        }}
      >
        {t("plans.premium.best_value")}
      </Badge>

      <Stack gap="xl">
        {/* Header Section */}
        <Stack gap={0} align="center">
          <ThemeIcon
            size={52}
            radius="xl"
            style={{
              backgroundColor: "var(--upagain-light-green)",
              color: "var(--upagain-dark-green)",
            }}
          >
            <IconStar size={32} fill="currentColor" />
          </ThemeIcon>
          <Title order={4} size={32} mt="md" c="var(--mantine-color-text)">
            {t("plans.premium.title")}
          </Title>
          <Text c="var(--mantine-color-dimmed)" size="sm" ta="center" px="md">
            {t("plans.premium.subtitle")}
          </Text>
        </Stack>

        {/* Feature List */}
        <List
          spacing="sm"
          size="md"
          center
          icon={
            <ThemeIcon
              color="var(--upagain-neutral-green)"
              size={22}
              radius="xl"
            >
              <IconCheck size={14} stroke={4} />
            </ThemeIcon>
          }
        >
          <List.Item>
            <Text size="sm" c="var(--mantine-color-text)">
              <Trans
                i18nKey="plans.premium.feature_plus"
                ns="auth"
                components={{ b: <b /> }}
              />
            </Text>
          </List.Item>
          <List.Item>
            <Text size="sm" c="var(--mantine-color-text)">
              <Trans
                i18nKey="plans.premium.feature_unlimited"
                ns="auth"
                components={{ b: <b /> }}
              />
            </Text>
          </List.Item>
          <List.Item>
            <Text size="sm" c="var(--mantine-color-text)">
              <Trans
                i18nKey="plans.premium.feature_badge"
                ns="auth"
                components={{ b: <b /> }}
              />
            </Text>
          </List.Item>
          <List.Item>
            <Text size="sm" c="var(--mantine-color-text)">
              {t("plans.premium.feature_alerts")}
            </Text>
          </List.Item>
          <List.Item>
            <Text size="sm" c="var(--mantine-color-text)">
              {t("plans.premium.feature_advanced_dashboard")}
            </Text>
          </List.Item>
        </List>

        {/* Bottom Price Section */}
        <Stack gap="xs" mt="xs">
          <Group align="flex-end" justify="center" gap={4}>
            <Text
              size="xl"
              fw={900}
              style={{
                fontSize: 48,
                lineHeight: 1,
                color: "var(--mantine-color-text)",
              }}
            >
              {subscriptionPrice}€
            </Text>
            <Text c="var(--mantine-color-dimmed)" fw={600} pb={8}>
              {t("plans.premium.per_month")}
            </Text>
          </Group>

          <Button
            data-variant="cta"
            size="md"
            fullWidth
            radius="xl"
            mt="sm"
            onClick={(e) => {
              e.stopPropagation();
              if (onClick) onClick();
            }}
          >
            {selected && !selectedTrial
              ? t("plans.premium.selected")
              : t("plans.premium.select")}
          </Button>

          {trialDays && trialDays > 0 && (
            <Button
              variant={selectedTrial ? "primary" : "secondary"}
              size="md"
              fullWidth
              radius="xl"
              mt="xs"
              onClick={(e) => {
                e.stopPropagation();
                if (onTrialClick) onTrialClick();
              }}
            >
              {selectedTrial
                ? t("plans.premium.trial_selected")
                : t("plans.premium.trial_select", { count: trialDays })}
            </Button>
          )}

          <Text size="xs" c="var(--mantine-color-dimmed)" ta="center">
            {t("plans.premium.secured")}
          </Text>
        </Stack>
      </Stack>
    </Paper>
  );
}
