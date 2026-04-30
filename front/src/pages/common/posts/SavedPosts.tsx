import {
  Container,
  Group,
  SegmentedControl,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import MyBreadcrumbs from "../../../components/nav/MyBreadcrumbs";
import { useTranslation } from "react-i18next";
import { PATHS } from "../../../routes/paths";
import { useLocation } from "react-router-dom";
import { useState } from "react";

export default function SavedPosts() {
  const { t } = useTranslation();
  const location = useLocation();
  const [category, setCategory] = useState("");
  const [page, setPage] = useState<number>(1);
  const LIMIT = 8;
  const CATEGORIES = [
    { value: "", label: t("community:filters.all") },
    { value: "tutorial", label: t("community:filters.tutorial") },
    { value: "tips", label: t("community:filters.tips") },
    { value: "news", label: t("community:filters.news") },
    { value: "case_study", label: t("community:filters.case_study") },
    { value: "project", label: t("community:filters.project") },
    { value: "other", label: t("community:filters.other") },
  ];

  return (
    <Container size="xl" pb={40} my="xl" pt={24} w="100%">
      <Stack gap="lg">
        {/* HEADER */}
        <Stack gap={4} mb="xl">
          <MyBreadcrumbs
            mb="md"
            breadcrumbs={[
              { title: t("home:title"), href: PATHS.HOME },
              ...(location.state?.from === "profile"
                ? [
                    {
                      title: t("profile:my_profile"),
                      href: PATHS.USER.PROFILE,
                    },
                  ]
                : location.state?.from === "communityIndex"
                  ? [
                      {
                        title: t("community:community"),
                        href: PATHS.USER.POSTS.ALL,
                      },
                    ]
                  : []),
              { title: t("community:my_posts"), href: "#" },
            ]}
          />
          <Title order={1} size={36}>
            {t("community:my_posts")}
          </Title>
          <Group justify="space-between">
            <Text c="dimmed" size="md">
              {t("community:manage_posts_subtitle")}
            </Text>
            <SegmentedControl
              value={category}
              onChange={(v) => {
                setCategory(v);
                setPage(1);
              }}
              data={CATEGORIES}
              size="sm"
            />{" "}
          </Group>
        </Stack>
      </Stack>
    </Container>
  );
}
