import { Container, Group, Stack, Button, Title, Text } from "@mantine/core";
import { useAuth } from "../../../context/AuthContext";
import { NotFoundPage } from "../../error/404";
import MyBreadcrumbs from "../../../components/nav/MyBreadcrumbs";
import { PATHS } from "../../../routes/paths";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function MartketPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  if (user?.role !== "pro" && user?.role !== "user") {
    return <NotFoundPage />;
  }
  return (
    <Container px="md" py={50} size="xl">
      <Stack gap="xl" mb="xl">
        {/* Header */}

        <Stack gap={4}>
          <MyBreadcrumbs
            mb="md"
            breadcrumbs={[
              { title: t("home:title"), href: PATHS.HOME },
              { title: t("marketplace:market"), href: PATHS.MARKETPLACE.HOME },
            ]}
          />
          <Title order={1} size={36}>
            {t("marketplace:market")}
          </Title>
          <Group justify="space-between" wrap="wrap" gap="md">
            <Text c="dimmed" size="md">
              {t("marketplace:subtitle")}
            </Text>
          </Group>
        </Stack>
      </Stack>
    </Container>
  );
}
