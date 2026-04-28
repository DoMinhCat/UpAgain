import { Stack, Text, Title } from "@mantine/core";
import EnableNotiCheckBox from "../../../components/common/EnableNotiCheckBox";
import { useAuth } from "../../../context/AuthContext";

export default function PreferencesTab() {
  const { user } = useAuth();
  return (
    <Stack gap={5}>
      <Title order={1} size={42} fw={800}>
        Preferences
      </Title>
      <Text c="dimmed" size="lg">
        Manage your notification settings and display preferences
      </Text>
      {user?.role !== "admin" && <EnableNotiCheckBox />}
    </Stack>
  );
}
