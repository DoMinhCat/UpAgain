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
import { useAuth } from "../../../context/AuthContext";
import PostCard from "../../../components/post/PostCard";
import { IconLeaf } from "@tabler/icons-react";
import type { Post } from "../../../api/interfaces/post";
import PaginationFooter from "../../../components/common/PaginationFooter";

const CATEGORIES = [
  { value: "", label: "All" },
  { value: "tutorial", label: "Tutorial" },
  { value: "tips", label: "Tips" },
  { value: "news", label: "News" },
  { value: "case_study", label: "Case Study" },
  { value: "project", label: "Project" },
];

const FAKE_POSTS: Post[] = [
  {
    id: 1,
    title: "How to upcycle wooden pallets into a garden planter",
    content:
      "In this step-by-step guide we transform discarded industrial pallets into a beautiful vertical garden planter. We cover sanding, sealing, and plant selection.",
    category: "tutorial",
    view_count: 1240,
    save_count: 45,
    comment_count: 18,
    like_count: 85,
    id_account: 2,
    creator: "Marcus Wood",
    creator_id: 2,
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    photos: ["/banners/user-banner1-light.png"],
    ads_id: null,
    ads_from: null,
    ads_to: null,
    is_liked: false,
    is_saved: true,
  },
  {
    id: 2,
    title: "5 tips to repair textile instead of throwing it away",
    content:
      "Visible mending and embroidery techniques that give your torn clothes a second life — and make them look even better than before.",
    category: "tips",
    view_count: 890,
    save_count: 30,
    comment_count: 9,
    like_count: 156,
    id_account: 3,
    creator: "Elena Stitch",
    creator_id: 3,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    photos: ["/banners/user-banner1-dark.png"],
    ads_id: null,
    ads_from: null,
    ads_to: null,
    is_liked: true,
    is_saved: false,
  },
  {
    id: 3,
    title: "Case study: turning plastic waste into furniture",
    content:
      "How a small workshop in Lyon transformed 200 kg of plastic waste into a full set of outdoor furniture — profit included.",
    category: "case_study",
    view_count: 3200,
    save_count: 120,
    comment_count: 34,
    like_count: 412,
    id_account: 4,
    creator: "Studio Recyclé",
    creator_id: 4,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    photos: ["/banners/user-banner1-light.png"],
    ads_id: null,
    ads_from: null,
    ads_to: null,
    is_liked: false,
    is_saved: false,
  },
  {
    id: 4,
    title: "UpAgain now accepts glass — here's what you need to know",
    content:
      "Starting next month, all containers will accept glass objects. Here is a quick FAQ on what types of glass are accepted and how to prepare them.",
    category: "news",
    view_count: 560,
    save_count: 15,
    comment_count: 4,
    like_count: 31,
    id_account: 1,
    creator: "UpAgain Team",
    creator_id: 1,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    photos: ["/banners/user-banner1-dark.png"],
    ads_id: null,
    ads_from: null,
    ads_to: null,
    is_liked: false,
    is_saved: false,
  },
  {
    id: 5,
    title: "My metal lamp restoration project — before & after",
    content:
      "Follow my full restoration journey of a 1970s floor lamp: stripping old paint, rewiring, and refinishing with heat-resistant powder coat.",
    category: "project",
    view_count: 2100,
    save_count: 88,
    comment_count: 27,
    like_count: 320,
    id_account: 5,
    creator: "Jean-Paul Forge",
    creator_id: 5,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    photos: ["/banners/user-banner1-light.png"],
    ads_id: 1,
    ads_from: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    ads_to: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
    is_liked: true,
    is_saved: true,
  },
  {
    id: 6,
    title: "Zero-waste cooking: root-to-leaf techniques",
    content:
      "Master the art of using every part of vegetables and drastically reduce your organic waste. Recipes included.",
    category: "tips",
    view_count: 1100,
    save_count: 60,
    comment_count: 12,
    like_count: 210,
    id_account: 6,
    creator: "Chef Julian",
    creator_id: 6,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    photos: ["/banners/user-banner1-dark.png"],
    ads_id: null,
    ads_from: null,
    ads_to: null,
    is_liked: false,
    is_saved: false,
  },
];

export default function MyPosts() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);

  const totalRecords = FAKE_POSTS.length;
  const LIMIT = 8;
  const lastPage = Math.ceil(totalRecords / LIMIT);

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
              { title: "My posts", href: "#" },
            ]}
          />
          <Title order={1} size={36}>
            My posts
          </Title>
          <Group justify="space-between">
            <Text c="dimmed" size="md">
              Manage all your posts in one place.
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

        {FAKE_POSTS.length === 0 ? (
          <Center py={80}>
            <Stack align="center" gap="xs">
              <IconLeaf
                size={48}
                color="var(--upagain-neutral-green)"
                stroke={1.5}
              />
              <Text c="dimmed" ta="center" maw={300}>
                You haven't posted anything of this category yet
              </Text>
            </Stack>
          </Center>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
            {FAKE_POSTS.map((post) => (
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
          limit={LIMIT}
          unit="articles"
          loading={false}
        />
      </Stack>
    </Container>
  );
}
