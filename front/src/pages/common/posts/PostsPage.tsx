import {
  Container,
  Title,
  Text,
  Stack,
  SimpleGrid,
  Group,
  SegmentedControl,
  TextInput,
  Select,
  Center,
  Loader,
  Button,
} from "@mantine/core";
import { IconSearch, IconLeaf, IconArticle } from "@tabler/icons-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PostCard from "../../../components/post/PostCard";
import PaginationFooter from "../../../components/common/PaginationFooter";
import { PATHS } from "../../../routes/paths";
import { useGetUserPosts } from "../../../hooks/postHooks";
import type { Post } from "../../../api/interfaces/post";
import { useAuth } from "../../../context/AuthContext";
import MyBreadcrumbs from "../../../components/nav/MyBreadcrumbs";
import { useTranslation } from "react-i18next";

export default function UserPostsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation(["post", "common", "community", "home"]);
  const role: string = user?.role || "";
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("most_recent_creation");
  const [search, setSearch] = useState("");

  const CATEGORIES = [
    { value: "", label: t("community:filters.all") },
    { value: "tutorial", label: t("community:filters.tutorial") },
    { value: "tips", label: t("community:filters.tips") },
    { value: "news", label: t("community:filters.news") },
    { value: "case_study", label: t("community:filters.case_study") },
    { value: "project", label: t("community:filters.project") },
    { value: "other", label: t("community:filters.other") },
  ];

  const SORT_OPTIONS = [
    { value: "most_recent_creation", label: t("community:sort.most_recent") },
    { value: "highest_like", label: t("community:sort.most_popular") },
    { value: "highest_view", label: t("community:sort.most_viewed") },
  ];

  const { data, isLoading } = useGetUserPosts(
    page,
    12,
    category || undefined,
    sort,
    search || undefined,
  );

  const posts: Post[] = data?.posts ?? [];
  const totalRecords = data?.total_records ?? 0;
  const lastPage = data?.last_page ?? 1;
  const limit = data?.limit ?? 12;

  return (
    <Container px="md" py={50} size="xl">
      <Stack gap="xl" mb="xl">
        {/* Header */}
        <Stack gap={4}>
          <MyBreadcrumbs
            mb="md"
            breadcrumbs={[
              { title: t("home:title"), href: PATHS.HOME },
              { title: t("community:community"), href: PATHS.USER.POSTS.ALL },
            ]}
          />
          <Title order={1} size={36}>
            {t("community:community")}
          </Title>
          <Group justify="space-between" wrap="wrap" gap="md">
            <Text c="dimmed" size="md">
              {t("community:subtitle")}
            </Text>
            {(user?.role === "employee" || user?.role === "pro") && (
              <Button
                leftSection={<IconArticle stroke={2} />}
                variant="primary"
                onClick={() => {
                  navigate(PATHS.POSTS.MY_POSTS, {
                    state: { from: "communityIndex" },
                  });
                }}
              >
                {t("community:my_posts")}
              </Button>
            )}
          </Group>
        </Stack>

        {/* Filters */}
        <Group justify="space-between" wrap="wrap" gap="md" my="lg">
          <TextInput
            placeholder={t("community:search_placeholder")}
            leftSection={
              <IconSearch size={16} color="var(--upagain-neutral-green)" />
            }
            value={search}
            onChange={(e) => {
              setSearch(e.currentTarget.value);
              setPage(1);
            }}
            w={{ base: "100%", sm: 280 }}
          />
          <Group gap="md">
            <SegmentedControl
              value={category}
              onChange={(v) => {
                setCategory(v);
                setPage(1);
              }}
              data={CATEGORIES}
              size="sm"
            />
            <Select
              data={SORT_OPTIONS}
              value={sort}
              onChange={(v) => {
                setSort(v ?? "most_recent_creation");
                setPage(1);
              }}
              w={160}
              size="sm"
              allowDeselect={false}
            />
          </Group>
        </Group>

        {/* Grid */}
        {isLoading ? (
          <Center py={80}>
            <Loader color="var(--upagain-neutral-green)" />
          </Center>
        ) : posts.length === 0 ? (
          <Center py={80}>
            <Stack align="center" gap="xs">
              <IconLeaf
                size={48}
                color="var(--upagain-neutral-green)"
                stroke={1.5}
              />
              <Text c="dimmed" ta="center" maw={300}>
                {t("community:empty.title")} {t("community:empty.subtitle")}
              </Text>
            </Stack>
          </Center>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
            {posts.map((post) => (
              <PostCard
                currentRole={role}
                key={post.id}
                title={post.title}
                description={post.content}
                image={post.photos?.[0] ?? ""}
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
                    state: { from: "communityIndex" },
                  })
                }
              />
            ))}
          </SimpleGrid>
        )}

        <PaginationFooter
          activePage={page}
          setPage={setPage}
          total_records={totalRecords}
          last_page={lastPage}
          limit={limit}
          unit="articles"
          loading={isLoading}
        />
      </Stack>
    </Container>
  );
}
