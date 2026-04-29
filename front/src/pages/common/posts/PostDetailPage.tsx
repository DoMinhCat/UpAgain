import {
  Container,
  Title,
  Text,
  Stack,
  Group,
  Avatar,
  Badge,
  ActionIcon,
  Tooltip,
  Divider,
  Image,
  Textarea,
  Button,
  Center,
  Loader,
  Paper,
  Box,
  useComputedColorScheme,
} from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import {
  IconHeartFilled,
  IconHeart,
  IconBookmarkFilled,
  IconBookmark,
  IconEye,
  IconMessageCircle,
  IconRouteSquare,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { PATHS } from "../../../routes/paths";
import {
  useGetUserPostDetails,
  useGetUserPostComments,
  useLikePost,
  useSavePost,
  useIncrementPostView,
  useAddComment,
  useLikeComment,
  useGetProjectStepsByPostId,
} from "../../../hooks/postHooks";
import { ProjectStepTimeline } from "../../../components/post/ProjectStepTimeline";
import type { Step } from "../../../api/interfaces/step";
import PostCommentCard from "../../../components/post/PostCommentCard";
import PaginationFooter from "../../../components/common/PaginationFooter";
import {
  showErrorNotification,
  showSuccessNotification,
} from "../../../components/common/NotificationToast";
import type { Post, PostComment } from "../../../api/interfaces/post";
import { getTimeAgo } from "../../../utils/timeUtils";
import { useAuth } from "../../../context/AuthContext";
import { NotFoundPage } from "../../error/404";
import FullScreenLoader from "../../../components/common/FullScreenLoader";
import MyBreadcrumbs from "../../../components/nav/MyBreadcrumbs";
import { useTranslation } from "react-i18next";
import { PhotosCarousel } from "../../../components/photo/PhotosCarousel";
import { resolveUrl } from "../../../utils/imageUtils";

const USE_FAKE_DATA = true;

const FAKE_POST: Post = {
  id: 5,
  title: "My metal lamp restoration project — before & after",
  content: `<p>I found this 1970s floor lamp at a local flea market for just €8. It was covered in chipped brown paint and had completely dead wiring. Here's how I brought it back to life.</p>

<h3>Step 1 — Disassembly</h3>
<p>I stripped the lamp down to its individual components: base, stem sections, and shade ring. All old wiring was removed and set aside for recycling.</p>

<h3>Step 2 — Paint stripping</h3>
<p>Using a chemical stripper and a lot of patience, I removed all the old paint layers. Underneath was beautiful raw steel with just a hint of surface rust.</p>

<h3>Step 3 — Rust treatment & priming</h3>
<p>I used a phosphoric acid converter to neutralize the rust, then applied two coats of self-etching primer. This is crucial for powder coat adhesion.</p>

<h3>Step 4 — Powder coating</h3>
<p>I chose a matte anthracite grey powder coat. Applied at 200°C for 20 minutes. The result is extremely durable — far better than spray paint.</p>

<h3>Step 5 — Rewiring</h3>
<p>New textile cable in olive green, a new E27 socket, and a period-correct rotary switch. Total electrical cost: under €15.</p>

<h3>Result</h3>
<p>The lamp now sits in my living room and gets more compliments than anything I've ever bought new. Total cost: €8 (lamp) + €35 (materials) = €43.</p>`,
  category: "project",
  view_count: 2101,
  save_count: 88,
  comment_count: 3,
  like_count: 321,
  id_account: 5,
  creator: "Jean-Paul Forge",
  creator_id: 5,
  created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  photos: ["/banners/user-banner1-light.png", "/banners/user-banner1-dark.png"],
  ads_id: 1,
  ads_from: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  ads_to: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
  is_liked: true,
  is_saved: true,
};

const FAKE_COMMENTS: PostComment[] = [
  {
    id: 1,
    content:
      "Incredible transformation! I have a similar lamp sitting in my garage. Now I have the courage to try.",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
    like_count: 12,
    id_post: 5,
    id_account: 10,
    user_name: "Sophie Martin",
    user_avatar: "",
    is_deleted: false,
  },
  {
    id: 2,
    content:
      "What brand of phosphoric acid converter did you use? I've had mixed results with the one I bought from the hardware store.",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    like_count: 5,
    id_post: 5,
    id_account: 11,
    user_name: "Thomas B.",
    user_avatar: "",
    is_deleted: false,
  },
  {
    id: 3,
    content:
      "The textile cable choice is perfect. Where did you source the olive green one? I can only find black or white locally.",
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    like_count: 3,
    id_post: 5,
    id_account: 12,
    user_name: "Marie L.",
    user_avatar: "",
    is_deleted: false,
  },
];

const CATEGORY_COLOR: Record<string, string> = {
  tutorial: "blue",
  project: "green",
  tips: "yellow",
  case_study: "violet",
  news: "red",
  other: "gray",
};

export default function PostDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { from?: string };
  const { t } = useTranslation();
  const { user } = useAuth();
  const role: string = user?.role || "";
  const { id } = useParams<{ id: string }>();
  const postId = parseInt(id ?? "0", 10);
  const isValidId = !isNaN(postId) && postId > 0;

  const [commentPage, setCommentPage] = useState(1);
  const [commentText, setCommentText] = useState("");
  const [likedComments, setLikedComments] = useState<Set<number>>(new Set());

  // PHOTO CAROUSEL MODAL
  const [lightboxOpened, setLightboxOpened] = useState(false);
  const [lightboxSlide, setLightboxSlide] = useState(0);

  const theme = useComputedColorScheme("light");
  const viewTimerFired = useRef(false);

  const { data: postData, isLoading: isLoadingPost } = useGetUserPostDetails(
    postId,
    isValidId && !USE_FAKE_DATA,
  );
  const { data: commentsData, isLoading: isLoadingComments } =
    useGetUserPostComments(
      postId,
      isValidId && !USE_FAKE_DATA,
      commentPage,
      10,
    );

  const { data: projectSteps, isLoading: isLoadingProjectSteps } =
    useGetProjectStepsByPostId(postId, isValidId && !USE_FAKE_DATA);

  const { mutate: likePost, isPending: isLiking } = useLikePost(postId);
  const { mutate: savePost, isPending: isSaving } = useSavePost(postId);
  const { mutate: incrementView } = useIncrementPostView();
  const { mutate: addComment, isPending: isPosting } = useAddComment(postId);
  const { mutate: likeComment } = useLikeComment();

  // TODO: getpost detail
  const post: Post | undefined = USE_FAKE_DATA ? FAKE_POST : postData;
  const comments: PostComment[] = USE_FAKE_DATA
    ? FAKE_COMMENTS
    : (commentsData?.comments ?? []);
  const totalComments = USE_FAKE_DATA
    ? FAKE_COMMENTS.length
    : (commentsData?.total_comments ?? 0);
  const lastPage = USE_FAKE_DATA ? 1 : (commentsData?.last_page ?? 1);

  // Fire view increment once after 10 seconds
  useEffect(() => {
    if (!isValidId || viewTimerFired.current) return;
    const timer = setTimeout(() => {
      if (!USE_FAKE_DATA) {
        incrementView(postId);
      }
      viewTimerFired.current = true;
    }, 10_000);
    return () => clearTimeout(timer);
  }, [isValidId, postId, incrementView]);

  const [localLiked, setLocalLiked] = useState<boolean | undefined>(undefined);
  const [localSaved, setLocalSaved] = useState<boolean | undefined>(undefined);
  const [localLikeCount, setLocalLikeCount] = useState<number | undefined>(
    undefined,
  );

  const isLiked =
    localLiked !== undefined ? localLiked : (post?.is_liked ?? false);
  const isSaved =
    localSaved !== undefined ? localSaved : (post?.is_saved ?? false);
  const likeCount =
    localLikeCount !== undefined ? localLikeCount : (post?.like_count ?? 0);

  const handleLike = () => {
    const next = !isLiked;
    setLocalLiked(next);
    setLocalLikeCount(likeCount + (next ? 1 : -1));
    if (!USE_FAKE_DATA) likePost();
  };

  const handleSave = () => {
    const next = !isSaved;
    setLocalSaved(next);
    if (!USE_FAKE_DATA) savePost();
    showSuccessNotification(
      next ? "Post saved" : "Post unsaved",
      next
        ? "Added to your saved content."
        : "Removed from your saved content.",
    );
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    if (USE_FAKE_DATA) {
      showSuccessNotification("Comment posted", "Your comment was added.");
      setCommentText("");
      return;
    }
    try {
      addComment(
        { content: commentText.trim() },
        {
          onSuccess: () => {
            showSuccessNotification(
              "Comment posted",
              "Your comment was added.",
            );
            setCommentText("");
          },
        },
      );
    } catch (error: any) {
      showErrorNotification("Failed to post comment", error);
    }
  };

  const handleLikeComment = (id_comment: number) => {
    setLikedComments((prev) => {
      const next = new Set(prev);
      next.has(id_comment) ? next.delete(id_comment) : next.add(id_comment);
      return next;
    });
    if (!USE_FAKE_DATA) likeComment(id_comment);
  };

  if (!USE_FAKE_DATA && isLoadingPost) {
    return (
      <Center py={120}>
        <Loader color="var(--upagain-neutral-green)" />
      </Center>
    );
  }

  if (!post) {
    return <NotFoundPage />;
  }
  if (isLoadingPost) {
    return <FullScreenLoader />;
  }

  return (
    <>
      <Stack gap={0} mb={120}>
        {/* 1. HERO SECTION */}
        <Box pos="relative">
          {post.photos && post.photos.length > 0 ? (
            <Carousel
              withIndicators
              emblaOptions={{
                loop: true,
                dragFree: false,
                align: "center",
              }}
              height={500}
              styles={{
                indicator: {
                  width: 12,
                  height: 4,
                  transition: "width 250ms ease",
                  "&[dataActive]": { width: 40 },
                },
              }}
            >
              {post.photos.map((url, index) => (
                <Carousel.Slide key={index}>
                  <Box
                    h="100%"
                    style={{
                      backgroundImage: `url("${resolveUrl(url)}")`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      cursor: "zoom-in",
                    }}
                    onClick={() => {
                      setLightboxSlide(index);
                      setLightboxOpened(true);
                    }}
                  >
                    <Box
                      pos="absolute"
                      inset={0}
                      style={{
                        background:
                          "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.5) 100%)",
                        pointerEvents: "none",
                      }}
                    />
                  </Box>
                </Carousel.Slide>
              ))}
            </Carousel>
          ) : (
            <Box
              h={500}
              style={{
                backgroundImage: "/banners/user-banner1-dark.png",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <Box
                pos="absolute"
                inset={0}
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.5) 100%)",
                  pointerEvents: "none",
                }}
              />
            </Box>
          )}

          <Container
            size="xl"
            pos="absolute"
            bottom={0}
            left={0}
            right={0}
            pb={40}
            style={{ zIndex: 10, pointerEvents: "none" }}
          >
            <Stack gap="md" style={{ pointerEvents: "auto" }}>
              <Group gap="xs">
                <Badge
                  variant={CATEGORY_COLOR[post.category] ?? "gray"}
                  size="lg"
                >
                  {post.category.toUpperCase()}
                </Badge>
                {post.ads_id && (
                  <Badge variant="yellow" size="sm">
                    Sponsored
                  </Badge>
                )}
              </Group>
              <Title order={1} size={48} c="white" fw={900}>
                {post.title}
              </Title>
            </Stack>
          </Container>
        </Box>

        {/* MAIN CONTENT AREA */}
        <Container size="lg" pb={40} pt={24} w="100%">
          <Stack gap="lg">
            <MyBreadcrumbs
              mb="xl"
              mt="md"
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
                { title: post.title, href: "#" },
              ]}
            />

            <Stack gap={40}>
              {/* AUTHOR & ACTIONS SECTION */}
              <Paper variant="primary" p="lg" radius="xl" withBorder>
                <Group justify="space-between" align="center">
                  <Group gap="sm">
                    <Avatar
                      radius="xl"
                      src={
                        post.photos?.[0]
                          ? resolveUrl(post.photos[0])
                          : undefined
                      }
                      name={post.creator}
                      color="initials"
                      size="md"
                    />
                    <Stack gap={0}>
                      <Text fw={700} size="sm">
                        {post.creator}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {getTimeAgo(post.created_at)}
                      </Text>
                    </Stack>
                  </Group>

                  <Group gap="md">
                    <Group gap={4} c="dimmed">
                      <IconEye size={18} stroke={1.5} />
                      <Text size="sm" fw={600}>
                        {post.view_count}
                      </Text>
                    </Group>

                    <Group gap={4}>
                      <ActionIcon
                        className="actionIcon"
                        disabled={role !== "user" && role !== "pro"}
                        data-variant="primary"
                        variant="subtle"
                        radius="xl"
                        aria-label="Like post"
                        onClick={handleLike}
                        loading={isLiking && !USE_FAKE_DATA}
                      >
                        {isLiked ? (
                          <IconHeartFilled
                            size={20}
                            color="var(--mantine-color-red-6)"
                          />
                        ) : (
                          <IconHeart
                            size={20}
                            color="var(--mantine-color-red-6)"
                          />
                        )}
                      </ActionIcon>
                      <Text size="sm" fw={600}>
                        {likeCount}
                      </Text>
                    </Group>

                    <Tooltip
                      label={isSaved ? "Unsave" : "Save for later"}
                      withArrow
                    >
                      <ActionIcon
                        disabled={role !== "user" && role !== "pro"}
                        className="actionIcon"
                        data-variant="primary"
                        variant="subtle"
                        radius="xl"
                        aria-label="Save post"
                        onClick={handleSave}
                        loading={isSaving && !USE_FAKE_DATA}
                      >
                        {isSaved ? (
                          <IconBookmarkFilled
                            size={20}
                            color="var(--upagain-yellow)"
                          />
                        ) : (
                          <IconBookmark
                            size={20}
                            color="var(--upagain-yellow)"
                          />
                        )}
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Group>
              </Paper>

              {/* CONTENT */}
              <Paper
                className="paper"
                data-variant="primary"
                p="xl"
                radius="md"
                dangerouslySetInnerHTML={{ __html: post.content }}
                style={{
                  lineHeight: 1.8,
                  fontSize: "var(--mantine-font-size-md)",
                }}
              />

              {/* Project Steps Section */}
              {post.category === "project" && (
                <>
                  <Divider my="md" />
                  <Stack gap="xl">
                    <Group gap="sm">
                      <IconRouteSquare
                        color="var(--upagain-neutral-green)"
                        size={32}
                      />
                      <Title order={3}>
                        {t("admin:posts.details.project_steps")}
                      </Title>
                    </Group>

                    {isLoadingProjectSteps ? (
                      <Center mt="xl">
                        <Loader color="var(--upagain-neutral-green)" />
                      </Center>
                    ) : (
                      <ProjectStepTimeline
                        role={role === "admin" ? "admin" : "user"}
                        enableDeleteStep={
                          user?.role === "admin" || user?.role === "employee"
                        }
                        projectSteps={projectSteps as Step[]}
                        postId={post.id}
                      />
                    )}
                  </Stack>
                </>
              )}

              <Divider />

              {/* COMMENTS SECTION */}
              <Stack gap="lg">
                <Group gap="xs">
                  <IconMessageCircle size={22} stroke={1.5} />
                  <Title order={3}>
                    {totalComments} comment{totalComments !== 1 ? "s" : ""}
                  </Title>
                </Group>

                {/* Add comment */}
                <Stack gap="sm" mb="md">
                  <Textarea
                    disabled={role !== "user" && role !== "pro"}
                    placeholder="Share your thoughts..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.currentTarget.value)}
                    minRows={3}
                    autosize
                  />
                  <Group justify="flex-end">
                    <Button
                      className="button"
                      data-variant="primary"
                      onClick={handleAddComment}
                      loading={isPosting}
                      disabled={
                        !commentText.trim() ||
                        (role !== "user" && role !== "pro")
                      }
                    >
                      Post comment
                    </Button>
                  </Group>
                </Stack>

                {/* Comments list */}
                {!USE_FAKE_DATA && isLoadingComments ? (
                  // TODO: replace with skeleton loading
                  <Center py={40}>
                    <Loader color="var(--upagain-neutral-green)" size="sm" />
                  </Center>
                ) : comments.length === 0 ? (
                  <Text c="dimmed" ta="center" py="xl">
                    No comments yet. Be the first to share your thoughts!
                  </Text>
                ) : (
                  <Stack gap="md">
                    {comments.map((comment) => (
                      <PostCommentCard
                        role={role}
                        key={comment.id}
                        comment={{
                          ...comment,
                          like_count:
                            comment.like_count +
                            (likedComments.has(comment.id) ? 1 : 0),
                        }}
                        onLike={handleLikeComment}
                      />
                    ))}
                  </Stack>
                )}

                <PaginationFooter
                  activePage={commentPage}
                  setPage={setCommentPage}
                  total_records={totalComments}
                  last_page={lastPage}
                  limit={10}
                  unit="comments"
                  hidden={USE_FAKE_DATA}
                />
              </Stack>
            </Stack>
          </Stack>
        </Container>
      </Stack>

      <PhotosCarousel
        photos={post.photos || []}
        opened={lightboxOpened}
        onClose={() => setLightboxOpened(false)}
        defaultActiveSlide={lightboxSlide}
      />
    </>
  );
}
