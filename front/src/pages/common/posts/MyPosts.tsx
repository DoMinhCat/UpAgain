import {
  Button,
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
import { useAuth } from "../../../context/AuthContext";
import PostCard from "../../../components/post/PostCard";
import { IconLeaf, IconPlus } from "@tabler/icons-react";
import PaginationFooter from "../../../components/common/PaginationFooter";
import {
  useGetMyPosts,
  useLikePost,
  useSavePost,
} from "../../../hooks/postHooks";
import { CreatePostModal } from "../../../components/post/CreatePostModal";
import { useDisclosure } from "@mantine/hooks";

export default function MyPosts() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [openedCreate, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);

  const CATEGORIES = [
    { value: "", label: t("community:filters.all") },
    { value: "tutorial", label: t("community:filters.tutorial") },
    { value: "tips", label: t("community:filters.tips") },
    { value: "news", label: t("community:filters.news") },
    { value: "case_study", label: t("community:filters.case_study") },
    { value: "project", label: t("community:filters.project") },
    { value: "other", label: t("community:filters.other") },
  ];

  // Get own posts
  const LIMIT = 8;
  const { data: myPostsData, isLoading: isLoadingMyPosts } = useGetMyPosts(
    page,
    LIMIT,
    category,
  );

  const totalRecords = myPostsData?.total_records || 0;
  const myPosts = myPostsData?.posts || [];
  const lastPage = Math.ceil(totalRecords / LIMIT);

  const { mutateAsync: likePostAsync } = useLikePost();
  const { mutateAsync: savePostAsync } = useSavePost();

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
            <Group gap="sm">
              <SegmentedControl
                value={category}
                onChange={(v) => {
                  setCategory(v);
                  setPage(1);
                }}
                data={CATEGORIES}
                size="sm"
              />
              {(user?.role === "employee" ||
                user?.role === "admin" ||
                user?.role === "pro") && (
                <Button
                  onClick={openCreate}
                  variant="cta"
                  leftSection={<IconPlus stroke={2} />}
                  ta="center"
                >
                  {t("admin:posts.new_post")}
                </Button>
              )}
            </Group>
          </Group>
        </Stack>

        {myPosts.length === 0 ? (
          <Center py={80}>
            <Stack align="center" gap="xs">
              <IconLeaf
                size={48}
                color="var(--upagain-neutral-green)"
                stroke={1.5}
              />
              <Text c="dimmed" ta="center" maw={300}>
                {t("community:empty_my_posts")}
              </Text>
              {(user?.role === "employee" || user?.role === "admin") && (
                <Button onClick={openCreate} mt="lg" variant="cta-reverse">
                  {t("admin:posts.new_post")}
                </Button>
              )}
            </Stack>
          </Center>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
            {myPosts.map((post) => (
              <PostCard
                currentRole={user?.role || ""}
                key={post.id}
                title={post.title}
                description={post.content}
                image={post.photos?.[0] ?? ""}
                category={post.category}
                authorName={post.creator}
                authorAvatar={post.creator_avatar ?? ""}
                postedTime={post.created_at}
                views={post.view_count}
                likes={post.like_count}
                isLiked={post.is_liked}
                isSaved={post.is_saved}
                isSponsored={post.ads_id !== null}
                onLike={() => likePostAsync(post.id)}
                onSave={() => savePostAsync(post.id)}
                onClick={() =>
                  navigate(PATHS.USER.POSTS.DETAILS_FN(post.id), {
                    state: { from: "myPosts" },
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
          limit={LIMIT}
          unit={t("community:articles")}
          loading={isLoadingMyPosts}
        />
      </Stack>
      <CreatePostModal
        role={user?.role || ""}
        opened={openedCreate}
        onClose={closeCreate}
      />
    </Container>
  );
}
