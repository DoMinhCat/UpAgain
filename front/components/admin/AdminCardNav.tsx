import { Card, Group, Title, Text } from "@mantine/core";
import { type Icon } from "@tabler/icons-react";

interface AdminCardNavProps {
  icon: Icon;
  title: string;
  description: string;
}

export default function AdminCardNav({
  icon: Icon,
  title,
  description,
}: AdminCardNavProps) {
  return (
    <Card shadow="sm" px="lg" pt="lg" pb="xl" radius="md" withBorder>
      <Icon />
      <Title mt="lg" order={3}>
        {title}
      </Title>

      <Text mt="xs" c="dimmed">
        {description}
      </Text>
    </Card>
  );
}
