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
  Modal,
  Divider,
  Select,
  Card,
  Image,
} from "@mantine/core";
import { useLocation } from "react-router-dom";
import AdminBreadcrumbs from "../../../components/admin/AdminBreadcrumbs";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import {
  IconFileStarFilled,
  IconMessageCircleFilled,
  IconHeartFilled,
  IconEyeFilled,
} from "@tabler/icons-react";
import { TextEditor } from "../../../components/TextEditor";
import ImageDropzone from "../../../components/ImageDropzone";

export const AdminPostDetails = () => {
  const location = useLocation();
  const origin = location.state || {};

  // Edit modal
  const [openedEdit, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);
  const [fileEdit, setFileEdit] = useState<any[]>([]);
  const [titleEdit, setTitleEdit] = useState<string>("");
  const [categoryEdit, setCategoryEdit] = useState<string>("");
  const [descriptionEdit, setDescriptionEdit] = useState<string>("");
  const [errorTitle, setErrorTitle] = useState<string>("");
  const [errorCategory, setErrorCategory] = useState<string>("");
  const [errorDescription, setErrorDescription] = useState<string>("");

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
                  // variant={
                  //   eventDetails?.category === "other"
                  //     ? "gray"
                  //     : eventDetails?.category === "workshop"
                  //       ? "blue"
                  //       : eventDetails?.category === "conference"
                  //         ? "green"
                  //         : eventDetails?.category === "meetups"
                  //           ? "yellow"
                  //           : "red"
                  // }
                >
                  {/* {eventDetails?.category} */}Category
                </Badge>
              </Group>

              <Title order={2} mt="lg" mb="xs">
                {/* {eventDetails?.title} */} Title
              </Title>
              <Text c="dimmed" size="xs" mb="xl">
                Created on{" "}
                {/* {dayjs(eventDetails?.created_at).format("DD/MM/YYYY HH:mm A")} */}
              </Text>
              <div
              // dangerouslySetInnerHTML={{
              //   __html: eventDetails?.description ?? "",
              // }}
              />
            </Stack>
            If there are images
            {/* {eventDetails?.images && eventDetails.images.length > 0 && (
                          <>
                            <Divider my="xl" />
                            <Group gap="sm">
                              <IconPhoto color="var(--mantine-color-blue-6)" size={32} />
                              <Title order={3}>Photos</Title>
                            </Group>
                            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} mt="md">
                              {eventDetails.images.map((path, index) => (
                                <Image
                                  key={index}
                                  src={`${import.meta.env.VITE_API_BASE_URL}/${path}`}
                                  radius="md"
                                  alt={`Event photo ${index + 1}`}
                                  fallbackSrc="https://placehold.co/600x400?text=Image+not+found"
                                  style={{ cursor: "pointer" }}
                                  onClick={() => handleImageClick(index)}
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
                                {eventDetails.images.map((path, index) => (
                                  <Carousel.Slide key={index}>
                                    <Image
                                      src={`${import.meta.env.VITE_API_BASE_URL}/${path}`}
                                      h={500}
                                      fit="contain"
                                      radius={0}
                                      alt={`Event photo ${index + 1}`}
                                      fallbackSrc="https://placehold.co/600x400?text=Image+not+found"
                                    />
                                  </Carousel.Slide>
                                ))}
                              </Carousel>
                            </Modal>
                          </>
                        )} */}
          </Grid.Col>
          {/* RIGHT SECTION */}
          <Grid.Col
            span={{ base: 12, md: 4 }}
            style={{ position: "sticky", top: "5px" }}
          >
            <Card withBorder shadow="sm" radius="md" padding="md">
              {/* Header/Date Section */}
              <Group gap="xs">
                <Text fw={700} size="md">
                  {
                    /* {eventDetails?.start_at
                                ? dayjs(eventDetails?.start_at).format("dddd, MMM DD") +
                                  " · " +
                                  dayjs(eventDetails?.start_at).format("HH:mm") +
                                  (eventDetails?.end_at
                                    ? " - " +
                                      dayjs(eventDetails?.end_at).format("dddd, MMM DD") +
                                      " · " +
                                      dayjs(eventDetails?.end_at).format("HH:mm")
                                    : "") +
                                  ", UTC" +
                                  dayjs(eventDetails?.start_at).format("Z")
                                : "No specified date"} */ "Some text"
                  }
                </Text>
              </Group>

              <Divider my="sm" />

              {/* Body Content */}
              <Stack gap="lg">
                <Group justify="space-between">
                  <Group gap="xs">
                    <IconEyeFilled />
                    <Text
                    // c={!eventDetails?.price ? "green" : ""}
                    // fw={!eventDetails?.price ? 700 : 500}
                    >
                      {
                        /* {eventDetails?.price
                                    ? eventDetails?.price + " €"
                                    : "Free"} */ "Number of views"
                      }
                    </Text>
                  </Group>
                </Group>

                <Group justify="space-between">
                  <Group gap="xs">
                    <IconHeartFilled color="red" />
                    <Text>
                      {
                        /* {eventDetails?.capacity
                                    ? eventDetails?.capacity + " people max"
                                    : "No max capacity specified"} */ "Number of likes"
                      }
                    </Text>
                  </Group>
                </Group>

                <Group justify="space-between" gap="xs">
                  <IconFileStarFilled />
                  <Text>
                    {
                      /* {eventDetails?.street + " · " + eventDetails?.city} */ "Number of saves"
                    }
                  </Text>
                </Group>

                <Group justify="space-between" gap="xs">
                  <IconMessageCircleFilled />
                  <Text>
                    {
                      /* {eventDetails?.street + " · " + eventDetails?.city} */ "Number of comments"
                    }
                  </Text>
                </Group>
                <Group justify="space-between" grow>
                  <Button
                    variant="edit"
                    // onClick={handleOpenEdit}
                  >
                    Edit event
                  </Button>
                  <Button
                  // variant={
                  //   eventDetails?.status === "cancelled" ||
                  //   eventDetails?.status === "pending" ||
                  //   eventDetails?.status === "refused"
                  //     ? "primary"
                  //     : "delete"
                  // }
                  // onClick={openUpdateStatusModal}
                  >
                    {
                      /* {eventDetails?.status === "cancelled"
                                  ? "Reopen event"
                                  : eventDetails?.status === "pending" ||
                                      eventDetails?.status === "refused"
                                    ? "Approve event"
                                    : "Cancel event"} */ "Action"
                    }
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
                      label="Tile"
                      // value={titleEdit}
                      // onChange={(e) => {
                      //   setTitleEdit(e.target.value);
                      // }}
                      // onBlur={() => validateTitle()}
                      // error={errorTitle}
                      // disabled={updateEvent.isPending}
                      required
                    />
                    <TextInput
                      label="Additional location details"
                      // value={locationDetailEdit}
                      // onChange={(e) => {
                      //   setLocationDetailEdit(e.target.value);
                      // }}
                      // disabled={updateEvent.isPending}
                    />
                    <Select
                      withAsterisk
                      clearable
                      label="Category"
                      // value={categoryEdit}
                      // error={errorCategory}
                      // onBlur={() => validateCategory()}
                      data={[
                        { value: "workshop", label: "Workshop" },
                        { value: "conference", label: "Conference" },
                        { value: "meetups", label: "Meetups" },
                        { value: "exposition", label: "Exposition" },
                        { value: "other", label: "Other" },
                      ]}
                      // onChange={(value) => {
                      //   setCategoryEdit(value as string);
                      // }}
                    />
                    <TextEditor
                      label="Event's description"
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
                    <Button
                      // onClick={handleCloseEdit}
                      variant="grey"
                    >
                      Cancel
                    </Button>
                    <Button
                      // onClick={(e: React.FormEvent) => {
                      //   handleEdit(e);
                      // }}
                      variant="primary"
                      // loading={updateEvent.isPending || isLoadingEventDetails}
                    >
                      Confirm
                    </Button>
                  </Group>
                </Modal>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      </Container>
    </Container>
  );
};
