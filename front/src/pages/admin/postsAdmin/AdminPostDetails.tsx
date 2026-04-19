import {
  Container,
  Title,
  Grid,
  Stack,
  Text,
  Badge,
  Group,
  TextInput,
  Button,
  Box,
  Modal,
  Paper,
  Tooltip,
  Divider,
  Select,
  Card,
  SimpleGrid,
  Avatar,
  ActionIcon,
  Anchor,
  Timeline,
  Loader,
  Center,
  NumberInput,
} from "@mantine/core";
import { useLocation, useNavigate } from "react-router-dom";
import AdminBreadcrumbs from "../../../components/admin/AdminBreadcrumbs";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import {
  IconPhoto,
  IconEye,
  IconHeart,
  IconBookmark,
  IconMessageCircle,
  IconUser,
  IconTrash,
  IconHeartFilled,
  IconRouteSquare,
  IconLink,
  IconCrownFilled,
} from "@tabler/icons-react";
import { TextEditor } from "../../../components/common/input/TextEditor";
import ImageDropzone from "../../../components/common/input/ImageDropzone";
import {
  useDeleteComment,
  useDeletePost,
  useDeleteProjectStep,
  useGetPostComments,
  useGetPostDetails,
  useGetProjectStepsByPostId,
  useUpdatePost,
} from "../../../hooks/postHooks";
import dayjs from "dayjs";
import { useParams } from "react-router-dom";
import FullScreenLoader from "../../../components/common/FullScreenLoader";
import { CardStatsItem } from "../../../components/admin/CardStatsItem";
import { PhotosCarousel } from "../../../components/common/photo/PhotosCarousel";
import PaginationFooter from "../../../components/common/PaginationFooter";
import { DatePickerInput } from "@mantine/dates";

