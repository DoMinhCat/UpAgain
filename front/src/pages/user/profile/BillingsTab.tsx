import { Stack, Text, Title } from "@mantine/core";

export default function BillingsTab() {
  return (
    <Stack gap={5}>
      <Title order={1} size={42} fw={800}>
        Billing & Subscriptions
      </Title>
      <Text c="dimmed" size="lg">
        Manage your payment methods, billing address, and subscription plans.
      </Text>
    </Stack>
  );
}
