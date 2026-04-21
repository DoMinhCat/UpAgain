import { Card, Badge, ThemeIcon, Title, Text, Stack } from "@mantine/core";
import { type ReactNode } from "react";

interface HeroCardProps {
  scheme: "light" | "dark";
  step: number;
  title: string;
  description?: string;
  icon: ReactNode;
}

export default function HeroCard({
  scheme,
  step,
  title,
  description,
  icon,
}: HeroCardProps) {
  return (
    <Card
      bg={scheme === "dark" ? "#bee2c7" : "var(--mantine-color-body)"}
      shadow="sm"
      padding="xl"
      radius="lg"
      withBorder
      c="#2a2a28"
      style={{ overflow: "visible" }}
    >
      <Stack align="center" gap="md">
        <Badge size="lg" radius="sm">
          Step {step}
        </Badge>

        <ThemeIcon size={60} radius="md" variant="light" color="#7a5c3e">
          {icon}
        </ThemeIcon>

        <Stack align="center" gap={4}>
          <Title order={4} ta="center">
            {title}
          </Title>
          <Text size="sm" ta="center" maw={220}>
            {description}
          </Text>
        </Stack>
      </Stack>
    </Card>
  );
}
