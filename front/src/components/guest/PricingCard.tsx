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
} from "@mantine/core";
import { IconCheck, IconStar } from "@tabler/icons-react";

interface PricingCardProps {
  selected?: boolean;
  onClick?: () => void;
}

export function PricingCard({ selected, onClick }: PricingCardProps) {
  return (
    <Paper
      withBorder
      shadow={selected ? "xl" : "sm"}
      p="xl"
      radius="lg"
      style={{
        width: 360,
        backgroundColor: "var(--mantine-color-body)",
        borderColor: selected ? "var(--upagain-primary)" : "var(--upagain-neutral-green)",
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
        Best Value
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
            Premium
          </Title>
          <Text c="var(--mantine-color-dimmed)" size="sm" ta="center" px="md">
            The professional choice for serious upcyclers.
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
              <b>All Freemium features</b> plus...
            </Text>
          </List.Item>
          <List.Item>
            <Text size="sm" c="var(--mantine-color-text)">
              <b>Unlimited</b> material deposits
            </Text>
          </List.Item>
          <List.Item>
            <Text size="sm" c="var(--mantine-color-text)">
              Verified <b>Artisan</b> Badge
            </Text>
          </List.Item>
          <List.Item>
            <Text size="sm" c="var(--mantine-color-text)">
              Smart alerts for rare finds
            </Text>
          </List.Item>
          <List.Item>
            <Text size="sm" c="var(--mantine-color-text)">
              Advanced Impact Dashboard
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
              29€
            </Text>
            <Text c="var(--mantine-color-dimmed)" fw={600} pb={8}>
              / month
            </Text>
          </Group>

          <Button data-variant="cta" size="md" fullWidth radius="xl" mt="sm">
            Go Premium
          </Button>

          <Text size="xs" c="var(--mantine-color-dimmed)" ta="center">
            Secured by UpAgain • Cancel anytime
          </Text>
        </Stack>
      </Stack>
    </Paper>
  );
}
