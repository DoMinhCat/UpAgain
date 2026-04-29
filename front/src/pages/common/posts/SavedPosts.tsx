import { Container, Stack, Text, Title } from "@mantine/core";
import MyBreadcrumbs from "../../../components/nav/MyBreadcrumbs";
import { useTranslation } from "react-i18next";
import { PATHS } from "../../../routes/paths";
import { useLocation } from "react-router-dom";

export default function SavedPosts() {
  const { t } = useTranslation();
  const location = useLocation();
  return (
    <Container size="lg" pb={40} pt={24} w="100%">
      <Stack gap="lg">
        <Stack gap={4}>
          <MyBreadcrumbs
            mb="md"
            breadcrumbs={[
              { title: t("home:title"), href: PATHS.HOME },
              ...(location.state?.from === "communityIndex"
                ? [
                    {
                      title: t("community:community"),
                      href: PATHS.USER.POSTS.ALL,
                    },
                  ]
                : []),
              { title: "My posts", href: "#" },
            ]}
          />
          <Title order={1} size={36}>
            Community
          </Title>
          <Text c="dimmed" size="md">
            Discover guides, projects, and tips shared by our community of
            upcyclers.
          </Text>
        </Stack>
      </Stack>
    </Container>
  );
}
