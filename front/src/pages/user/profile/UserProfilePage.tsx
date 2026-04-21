import { Container, Tabs, Stack } from "@mantine/core";
import AccountTab from "./AccountTab";
import PreferencesTab from "./PreferencesTab";
import SecurityTab from "./SecurityTab";
import BillingsTab from "./BillingsTab";

export default function UserProfilePage() {
  return (
    <Container size="md" py={60}>
      <Stack gap="xl">
        <Tabs defaultValue="account" color="var(--upagain-neutral-green)">
          <Tabs.List justify="center">
            <Tabs.Tab value="account">Account</Tabs.Tab>
            <Tabs.Tab value="preferences">Preferences</Tabs.Tab>
            <Tabs.Tab value="security">Security</Tabs.Tab>
            <Tabs.Tab value="billings">Billings</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="account" pt="xl">
            <AccountTab />
          </Tabs.Panel>
          <Tabs.Panel value="preferences" pt="xl">
            <PreferencesTab />
          </Tabs.Panel>
          <Tabs.Panel value="security" pt="xl">
            <SecurityTab />
          </Tabs.Panel>
          <Tabs.Panel value="billings" pt="xl">
            <BillingsTab />
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}
