import {
  Center,
  Container,
  Group,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import MyBreadcrumbs from "../../../components/nav/MyBreadcrumbs";
import { useTranslation } from "react-i18next";
import { PATHS } from "../../../routes/paths";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useGetSavedPosts } from "../../../hooks/postHooks";
import FullScreenLoader from "../../../components/common/FullScreenLoader";
import PaginationFooter from "../../../components/common/PaginationFooter";
import { IconLeaf } from "@tabler/icons-react";
import PostCard from "../../../components/post/PostCard";
import { useAuth } from "../../../context/AuthContext";

export default function SavedPosts() {
  const { t } = useTranslation();
  const location = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [category, setCategory] = useState("");
  const [page, setPage] = useState<number>(1);

  const LIMIT = 8;
  const { data: savedPostsData, isLoading: isLoadingSavedPosts } =
    useGetSavedPosts(page, LIMIT, category);
  const savedPosts = savedPostsData?.posts || [];
  const total_records = savedPostsData?.total_records || 0;
  const lastPage = Math.ceil(total_records / LIMIT);

  const CATEGORIES = [
    { value: "", label: t("community:filters.all") },
    { value: "tutorial", label: t("community:filters.tutorial") },
    { value: "tips", label: t("community:filters.tips") },
    { value: "news", label: t("community:filters.news") },
    { value: "case_study", label: t("community:filters.case_study") },
    { value: "project", label: t("community:filters.project") },
    { value: "other", label: t("community:filters.other") },
  ];

  if (isLoadingSavedPosts) {
    return <FullScreenLoader />;
  }
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

        {/* SAVED POSTS */}
        {savedPosts.length === 0 ? (
          <Center py={80}>
            <Stack align="center" gap="xs">
              <IconLeaf
                size={48}
                color="var(--upagain-neutral-green)"
                stroke={1.5}
              />
              <Text c="dimmed" ta="center" maw={300}>
                {t("community:empty_saved_posts")}
              </Text>
            </Stack>
          </Center>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
            {savedPosts.map((post) => (
              <PostCard
                currentRole={user?.role || ""}
                key={post.id}
                title={post.title}
                description={post.content}
                image={
                  post.photos?.[0] ??
                  "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c"
                }
                category={post.category}
                authorName={post.creator}
                authorAvatar=""
                postedTime={post.created_at}
                views={post.view_count}
                likes={post.like_count}
                isLiked={post.is_liked}
                isSaved={post.is_saved}
                onClick={() =>
                  navigate(PATHS.USER.POSTS.DETAILS_FN(post.id), {
                    state: { from: "savedPosts" },
                  })
                }
              />
            ))}
          </SimpleGrid>
        )}

        <PaginationFooter
          activePage={page}
          setPage={setPage}
          total_records={total_records}
          last_page={lastPage}
          limit={LIMIT}
          unit={t("community:articles")}
          loading={isLoadingSavedPosts}
        />
      </Stack>
    </Container>
  );
}
