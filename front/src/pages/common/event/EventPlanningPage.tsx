import { Container, Stack, Title, Group, Text, Button } from "@mantine/core";
import { useLocation, useNavigate } from "react-router-dom";
import MyBreadcrumbs from "../../../components/nav/MyBreadcrumbs";
import { useTranslation } from "react-i18next";
import { PATHS } from "../../../routes/paths";
import { IconCalendar } from "@tabler/icons-react";

export default function EventPlanningPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
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
