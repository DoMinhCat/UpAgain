import { Container, Stack, Title, Group, Text } from "@mantine/core";
import MyBreadcrumbs from "../../../components/nav/MyBreadcrumbs";
import { useTranslation } from "react-i18next";
import { PATHS } from "../../../routes/paths";

export default function EventPlanningPage() {
  const { t } = useTranslation();

  return (
    <Container size="xl" py={40} w="100%">
      <Stack gap="xl">
        <Stack gap="xs">
          <MyBreadcrumbs
            breadcrumbs={[
              {
                title: t("home:title", { defaultValue: "Home" }),
                href: PATHS.HOME,
              },
              {
                title: t("events", { defaultValue: "Events" }),
                href: "/events",
              },
              { title: t("events:btn_event_planning"), href: "#" },
            ]}
          />
          <Title order={1} size={42} fw={900}>
            {t("events:btn_event_planning")}
          </Title>
          <Group justify="space-between" align="end" mb="lg">
            <Text c="dimmed" size="lg" maw={800}>
              {t("events:btn_event_planning_description")}
            </Text>
          </Group>
        </Stack>
      </Stack>
    </Container>
  );
}
