import { Paper, Stack, Group, Text, ThemeIcon } from "@mantine/core";
import { type ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  color: string;
  align?: "stretch" | "center";
}

export function DashboardCard({
  title,
  icon,
  children,
  color,
  align = "stretch",
}: DashboardCardProps) {
  return (
    <Paper
      variant="primary"
      p="xl"
      radius="lg"
      style={{
        transition: "transform 0.2s ease",
        borderLeft: `4px solid ${color}`,
        height: "100%",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.transform = "translateY(-4px)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
    >
      <Stack gap="md" align={align} h="100%">
        <Group justify="space-between" w="100%">
          <Text size="xs" fw={700} tt="uppercase">
            {title}
          </Text>
          <ThemeIcon variant="light" color={color} radius="md">
            {icon}
          </ThemeIcon>
        </Group>
        {children}
      </Stack>
    </Paper>
  );
}
