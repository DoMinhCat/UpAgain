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
  Divider,
  Select,
  Card,
  SimpleGrid,
  Image,
} from "@mantine/core";
import { Carousel } from "@mantine/carousel";
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
} from "@tabler/icons-react";
import { TextEditor } from "../../../components/TextEditor";
import ImageDropzone from "../../../components/ImageDropzone";
import { useDeletePost, useGetPostDetails } from "../../../hooks/postHooks";
import dayjs from "dayjs";
import { useParams } from "react-router-dom";
import FullScreenLoader from "../../../components/FullScreenLoader";
import { CardStatsItem } from "../../../components/admin/CardStatsItem";
import { showSuccessNotification } from "../../../components/NotificationToast";

export const AdminPostDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const origin = location.state || {};

  // POST DETAILS
  const params = useParams();
  const postId: number = params.id ? parseInt(params.id) : 0;
  const isValidId = !isNaN(postId) && postId > 0;

  const [openedCarousel, { open: openCarousel, close: closeCarousel }] =
    useDisclosure(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const { data: postDetails, isLoading: isLoadingPostDetails } =
    useGetPostDetails(postId, isValidId);

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
    if (!descriptionEdit || descriptionEdit.trim() === "") {
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
      const files = postDetails.photos?.map((path, index) => {
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
      fileEdit.forEach((file) => {
        formData.append("photos", file);
      });
      // updatePostMutate.mutate(formData, {
      //   onSuccess: () => {
      //     showSuccessNotification(
      //       "Post updated",
      //       "The post has been updated successfully.",
      //     );
      //     closeEdit();
      //   },
      // });
    }
  };

  // DELETE
  const deletePostMutate = useDeletePost();
  const [openedDelete, { open: openDelete, close: closeDelete }] =
    useDisclosure(false);

  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (postDetails) {
      deletePostMutate.mutate(postDetails.id, {
        onSuccess: () => {
          showSuccessNotification(
            "Post deleted",
            "The post has been deleted successfully.",
          );
          closeDelete();
          navigate("/admin/posts");
        },
      });
    }
  };

  if (isLoadingPostDetails) {
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
            : []),
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
            </Stack>
            {postDetails?.photos && postDetails.photos.length > 0 && (
              <>
                <Divider my="xl" />
                <Group gap="sm">
                  <IconPhoto color="var(--mantine-color-blue-6)" size={32} />
                  <Title order={3}>Photos</Title>
                </Group>
                <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} mt="md">
                  {postDetails.photos.map((path, index) => (
                    <Image
                      key={index}
                      src={`${import.meta.env.VITE_API_BASE_URL}/${path}`}
                      radius="md"
                      alt={`Post photo ${index + 1}`}
                      fallbackSrc="https://placehold.co/600x400?text=Image+not+found"
                      style={{ cursor: "pointer" }}
                      // onClick={() => handleImageClick(index)}
                    />
                  ))}
                </SimpleGrid>

                <Modal
                  opened={openedCarousel}
                  onClose={closeCarousel}
                  size="xl"
                  centered
                  title="Event's gallery"
                  styles={{
                    root: {
                      zIndex: 1000,
                    },
                    body: {
                      padding: "xs",
                    },
                  }}
                >
                  <Carousel
                    initialSlide={activeSlide}
                    withIndicators
                    height={500}
                    slideSize="100%"
                    emblaOptions={{
                      loop: true,
                      align: "center",
                      slidesToScroll: 1,
                    }}
                  >
                    {postDetails.photos.map((path, index) => (
                      <Carousel.Slide key={index}>
                        <Image
                          src={`${import.meta.env.VITE_API_BASE_URL}/${path}`}
                          h={500}
                          fit="contain"
                          radius={0}
                          alt={`Post photo ${index + 1}`}
                          fallbackSrc="https://placehold.co/600x400?text=Image+not+found"
                        />
                      </Carousel.Slide>
                    ))}
                  </Carousel>
                </Modal>
              </>
            )}
          </Grid.Col>
          {/* RIGHT SECTION */}
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
                      Written by {postDetails?.creator}
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
                    // disabled={updateEvent.isPending}
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
                    // loading={updateEvent.isPending}
                    files={fileEdit}
                    setFiles={setFileEdit}
                  />
                </Stack>
                <Group mt="lg" justify="center">
                  <Button onClick={handleCloseEdit} variant="grey">
                    Cancel
                  </Button>
                  <Button
                    // onClick={(e: React.FormEvent) => {
                    //   handleEdit(e);
                    // }}
                    variant="primary"
                    // loading={updateEvent.isPending || isLoadingpostDetails}
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
                    // loading={deletePost.isPending || isLoadingPostDetails}
                  >
                    Confirm
                  </Button>
                </Group>
              </Modal>
            </Card>
          </Grid.Col>
        </Grid>
      </Container>
    </Container>
  );
};