export const AdminPostDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const origin = location.state || {};

  // POST DETAILS
  const params = useParams();
  const postId: number = params.id ? parseInt(params.id) : 0;
  const isValidId = !isNaN(postId) && postId > 0;

  const { data: postDetails, isLoading: isLoadingPostDetails } =
    useGetPostDetails(postId, isValidId);

  // COMMENTS
  const [activePage, setPage] = useState(1);
  const limit = 5; // You can change this
  const { data: comments, isLoading: isLoadingComments } = useGetPostComments(
    postId,
    isValidId,
    activePage,
    limit,
  );

  // EDIT
  const [openedEdit, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);
  const [fileEdit, setFileEdit] = useState<any[]>([]);
  const [titleEdit, setTitleEdit] = useState<string>("");
  const [categoryEdit, setCategoryEdit] = useState<string>("");
  const [descriptionEdit, setDescriptionEdit] = useState<string>("");
  const [errorTitle, setErrorTitle] = useState<string>("");
  const [errorCategory, setErrorCategory] = useState<string>("");
  const [errorDescription, setErrorDescription] = useState<string>("");

  const validateTitleEdit = () => {
    if (!titleEdit || titleEdit.trim() === "") {
      setErrorTitle("Title is required");
      return false;
    }
    setErrorTitle("");
    return true;
  };

  const validateCategoryEdit = () => {
    if (!categoryEdit || categoryEdit.trim() === "") {
      setErrorCategory("Category is required");
      return false;
    }
    setErrorCategory("");
    return true;
  };

  const validateDescriptionEdit = () => {
    const stripped = descriptionEdit.replace(/<[^>]*>/g, "").trim();
    if (!descriptionEdit || stripped === "") {
      setErrorDescription("Post's content is required");
      return false;
    }
    setErrorDescription("");
    return true;
  };

  const handleOpenEdit = () => {
    if (postDetails) {
      setTitleEdit(postDetails.title || "");
      setCategoryEdit(postDetails.category || "");
      setDescriptionEdit(postDetails.content || "");
      const files = postDetails.photos?.map((path) => {
        return {
          path: path,
        };
      });
      setFileEdit(files || []);
    }
    openEdit();
  };

  const handleCloseEdit = () => {
    setErrorTitle("");
    setErrorCategory("");
    setErrorDescription("");
    closeEdit();
  };

  const updatePostMutate = useUpdatePost(postId);

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (postDetails) {
      const isValidTitle = validateTitleEdit();
      const isValidCategory = validateCategoryEdit();
      const isValidDescription = validateDescriptionEdit();
      if (!isValidTitle || !isValidCategory || !isValidDescription) {
        return;
      }
      const formData = new FormData();
      formData.append("title", titleEdit);
      formData.append("category", categoryEdit);
      formData.append("content", descriptionEdit);
      fileEdit.forEach((obj) => {
        if (obj instanceof File) {
          formData.append("new_images", obj);
        } else if (obj.path) {
          formData.append("existing_images", obj.path);
        }
      });
      updatePostMutate.mutate(formData, {
        onSuccess: () => {
          closeEdit();
        },
      });
    }
  };

  // DELETE POST
  const deletePostMutate = useDeletePost();
  const [openedDelete, { open: openDelete, close: closeDelete }] =
    useDisclosure(false);

  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (postDetails) {
      deletePostMutate.mutate(postDetails.id, {
        onSuccess: () => {
          closeDelete();
          navigate("/admin/posts");
        },
      });
    }
  };

  // DELETE COMMENT
  const [idCommentToDelete, setIdCommentToDelete] = useState<number | null>(
    null,
  );
  const [
    openedDeleteComment,
    { open: openDeleteComment, close: closeDeleteComment },
  ] = useDisclosure(false);
  const handleOpenDeleteComment = (id_comment: number) => {
    setIdCommentToDelete(id_comment);
    openDeleteComment();
  };
  const deleteComment = useDeleteComment();
  const handleDeleteComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (idCommentToDelete) {
      deleteComment.mutate(idCommentToDelete, {
        onSuccess: () => {
          closeDeleteComment();
        },
      });
    }
  };

  // PROJECT STEPS
  const { data: projectSteps, isLoading: isLoadingProjectSteps } =
    useGetProjectStepsByPostId(
      postId,
      isValidId && postDetails?.category === "project",
    );

  // DELETE STEP
  const [idStepToDelete, setIdStepToDelete] = useState<number | null>(null);
  const [openedDeleteStep, { open: openDeleteStep, close: closeDeleteStep }] =
    useDisclosure(false);
  const handleOpenDeleteStep = (id_step: number) => {
    setIdStepToDelete(id_step);
    openDeleteStep();
  };
  const deleteStep = useDeleteProjectStep();
  const handleDeleteStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (idStepToDelete) {
      deleteStep.mutate(idStepToDelete, {
        onSuccess: () => {
          closeDeleteStep();
        },
      });
    }
  };

  // ADD SPONSOR STATUS
  const [openedAddSponsor, { open: openAddSponsor, close: closeAddSponsor }] =
    useDisclosure(false);
  const [startDateNewAds, setStartDateNewAds] = useState<string | null>(null);
  const [durationNewAds, setDurationNewAds] = useState<number | string>(1);
  const [errorStartDateNewAds, setErrorStartDateNewAds] = useState<
    string | null
  >(null);
  const [errordurationNewAds, setErrordurationNewAds] = useState<string | null>(
    null,
  );

  const validateStartDateNewAds = () => {
    if (!startDateNewAds) {
      setErrorStartDateNewAds("Start date is required");
      return false;
    }
    if (startDateNewAds < new Date().toISOString()) {
      setErrorStartDateNewAds("Start date must be in the future");
      return false;
    }
    setErrorStartDateNewAds(null);
    return true;
  };
  const validatedurationNewAds = () => {
    if (!durationNewAds) {
      setErrordurationNewAds("Duration is required");
      return false;
    }
    if (typeof durationNewAds === "number" && durationNewAds <= 0) {
      setErrordurationNewAds("Duration must be at least 1 month");
      return false;
    }
    setErrordurationNewAds(null);
    return true;
  };

  const handleAddSponsor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStartDateNewAds() || !validatedurationNewAds()) {
      return;
    }
    // TODO: call mutate hook
    setStartDateNewAds(null);
    setDurationNewAds(1);
    closeAddSponsor();
  };

  if (isLoadingPostDetails || isLoadingComments) {
    return <FullScreenLoader />;
  }

  return (
    <Container px="md" size="xl">
      <Title order={2} mt="xs" mb="sm">
        Post's Details
      </Title>
      <AdminBreadcrumbs
        breadcrumbs={[
          ...(origin.from === "allPosts"
            ? [
                { title: "Post Management", href: "/admin/posts" },
                { title: "Post's Details", href: "/admin/posts/:id" },
              ]
            : origin.from === "historyDetails"
              ? [
                  { title: "History Details", href: "/admin/history/:id" },
                  { title: "Post's Details", href: "/admin/posts/:id" },
                ]
              : [
                  { title: "Post Management", href: "/admin/posts" },
                  { title: "Post's Details", href: "/admin/posts/:id" },
                ]),
        ]}
      />

      <Container p="lg" size="xl">
        {/* LEFT SECTION */}
        <Grid gutter="xl" align="flex-start" mb="xl">
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap={0} style={{ width: "100%" }}>
              <Group>
                <Badge
                  size="md"
                  variant={
                    postDetails?.category === "other"
                      ? "gray"
                      : postDetails?.category === "tutorial"
                        ? "blue"
                        : postDetails?.category === "project"
                          ? "green"
                          : postDetails?.category === "tips"
                            ? "yellow"
                            : postDetails?.category === "case_study"
                              ? "violet"
                              : "red"
                  }
                >
                  {postDetails?.category}
                </Badge>
                {postDetails?.ads_id && (
                  <Badge
                    size="md"
                    variant="gradient"
                    rightSection={
                      <IconCrownFilled
                        size={14}
                        style={{
                          display: "block",
                          filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.2))",
                        }}
                      />
                    }
                  >
                    Sponsored
                  </Badge>
                )}
              </Group>

              <Title order={2} mt="lg" mb="xs">
                {postDetails?.title}
              </Title>
              <Text c="dimmed" size="xs" mb="xl">
                Created on{" "}
                {dayjs(postDetails?.created_at).format("DD/MM/YYYY HH:mm A")}
              </Text>
              <div
                dangerouslySetInnerHTML={{
                  __html: postDetails?.content ?? "",
                }}
              />

              {postDetails?.photos && postDetails.photos.length > 0 && (
                <>
                  <Divider my="xl" />
                  <Group gap="sm">
                    <IconPhoto color="var(--mantine-color-blue-6)" size={32} />
                    <Title order={3}>Photos</Title>
                  </Group>
                  <div style={{ marginTop: "16px" }}>
                    <PhotosCarousel
                      photos={postDetails?.photos || []}
                      initialSlide={0}
                    />
                  </div>
                </>
              )}

              {/* PROJECT STEPS TIMELINE */}
              {postDetails?.category === "project" && (
                <>
                  <Divider my="xl" />
                  <Group gap="sm">
                    <IconRouteSquare
                      color="var(--component-color-primary)"
                      size={32}
                    />
                    <Title order={3}>Project Steps</Title>
                  </Group>

                  {isLoadingProjectSteps ? (
                    <Center mt="xl">
                      <Loader />
                    </Center>
                  ) : (
                    <Timeline mt="xl" lineWidth={4} active={1} bulletSize={24}>
                      {projectSteps?.map((step, index) => (
                        <Timeline.Item
                          key={step.id}
                          title={
                            <Group
                              justify="space-between"
                              align="flex-start"
                              wrap="nowrap"
                            >
                              <Stack gap={2}>
                                <Text fw={700} size="lg">
                                  {index + 1}. {step.title}
                                </Text>
                                <Text c="dimmed" size="xs">
                                  {dayjs(step.created_at).format(
                                    "DD/MM/YYYY HH:mm A",
                                  )}
                                </Text>
                              </Stack>

                              <Tooltip label="Delete this step" position="left">
                                <ActionIcon
                                  variant="subtle"
                                  color="red"
                                  onClick={() => {
                                    handleOpenDeleteStep(step.id);
                                  }}
                                  size="lg"
                                >
                                  <IconTrash size={20} stroke={1.5} />
                                </ActionIcon>
                              </Tooltip>
                            </Group>
                          }
                        >
                          {/* Body Content */}
                          <Box mt="md">
                            <div
                              dangerouslySetInnerHTML={{
                                __html: step.description,
                              }}
                            />
                          </Box>

                          {/* Media Section */}
                          <Box mt="lg">
                            <PhotosCarousel
                              photos={step.photos}
                              initialSlide={0}
                              slidesToScroll={
                                (step.photos?.length ?? 0) > 1 ? 3 : 1
                              }
                            />
                          </Box>

                          {/* Metadata/Assets Section */}
                          <Stack gap="xs" mt="xl" p="sm">
                            <Text size="sm" fw={700} c="dimmed" tt="uppercase">
                              Items used in this step
                            </Text>
                            <Group gap="sm">
                              <IconLink
                                size={14}
                                color="var(--mantine-color-dimmed)"
                              />
                              {step.items.map((item) => (
                                <Anchor
                                  size="sm"
                                  fw={500}
                                  style={{
                                    color: "var(--component-color-primary)",
                                  }}
                                  onClick={() =>
                                    navigate(`/admin/listings/${item.id}`, {
                                      state: {
                                        from: "postDetails",
                                        id_post: postDetails?.id,
                                      },
                                    })
                                  }
                                >
                                  {item.title}
                                </Anchor>
                              ))}
                            </Group>
                          </Stack>
                        </Timeline.Item>
                      ))}
                    </Timeline>
                  )}
                </>
              )}
            </Stack>
            {postDetails?.photos &&
              postDetails.photos.length > 0 &&
              postDetails?.category !== "project" && (
                <>
                  <Divider my="xl" />
                  <Group gap="sm">
                    <IconPhoto color="var(--mantine-color-blue-6)" size={32} />
                    <Title order={3}>Photos</Title>
                  </Group>
                  <div style={{ marginTop: "16px" }}>
                    <PhotosCarousel
                      photos={postDetails.photos}
                      initialSlide={0}
                    />
                  </div>
                </>
              )}

            <Divider my="xl" />

            {/* COMMENTS */}
            <Stack gap="md" maw={800} mx="auto" p="md">
              <Group justify="space-between">
                <Text size="xl" fw={800}>
                  Comments • {comments?.total_comments}
                </Text>
              </Group>

              {comments?.total_comments === 0 ? (
                <Text>No comments yet</Text>
              ) : (
                comments?.comments.map((comment) => (
                  <Stack gap="sm">
                    <Paper
                      withBorder
                      p="md"
                      radius="md"
                      shadow="xs"
                      variant="primary"
                    >
                      <Group align="flex-start" wrap="nowrap">
                        <Avatar
                          src={
                            comment.id_account != 0
                              ? `${import.meta.env.VITE_API_BASE_URL}/${comment.user_avatar}`
                              : null
                          }
                          alt={
                            comment.id_account != 0
                              ? comment.user_name
                              : "Anonymous"
                          }
                          radius="xl"
                          size="lg"
                        />

                        <Stack gap="xs" style={{ flex: 1 }}>
                          <Group justify="space-between">
                            <Box>
                              <Text size="sm" fw={700}>
                                {comment.id_account != 0
                                  ? comment.user_name
                                  : "Anonymous"}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {dayjs(comment.created_at).format("DD/MM/YYYY")}{" "}
                                • {dayjs(comment.created_at).format("HH:mm A")}
                              </Text>
                            </Box>
                          </Group>

                          <Text size="sm">{comment.content}</Text>
                        </Stack>

                        <Divider orientation="vertical" />

                        {/* Admin Stats & Actions Column */}
                        <Stack align="center" gap="sm">
                          <Tooltip label="Delete Comment" position="left">
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              onClick={() =>
                                handleOpenDeleteComment(comment.id)
                              }
                              size="lg"
                            >
                              <IconTrash size={20} stroke={1.5} />
                            </ActionIcon>
                          </Tooltip>

                          <Stack gap={2} align="center">
                            <IconHeartFilled
                              size={18}
                              color="var(--mantine-color-red-6)"
                            />
                            <Text size="xs" fw={700} c="dimmed">
                              {comment.like_count}
                            </Text>
                          </Stack>
                        </Stack>
                      </Group>
                    </Paper>
                  </Stack>
                ))
              )}
            </Stack>
            {comments && comments.total_comments > 0 && (
              <PaginationFooter
                activePage={activePage}
                setPage={setPage}
                total_records={comments.total_comments}
                last_page={comments.last_page}
                limit={limit}
                unit="comments"
              />
            )}
          </Grid.Col>

          {/* RIGHT SECTION */}
          {/* TODO: show ads status + options to prolong, revoke */}
          <Grid.Col
            span={{ base: 12, md: 4 }}
            style={{ position: "sticky", top: "5px" }}
          >
            <Card withBorder shadow="sm" radius="md" padding="lg">
              {/* Header Section: Date & Time */}
              <Card.Section withBorder inheritPadding py="xs">
                <Group justify="space-between">
                  <Group gap="xs">
                    <IconUser size={18} stroke={1.5} />
                    <Text fw={600} size="sm">
                      Written by{" "}
                      <Anchor
                        onClick={() =>
                          navigate(`/admin/users/${postDetails?.creator_id}`, {
                            state: {
                              from: "postDetails",
                              id_post: postDetails?.id,
                            },
                          })
                        }
                        style={{ cursor: "pointer" }}
                        c="var(--component-color-primary)"
                      >
                        {postDetails?.creator}
                      </Anchor>
                    </Text>
                  </Group>
                </Group>
              </Card.Section>

              {/* Body Content: Stats Grid */}
              <Box mt="md">
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb="xs">
                  Engagement Performance
                </Text>

                <SimpleGrid cols={2} spacing="md">
                  <CardStatsItem
                    icon={<IconEye size={20} />}
                    label="Views"
                    value={postDetails?.view_count}
                    color="blue"
                  />
                  <CardStatsItem
                    icon={<IconHeart size={20} />}
                    label="Likes"
                    value={postDetails?.like_count}
                    color="red"
                  />
                  <CardStatsItem
                    icon={<IconBookmark size={20} />}
                    label="Saves"
                    value={postDetails?.save_count}
                    color="yellow"
                  />
                  <CardStatsItem
                    icon={<IconMessageCircle size={20} />}
                    label="Comments"
                    value={postDetails?.comment_count}
                    color="teal"
                  />
                </SimpleGrid>
              </Box>

              {/* Footer Actions */}
              <Group mt="xl" grow>
                <Button variant="edit" onClick={handleOpenEdit}>
                  Edit post
                </Button>
                <Button variant="delete" onClick={openDelete}>
                  Delete
                </Button>
              </Group>
              {postDetails?.ads_id ? (
                <Button variant="edit" mt="md">
                  Edit sponsored status
                </Button>
              ) : postDetails?.category === "project" &&
                !postDetails?.ads_id ? (
                <Button variant="primary" mt="md" onClick={openAddSponsor}>
                  Add sponsored status
                </Button>
              ) : null}
              <Modal
                title="Edit event"
                opened={openedEdit}
                onClose={closeEdit}
                centered
                size="xl"
              >
                <Stack>
                  <TextInput
                    data-autofocus
                    withAsterisk
                    label="Title"
                    value={titleEdit}
                    onChange={(e) => {
                      setTitleEdit(e.target.value);
                    }}
                    error={errorTitle}
                    onBlur={() => validateTitleEdit()}
                    disabled={updatePostMutate.isPending}
                    required
                  />
                  <Select
                    withAsterisk
                    clearable
                    label="Category"
                    value={categoryEdit}
                    error={errorCategory}
                    onBlur={() => validateCategoryEdit()}
                    data={[
                      { value: "tutorial", label: "Tutorial" },
                      { value: "project", label: "Project" },
                      { value: "tips", label: "Tips" },
                      { value: "news", label: "News" },
                      { value: "case_study", label: "Case Study" },
                      { value: "other", label: "Other" },
                    ]}
                    onChange={(value) => {
                      setCategoryEdit(value as string);
                    }}
                  />
                  <TextEditor
                    label="Post's description"
                    value={descriptionEdit}
                    onChange={(value) => {
                      setDescriptionEdit(value);
                    }}
                    error={errorDescription ?? ""}
                  />
                  <ImageDropzone
                    loading={updatePostMutate.isPending}
                    files={fileEdit}
                    setFiles={setFileEdit}
                  />
                </Stack>
                <Group mt="lg" justify="center">
                  <Button onClick={handleCloseEdit} variant="grey">
                    Cancel
                  </Button>
                  <Button
                    onClick={(e: React.FormEvent) => {
                      handleEdit(e);
                    }}
                    variant="primary"
                    loading={updatePostMutate.isPending || isLoadingPostDetails}
                  >
                    Confirm
                  </Button>
                </Group>
              </Modal>

              <Modal
                title="Delete post"
                opened={openedDelete}
                onClose={closeDelete}
                centered
                size="md"
              >
                <Stack>
                  <Text>Are you sure you want to delete this post?</Text>
                </Stack>
                <Group mt="lg" justify="center">
                  <Button onClick={closeDelete} variant="grey">
                    Cancel
                  </Button>
                  <Button
                    onClick={(e: React.FormEvent) => {
                      handleDelete(e);
                    }}
                    variant="delete"
                    loading={deletePostMutate.isPending || isLoadingPostDetails}
                  >
                    Confirm
                  </Button>
                </Group>
              </Modal>

              <Modal
                title="Delete comment"
                opened={openedDeleteComment}
                onClose={closeDeleteComment}
                centered
                size="md"
              >
                <Stack>
                  <Text>Are you sure you want to delete this comment?</Text>
                </Stack>
                <Group mt="lg" justify="center">
                  <Button onClick={closeDeleteComment} variant="grey">
                    Cancel
                  </Button>
                  <Button
                    onClick={(e: React.FormEvent) => {
                      handleDeleteComment(e);
                    }}
                    variant="delete"
                    loading={deleteComment.isPending}
                  >
                    Confirm
                  </Button>
                </Group>
              </Modal>

              {/* Add sponsor status modal */}
              <Modal
                title="Add sponsor status"
                opened={openedAddSponsor}
                onClose={closeAddSponsor}
                centered
                size="lg"
              >
                <Group justify="space-between" gap="md" grow>
                  <DatePickerInput
                    label="Start date"
                    withAsterisk
                    placeholder="Pick date and time"
                    value={startDateNewAds}
                    onChange={setStartDateNewAds}
                    onBlur={() => validateStartDateNewAds()}
                    error={errorStartDateNewAds}
                  />
                  <NumberInput
                    label="Duration (months)"
                    min={1}
                    withAsterisk
                    value={durationNewAds}
                    onChange={setDurationNewAds}
                    onBlur={() => validatedurationNewAds()}
                    error={errordurationNewAds}
                  />
                </Group>
                <Group mt="lg" justify="center">
                  <Button onClick={closeAddSponsor} variant="grey">
                    Cancel
                  </Button>
                  <Button
                    onClick={(e: React.FormEvent) => {
                      handleAddSponsor(e);
                    }}
                    // loading={addSponsor.isPending}
                    variant="primary"
                  >
                    Confirm
                  </Button>
                </Group>
              </Modal>
            </Card>
          </Grid.Col>
        </Grid>
      </Container>

      <Modal
        title="Delete project step"
        opened={openedDeleteStep}
        onClose={closeDeleteStep}
        centered
        size="md"
      >
        <Stack>
          <Text>Are you sure you want to delete this project step?</Text>
        </Stack>
        <Group mt="lg" justify="center">
          <Button onClick={closeDeleteStep} variant="grey">
            Cancel
          </Button>
          <Button
            onClick={(e: React.FormEvent) => {
              handleDeleteStep(e);
            }}
            variant="delete"
            loading={deleteStep.isPending}
          >
            Confirm
          </Button>
        </Group>
      </Modal>
    </Container>
  );
};
