import { Stack, Text, Title } from "@mantine/core";

export default function PreferencesTab() {
  return (
    <Stack gap={5}>
      <Title order={1} size={42} fw={800}>
        Preferences
      </Title>
      <Text c="dimmed" size="lg">
        Manage your notification settings and display preferences.
      </Text>
    </Stack>
  );
}
