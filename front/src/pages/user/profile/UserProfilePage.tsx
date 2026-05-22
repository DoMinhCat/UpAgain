import { Container, Tabs, Stack } from "@mantine/core";
import { useTranslation } from "react-i18next";
import AccountTab from "./AccountTab";
import PreferencesTab from "./PreferencesTab";
import SecurityTab from "./SecurityTab";
import BillingsTab from "./BillingsTab";

export default function UserProfilePage() {
  const { t } = useTranslation("profile");
  return (
    <Container size="md" py={60}>
      <Stack gap="xl">
        <Tabs defaultValue="account" color="var(--upagain-neutral-green)">
          <Tabs.List justify="center">
            <Tabs.Tab value="account">{t("account.title")}</Tabs.Tab>
            <Tabs.Tab value="preferences">{t("preferences.title")}</Tabs.Tab>
            <Tabs.Tab value="security">{t("security.title")}</Tabs.Tab>
            <Tabs.Tab value="billings">{t("billings.title")}</Tabs.Tab>
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
