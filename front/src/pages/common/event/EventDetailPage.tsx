import {
  Container,
  Grid,
  Title,
  Text,
  Stack,
  Group,
  Badge,
  Avatar,
  Paper,
  Box,
  Button,
  Progress,
  Divider,
  SimpleGrid,
} from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import { useState } from "react";
import {
  IconCalendar,
  IconMapPin,
  IconClock,
  IconUsers,
  IconChevronRight,
  IconShieldCheck,
  IconClockCheck,
  IconEdit,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import MyBreadcrumbs from "../../../components/nav/MyBreadcrumbs";
import { PATHS } from "../../../routes/paths";
import { useNavigate, useParams } from "react-router-dom";
import { EventCard } from "../../../components/event/EventCard";
import { PhotosCarousel } from "../../../components/photo/PhotosCarousel";
import { useAuth } from "../../../context/AuthContext";
import { EditEventModal } from "../../../components/event/EditEventModal";
import { EventAttendeesModal } from "../../../components/event/EventAttendeesModal";
import { CancelEventModal } from "../../../components/event/CancelEventModal";
import { useDisclosure } from "@mantine/hooks";

export default function EventDetailPage() {
  const { user } = useAuth();
  const role = user?.role;
  const isUser = role === "user";
  const isPro = role === "pro";
  const isEmployee = role === "employee";
  const isAdmin = role === "admin";
  const { idEventStr } = useParams<{ idEventStr: string }>();
  const idEvent = parseInt(idEventStr || "0");
  // const isValidId = !isNaN(idEvent) && idEvent > 0;

  const navigate = useNavigate();

  // PHOTO CAROUSEL MODAL
  const [lightboxOpened, setLightboxOpened] = useState(false);
  const [lightboxSlide, setLightboxSlide] = useState(0);

  // Edit EVENT MODAL
  const [openedEdit, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);

  // EVENT ATTENDEES MODAL
  const [openedAttendees, { open: openAttendees, close: closeAttendees }] =
    useDisclosure(false);

  // CANCEL EVENT MODAL
  const [openedCancel, { open: openCancel, close: closeCancel }] =
    useDisclosure(false);

  // Mock data for drafting
  const mockRelevantEvent = {
    title: "Eco-Design Workshop",
    category: "workshop",
    description: "Learn how to upcycle your old furniture into modern pieces.",
    authorName: "Julian Thorne",
    authorAvatar: "",
    createdAt: new Date().toISOString(),
    eventDate: new Date().toISOString(),
    image:
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=2070&auto=format&fit=crop",
    price: 15,
    city: "Paris",
    postalCode: "75001",
    registeredCount: 12,
  };

  const mockEvent = {
    title: "Artisanal Woodworking Workshop",
    category: "workshop",
    description: `
      <h2>Join us for a hands-on experience!</h2>
      <p>Learn the secrets of traditional woodworking with our expert artisans. In this 4-hour session, you will:</p>
      <ul>
        <li>Understand different types of wood and their properties</li>
        <li>Master basic hand tool techniques</li>
        <li>Create your own custom small furniture piece to take home</li>
      </ul>
      <p>No prior experience required. All materials and safety equipment will be provided.</p>
    `,
    price: 45,
    capacity: 20,
    registered: 12,
    location: {
      street: "123 Eco Avenue",
      city: "Paris",
      zip: "75011",
    },
    organizers: [
      { name: "Julian Thorne", avatar: "" },
      { name: "Marie Curie", avatar: "" },
      { name: "Bob Builder", avatar: "" },
      { name: "Alice Wonderland", avatar: "" },
    ],
    photos: [
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1540575861501-7ad058ca3c98?q=80&w=2070&auto=format&fit=crop",
    ],
    createdAt: new Date().toISOString(),
    eventDate: new Date().toISOString(),
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    attendees: [
      { id: 1, username: "Alice Johnson" },
      {
        id: 2,
        username: "Bob Smith",
        avatar:
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
      { id: 3, username: "Charlie Davis" },
      {
        id: 4,
        username: "Diana Prince",
        avatar:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
      { id: 5, username: "Eve Martinez" },
      {
        id: 6,
        username: "Frank Miller",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
    ],
  };

  // if (isLoading) {
  //   return <FullScreenLoader />;
  // }
  return (
    <>
      <Stack gap={0} mb={120}>
        {/* 1. HERO SECTION (Carousel Hybrid) */}
        <Box pos="relative">
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
            {mockEvent.photos.map((url, index) => (
              <Carousel.Slide key={index}>
                <Box
                  h="100%"
                  style={{
                    backgroundImage: `url(${url})`,
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
                        "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%)",
                      pointerEvents: "none",
                    }}
                  />
                </Box>
              </Carousel.Slide>
            ))}
          </Carousel>

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
                  size="lg"
                  variant="filled"
                  color="var(--upagain-neutral-green)"
                >
                  {mockEvent.category.toUpperCase()}
                </Badge>
              </Group>
              <Title order={1} size={48} c="white" fw={900}>
                {mockEvent.title}
              </Title>
            </Stack>
          </Container>
        </Box>

        {/* MAIN CONTENT AREA */}
        <Container size="xl" pb={40} pt={24} w="100%">
          <Stack gap="lg">
            <MyBreadcrumbs
              mb="xl"
              mt="md"
              breadcrumbs={[
                { title: "Home", href: PATHS.HOME },
                { title: "Events", href: "/events" },
                {
                  title:
                    mockEvent.category.charAt(0).toUpperCase() +
                    mockEvent.category.slice(1) +
                    "s",
                  href: `/events/${mockEvent.category}s`,
                },
                { title: mockEvent.title, href: "#" },
              ]}
            />
            <Grid gap={40}>
              {/* LEFT COLUMN: Main Info */}
              <Grid.Col span={{ base: 12, md: 8 }}>
                <Stack gap={40}>
                  {/* 2. METADATA SECTION (Organizer in Paper) */}
                  <Paper variant="primary" p="lg" radius="xl" withBorder>
                    <Group justify="space-between" align="center">
                      <Stack gap={4}>
                        <Text c="dimmed" size="xs" fw={700} tt="uppercase">
                          Organized by
                        </Text>
                        <Group gap="sm">
                          <Avatar.Group>
                            {mockEvent.organizers.slice(0, 3).map((org, i) => (
                              <Avatar
                                key={i}
                                src={org.avatar}
                                name={org.name}
                                color="initials"
                                radius="xl"
                              />
                            ))}
                            {mockEvent.organizers.length > 3 && (
                              <Avatar radius="xl">
                                +{mockEvent.organizers.length - 3}
                              </Avatar>
                            )}
                          </Avatar.Group>
                          {/* <Anchor
                          size="sm"
                          fw={700}
                          onClick={() => navigate("#")}
                          style={{
                            cursor: "pointer",
                          }}
                          c="var(--color-text)"
                        >
                          {mockEvent.organizers.map((o) => o.name).join(", ")}
                        </Anchor> */}
                          <Group gap={4} wrap="wrap">
                            {mockEvent.organizers.map((organizer, index) => (
                              <Group key={organizer.name || index} gap={4}>
                                <Text
                                  className="text"
                                  size="sm"
                                  fw={700}
                                  onClick={() => navigate("#")}
                                  style={{
                                    color: "var(--mantine-color-text)",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease-in-out",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.textDecoration =
                                      "underline";
                                    e.currentTarget.style.color =
                                      "var(--upagain-neutral-green)"; // Added brand touch
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.textDecoration =
                                      "none";
                                    e.currentTarget.style.color =
                                      "var(--mantine-color-text)";
                                  }}
                                >
                                  {organizer.name}
                                </Text>

                                {/* Add a comma if it's not the last organizer */}
                                {index < mockEvent.organizers.length - 1 && (
                                  <Text size="sm" c="dimmed">
                                    ,{" "}
                                  </Text>
                                )}
                              </Group>
                            ))}
                          </Group>
                        </Group>
                      </Stack>
                      <Stack gap={4} align="flex-end">
                        <Text c="dimmed" size="xs" fw={700} tt="uppercase">
                          Published on
                        </Text>
                        <Group gap={6}>
                          <IconClock size={16} color="dimmed" />
                          <Text size="sm" fw={600}>
                            {new Date(mockEvent.createdAt).toLocaleDateString()}
                          </Text>
                        </Group>
                      </Stack>
                    </Group>
                  </Paper>

                  {/* 3. CONTENT SECTION (HTML Rendering) */}
                  <Stack gap="md">
                    <Title order={3}>About this event</Title>
                    <div
                      style={{ lineHeight: 1.6, fontSize: "1.05rem" }}
                      dangerouslySetInnerHTML={{
                        __html: mockEvent.description,
                      }}
                    />
                  </Stack>

                  <Divider />

                  {/* 4. LOCATION SECTION */}
                  <Stack gap="xl">
                    <Stack gap="xs">
                      <Title order={3}>Location</Title>
                      <Group gap={8}>
                        <IconMapPin
                          size={20}
                          color="var(--upagain-neutral-green)"
                        />
                        <Text size="lg" fw={500}>
                          {mockEvent.location.street}, {mockEvent.location.city}{" "}
                          {mockEvent.location.zip}
                        </Text>
                      </Group>
                    </Stack>

                    {/* Google Maps Placeholder */}
                    <Box
                      h={300}
                      bg="var(--mantine-color-gray-1)"
                      style={{
                        borderRadius: "var(--mantine-radius-lg)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px dashed var(--mantine-color-gray-3)",
                      }}
                    >
                      <IconMapPin
                        size={48}
                        color="var(--mantine-color-gray-4)"
                      />
                      <Text c="dimmed" fw={600} mt="sm">
                        Interactive Map Placeholder
                      </Text>
                      <Text size="xs" c="dimmed">
                        Google Maps API will be integrated here
                      </Text>
                    </Box>
                  </Stack>

                  <Divider />

                  {/* 6. EXPLORE RELEVANT EVENTS SECTION */}
                  <Stack gap="xl">
                    <Group justify="space-between" align="center">
                      <Title order={3}>Explore relevant events</Title>
                      <Button
                        variant="subtle"
                        color="var(--upagain-neutral-green)"
                        rightSection={<IconChevronRight size={14} />}
                      >
                        See all {mockEvent.category}s
                      </Button>
                    </Group>
                    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
                      {[1, 2, 3].map((i) => (
                        <EventCard
                          key={i}
                          {...mockRelevantEvent}
                          title={`Relevant Event ${i}`}
                        />
                      ))}
                    </SimpleGrid>
                  </Stack>
                </Stack>
              </Grid.Col>

              {/* 5. FLOATING DETAILS CARD (Right Side) */}
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Box style={{ position: "sticky", top: 100 }}>
                  <Paper
                    variant="primary"
                    shadow="xl"
                    p="xl"
                    radius="lg"
                    withBorder
                  >
                    <Stack gap="lg">
                      {/* Price */}
                      <Group gap="sm">
                        <Title order={2} c="var(--upagain-neutral-green)">
                          {mockEvent.price > 0
                            ? `${mockEvent.price}€`
                            : "Free Entry"}
                        </Title>
                        <Text size="sm" fw={700} tt="uppercase" c="dimmed">
                          / per person
                        </Text>
                      </Group>

                      {/* Dates */}
                      <Stack gap="md">
                        <Group gap="md" wrap="nowrap">
                          <IconCalendar
                            size={24}
                            color="var(--upagain-neutral-green)"
                          />
                          <Stack gap={0}>
                            <Text size="xs" c="dimmed">
                              Start date
                            </Text>
                            <Text size="sm" fw={700}>
                              {new Date(mockEvent.startDate).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "long",
                                  month: "long",
                                  day: "numeric",
                                },
                              )}{" "}
                              -{" "}
                              {new Date(mockEvent.startDate).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </Text>
                          </Stack>
                        </Group>
                        <Group gap="md" wrap="nowrap">
                          <IconClockCheck
                            size={24}
                            color="var(--upagain-neutral-green)"
                          />
                          <Stack gap={0}>
                            <Text size="xs" c="dimmed">
                              End date
                            </Text>
                            <Text size="sm" fw={700}>
                              {new Date(mockEvent.startDate).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "long",
                                  month: "long",
                                  day: "numeric",
                                },
                              )}
                              {" - "}
                              {new Date(mockEvent.startDate).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </Text>
                          </Stack>
                        </Group>
                      </Stack>

                      <Divider />

                      {/* Capacity */}
                      <Stack gap="xs">
                        <Group justify="space-between">
                          <Group gap={6}>
                            <IconUsers size={18} />
                            <Text size="sm" fw={600}>
                              Capacity
                            </Text>
                          </Group>
                          <Text
                            size="sm"
                            fw={700}
                            c="var(--upagain-neutral-green)"
                          >
                            {mockEvent.capacity - mockEvent.registered} spots
                            left
                          </Text>
                        </Group>
                        <Progress
                          value={
                            (mockEvent.registered / mockEvent.capacity) * 100
                          }
                          color="var(--upagain-neutral-green)"
                          size="md"
                          radius="xl"
                        />
                        <Text size="xs" c="dimmed">
                          {mockEvent.capacity - mockEvent.registered} spots left
                        </Text>
                      </Stack>

                      {/* CTA */}
                      {(isUser || isPro) &&
                        //  TODO: not registered to this event &&
                        true && (
                          <Button
                            size="lg"
                            radius="md"
                            variant="cta-reverse"
                            fullWidth
                            color="var(--upagain-neutral-green)"
                            rightSection={<IconChevronRight size={18} />}
                          >
                            Register Now
                          </Button>
                        )}
                      {(isUser || isPro) &&
                        //  TODO: already registered to this event &&
                        false && (
                          <Button
                            size="lg"
                            radius="md"
                            variant="delete"
                            fullWidth
                            color="var(--upagain-neutral-green)"
                            rightSection={<IconX size={18} />}
                            // onClick={() => call cancel registration mutate}
                          >
                            Cancel Registration
                          </Button>
                        )}

                      {(isEmployee || isAdmin) && (
                        <Group gap="sm">
                          <Button
                            radius="md"
                            variant="primary"
                            fullWidth
                            onClick={openAttendees}
                            rightSection={<IconUsers size={18} />}
                          >
                            See Attendees
                          </Button>
                          <Button
                            radius="md"
                            variant="edit"
                            fullWidth
                            onClick={openEdit}
                            rightSection={<IconEdit size={18} />}
                          >
                            Edit Event
                          </Button>
                          <Button
                            radius="md"
                            variant="delete"
                            fullWidth
                            onClick={openCancel}
                            rightSection={<IconX size={18} />}
                          >
                            Cancel Event
                          </Button>
                        </Group>
                      )}

                      {/* Footer */}
                      <Group justify="center" gap={4} c="dimmed">
                        {(isUser || isPro) &&
                          //  TODO: not registered to this event &&
                          true && (
                            <>
                              <IconShieldCheck size={14} />
                              <Text size="xs" fw={500}>
                                Secure payment & instant confirmation
                              </Text>
                            </>
                          )}
                        {(isUser || isPro) &&
                          //  TODO: already registered to this event &&
                          false && (
                            <>
                              <IconCheck size={14} />
                              <Text size="xs" fw={500}>
                                You are already registered to this event
                              </Text>
                            </>
                          )}
                      </Group>
                    </Stack>
                  </Paper>
                </Box>
              </Grid.Col>
            </Grid>
          </Stack>
        </Container>
      </Stack>
      <EditEventModal
        opened={openedEdit}
        onClose={closeEdit}
        id_event={idEvent}
        eventDetails={mockEvent}
      />
      <EventAttendeesModal
        opened={openedAttendees}
        onClose={closeAttendees}
        attendees={mockEvent.attendees}
      />
      <CancelEventModal
        opened={openedCancel}
        onClose={closeCancel}
        onConfirm={() => {
          console.log("Event cancelled");
          closeCancel();
        }}
      />

      <PhotosCarousel
        photos={mockEvent.photos}
        opened={lightboxOpened}
        onClose={() => setLightboxOpened(false)}
        defaultActiveSlide={lightboxSlide}
      />
    </>
  );
}
