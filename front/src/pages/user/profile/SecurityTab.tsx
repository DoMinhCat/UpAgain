import { Stack, Text, Title } from "@mantine/core";

export default function SecurityTab() {
  return (
    <Stack gap={5}>
      <Title order={1} size={42} fw={800}>
        Security Settings
      </Title>
      <Text c="dimmed" size="lg">
        Manage your password, two-factor authentication, and active sessions.
      </Text>
    </Stack>
  );
}
