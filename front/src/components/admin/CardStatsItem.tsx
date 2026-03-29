import { Group, Text, ThemeIcon } from "@mantine/core";

export function CardStatsItem({ icon, label, value, color }: any) {
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
