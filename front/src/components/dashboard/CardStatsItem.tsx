import { Group, Text, ThemeIcon } from "@mantine/core";
import type { JSX } from "react";

interface CardStatsItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number | JSX.Element;
  color: string;
}

export function CardStatsItem({
  icon,
  label,
  value,
  color,
}: CardStatsItemProps) {
  return (
    <Group gap="sm" wrap="nowrap">
      <ThemeIcon variant="light" color={color} size="md" radius="md">
        {icon}
      </ThemeIcon>
      <div>
        <Text size="sm" fw={700} lh={1}>
          {value ?? 0}
        </Text>
        <Text size="xs" c="dimmed">
          {label}
        </Text>
      </div>
    </Group>
  );
}
