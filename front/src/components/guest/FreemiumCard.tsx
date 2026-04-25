import {
  Paper,
  Text,
  Title,
  Stack,
  Group,
  List,
  ThemeIcon,
  Button,
} from "@mantine/core";
import { useTranslation, Trans } from "react-i18next";
import { IconCheck, IconStar } from "@tabler/icons-react";

interface FreemiumCardProps {
  selected?: boolean;
  onClick?: () => void;
}

export function FreemiumCard({ selected, onClick }: FreemiumCardProps) {
  const { t } = useTranslation("auth");
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
        borderWidth: selected ? 3 : 1,
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
            backgroundColor: "var(--upagain-primary)",
          }}
        >
          <IconCheck stroke={3} />
        </ThemeIcon>
      )}

      <Stack gap="xl">
        <Stack gap={0} align="center">
          <ThemeIcon
            size={52}
            radius="xl"
            style={{
              backgroundColor: "var(--mantine-color-gray-1)",
              color: "var(--mantine-color-gray-7)",
            }}
          >
            <IconStar size={32} fill="currentColor" />
          </ThemeIcon>
          <Title order={4} size={32} mt="md" c="var(--mantine-color-text)">
            {t("plans.freemium.title")}
          </Title>
          <Text c="var(--mantine-color-dimmed)" size="sm" ta="center" px="md">
            {t("plans.freemium.subtitle")}
          </Text>
        </Stack>

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
                i18nKey="plans.freemium.feature_deposits"
                ns="auth"
                values={{ count: 10 }}
                components={{ b: <b /> }}
              />
            </Text>
          </List.Item>
          <List.Item>
            <Text size="sm" c="var(--mantine-color-text)">
              {t("plans.freemium.feature_dashboard")}
            </Text>
          </List.Item>
          <List.Item>
            <Text size="sm" c="var(--mantine-color-text)">
              {t("plans.freemium.feature_community")}
            </Text>
          </List.Item>
        </List>

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
              0€
            </Text>
            <Text c="var(--mantine-color-dimmed)" fw={600} pb={8}>
              {t("plans.premium.per_month")}
            </Text>
          </Group>

          <Button
            variant={selected ? "primary" : "secondary"}
            size="md"
            fullWidth
            radius="xl"
            mt="sm"
          >
            {selected
              ? t("plans.freemium.selected")
              : t("plans.freemium.select")}
          </Button>

          <Text size="xs" c="var(--mantine-color-dimmed)" ta="center">
            {t("plans.freemium.free_forever")}
          </Text>
        </Stack>
      </Stack>
    </Paper>
  );
}
