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
  Textarea,
  Button,
  Center,
  Loader,
  Paper,
  Box,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Carousel } from "@mantine/carousel";
import {
  IconHeartFilled,
  IconHeart,
  IconBookmarkFilled,
  IconBookmark,
  IconEye,
  IconMessageCircle,
  IconRouteSquare,
  IconCrownFilled,
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
  useDeleteComment,
} from "../../../hooks/postHooks";
import { ProjectStepTimeline } from "../../../components/post/ProjectStepTimeline";
import type { Step } from "../../../api/interfaces/step";
import CommentCard from "../../../components/post/CommentCard";
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
import { DeleteCommentModal } from "../../../components/post/DeleteCommentModal";
import { useTranslation } from "react-i18next";
import { PhotosCarousel } from "../../../components/photo/PhotosCarousel";
import { resolveUrl } from "../../../utils/imageUtils";
import DOMPurify from "dompurify";

const CATEGORY_COLOR: Record<string, string> = {
  tutorial: "blue",
  project: "green",
  tips: "yellow",
  case_study: "violet",
  news: "red",
  other: "gray",
};

export default function PostDetailPage() {
  // const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation(["post", "common", "admin"]);
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

  const viewTimerFired = useRef(false);

  const { data: postData, isLoading: isLoadingPost } = useGetUserPostDetails(
    postId,
    isValidId,
  );
  const { data: commentsData, isLoading: isLoadingComments } =
    useGetUserPostComments(postId, isValidId, commentPage, 10);

  const { data: projectSteps, isLoading: isLoadingProjectSteps } =
    useGetProjectStepsByPostId(postId, isValidId);

  const { mutate: likePost, isPending: isLiking } = useLikePost();
  const { mutate: savePost, isPending: isSaving } = useSavePost();
  const { mutate: incrementView } = useIncrementPostView();
  const { mutate: addComment, isPending: isPosting } = useAddComment(postId);
  const { mutate: likeComment } = useLikeComment();
  const deleteComment = useDeleteComment();

  // DELETE MODAL STATE
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);
  const [
    deleteModalOpened,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);

  const handleOpenDelete = (id: number) => {
    setCommentToDelete(id);
    openDeleteModal();
  };

  const confirmDelete = () => {
    if (commentToDelete) {
      deleteComment.mutate(commentToDelete, {
        onSuccess: () => {
          closeDeleteModal();
          setCommentToDelete(null);
        },
      });
    }
  };

  const post: Post | undefined = postData;
  const comments: PostComment[] = commentsData?.comments ?? [];
  const totalComments = commentsData?.total_comments ?? 0;
  const lastPage = commentsData?.last_page ?? 1;

  // Fire view increment once after 10 seconds after opened
  useEffect(() => {
    if (!isValidId || viewTimerFired.current) return;
    const timer = setTimeout(() => {
      incrementView(postId);
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
    likePost(postId);
  };

  const handleSave = () => {
    const next = !isSaved;
    setLocalSaved(next);
    savePost(postId);
    showSuccessNotification(
      next
        ? t("post:actions.save_success_title")
        : t("post:actions.unsave_success_title"),
      next
        ? t("post:actions.save_success_msg")
        : t("post:actions.unsave_success_msg"),
    );
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    try {
      addComment(
        { content: commentText.trim() },
        {
          onSuccess: () => {
            showSuccessNotification(
              t("post:comments.post_success_title"),
              t("post:comments.post_success_msg"),
            );
            setCommentText("");
          },
        },
      );
    } catch (error: any) {
      showErrorNotification(t("post:comments.post_error_title"), error);
    }
  };

  const handleLikeComment = (id_comment: number) => {
    setLikedComments((prev) => {
      const next = new Set(prev);
      next.has(id_comment) ? next.delete(id_comment) : next.add(id_comment);
      return next;
    });
    likeComment(id_comment);
  };

  if (isLoadingPost) {
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
                  <Tooltip
                    label={t("post:details.sponsored")}
                    position="top"
                    withArrow
                  >
                    <IconCrownFilled size={24} color="var(--upagain-yellow)" />
                  </Tooltip>
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
                  : location.state?.from === "myPosts"
                    ? [
                        {
                          title: t("community:community"),
                          href: PATHS.USER.POSTS.ALL,
                        },
                        {
                          title: t("community:my_posts"),
                          href: PATHS.POSTS.MY_POSTS,
                        },
                      ]
                    : []),
                { title: post.title, href: "#" },
              ]}
            />

            <Stack gap={40}>
              {/* AUTHOR & ACTIONS SECTION */}
              <Paper variant="primary" p="lg" radius="lg" withBorder>
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
                        {getTimeAgo(post.created_at, t)}
                      </Text>
                    </Stack>
                  </Group>

                  <Group gap="md">
                    <Group gap={4} c="dimmed">
                      <IconEye size={18} stroke={1.5} />
                      <Text size="sm" fw={600}>
                        {t("post:details.view_count", {
                          count: post.view_count,
                        })}
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
                        loading={isLiking}
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
                      label={
                        isSaved
                          ? t("post:details.unsave_label")
                          : t("post:details.save_label")
                      }
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
                        loading={isSaving}
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
                radius="lg"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(post.content),
                }}
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
                      <Title order={3}>{t("post:details.project_steps")}</Title>
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
                    {t("post:comments.title", { count: totalComments })}
                  </Title>
                </Group>

                {/* Add comment */}
                <Stack gap="sm" mb="md">
                  <Textarea
                    disabled={role !== "user" && role !== "pro"}
                    placeholder={t("post:comments.placeholder")}
                    value={commentText}
                    radius="lg"
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
                      {t("post:comments.submit")}
                    </Button>
                  </Group>
                </Stack>

                {/* Comments list */}
                {isLoadingComments ? (
                  // TODO: replace with skeleton loading
                  <Center py={40}>
                    <Loader color="var(--upagain-neutral-green)" size="sm" />
                  </Center>
                ) : comments.length === 0 ? (
                  <Text c="dimmed" ta="center" py="xl">
                    {t("post:comments.empty")}
                  </Text>
                ) : (
                  <Stack gap="md">
                    {comments.map((comment) => (
                      <CommentCard
                        role={role}
                        key={comment.id}
                        comment={{
                          ...comment,
                          like_count:
                            comment.like_count +
                            (likedComments.has(comment.id) ? 1 : 0),
                        }}
                        onLike={handleLikeComment}
                        onDelete={handleOpenDelete}
                        isDeleting={
                          deleteComment.isPending &&
                          commentToDelete === comment.id
                        }
                        isLiked={likedComments.has(comment.id)}
                        enableDelete={
                          user?.id === comment.id_account ||
                          role === "admin" ||
                          role === "employee"
                        }
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

      <DeleteCommentModal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        loading={deleteComment.isPending}
      />
    </>
  );
}
