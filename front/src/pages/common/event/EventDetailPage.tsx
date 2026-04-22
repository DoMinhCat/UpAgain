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
  TypographyStylesProvider,
  Divider,
} from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import {
  IconCalendar,
  IconMapPin,
  IconClock,
  IconUsers,
  IconChevronRight,
  IconShieldCheck,
} from "@tabler/icons-react";
import MyBreadcrumbs from "../../../components/nav/MyBreadcrumbs";
import { PATHS } from "../../../routes/paths";
import { useParams } from "react-router-dom";

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();

  // Mock data for drafting
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
    createdAt: new Date().toISOString(),
    startDate: new Date(Date.now() + 86400000 * 7).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 7 + 14400000).toISOString(),
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
  };

  return (
    <Stack gap={0}>
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
              "&[data-active]": { width: 40 },
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
                }}
              >
                <Box
                  pos="absolute"
                  inset={0}
                  style={{
                    background:
                      "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)",
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
            <MyBreadcrumbs
              breadcrumbs={[
                { title: "Home", href: PATHS.HOME },
                { title: "Events", href: "/events" },
                {
                  title: mockEvent.category,
                  href: `/events/${mockEvent.category}`,
                },
                { title: mockEvent.title, href: "#" },
              ]}
            />
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
      <Container size="xl" py={40} w="100%">
        <Grid gutter={40}>
          {/* LEFT COLUMN: Main Info */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap={40}>
              {/* 2. METADATA SECTION */}
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
                          radius="xl"
                        />
                      ))}
                      {mockEvent.organizers.length > 3 && (
                        <Avatar radius="xl">
                          +{mockEvent.organizers.length - 3}
                        </Avatar>
                      )}
                    </Avatar.Group>
                    <Text size="sm" fw={600}>
                      {mockEvent.organizers.map((o) => o.name).join(", ")}
                    </Text>
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

              <Divider />

              {/* 3. CONTENT SECTION (HTML Rendering) */}
              <Stack gap="md">
                <Title order={3}>About this event</Title>
                <TypographyStylesProvider p={0}>
                  <div
                    dangerouslySetInnerHTML={{ __html: mockEvent.description }}
                  />
                </TypographyStylesProvider>
              </Stack>

              <Divider />

              {/* 4. LOCATION SECTION */}
              <Stack gap="xl">
                <Stack gap="xs">
                  <Title order={3}>Location</Title>
                  <Group gap={8}>
                    <IconMapPin size={20} c="var(--upagain-neutral-green)" />
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
                  <IconMapPin size={48} c="var(--mantine-color-gray-4)" />
                  <Text c="dimmed" fw={600} mt="sm">
                    Interactive Map Placeholder
                  </Text>
                  <Text size="xs" c="dimmed">
                    Google Maps API will be integrated here
                  </Text>
                  {/*
                    Implementation logic for Google Maps JS API:
                    1. Install @googlemaps/js-api-loader
                    2. Use the loader to load 'maps' and 'marker' libraries
                    3. Initialize map on a div ref: const map = new google.maps.Map(mapRef, { center, zoom })
                    4. Add marker: new google.maps.Marker({ position, map, title })
                  */}
                </Box>
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
                <Stack gap="xl">
                  {/* Price */}
                  <Stack gap={0}>
                    <Text size="xs" fw={700} tt="uppercase" c="dimmed">
                      Price per person
                    </Text>
                    <Title order={2} c="var(--upagain-neutral-green)">
                      {mockEvent.price > 0
                        ? `${mockEvent.price}€`
                        : "Free Entry"}
                    </Title>
                  </Stack>

                  <Divider />

                  {/* Dates */}
                  <Stack gap="md">
                    <Group gap="md" wrap="nowrap">
                      <IconCalendar
                        size={24}
                        color="var(--upagain-neutral-green)"
                      />
                      <Stack gap={0}>
                        <Text size="sm" fw={700}>
                          {new Date(mockEvent.startDate).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "long",
                              month: "long",
                              day: "numeric",
                            },
                          )}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {new Date(mockEvent.startDate).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}{" "}
                          -{" "}
                          {new Date(mockEvent.endDate).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Text>
                      </Stack>
                    </Group>
                  </Stack>

                  <Divider />

                  {/* Capacity */}
                  <Stack gap="xs">
                    <Group justify="space-between">
                      <Group gap={6}>
                        <IconUsers size={18} color="dimmed" />
                        <Text size="sm" fw={600}>
                          Capacity
                        </Text>
                      </Group>
                      <Text size="sm" fw={700} c="var(--upagain-neutral-green)">
                        {mockEvent.capacity - mockEvent.registered} spots left
                      </Text>
                    </Group>
                    <Progress
                      value={(mockEvent.registered / mockEvent.capacity) * 100}
                      color="var(--upagain-neutral-green)"
                      size="sm"
                      radius="xl"
                    />
                    <Text size="xs" c="dimmed" ta="center">
                      {mockEvent.registered} people registered out of{" "}
                      {mockEvent.capacity}
                    </Text>
                  </Stack>

                  {/* CTA */}
                  <Button
                    size="lg"
                    radius="md"
                    fullWidth
                    color="var(--upagain-neutral-green)"
                    rightSection={<IconChevronRight size={18} />}
                    style={{ height: 54 }}
                  >
                    Register Now
                  </Button>

                  {/* Footer */}
                  <Group justify="center" gap={4} c="dimmed">
                    <IconShieldCheck size={14} />
                    <Text size="xs" fw={500}>
                      Secure payment & instant confirmation
                    </Text>
                  </Group>
                </Stack>
              </Paper>
            </Box>
          </Grid.Col>
        </Grid>
      </Container>
    </Stack>
  );
}
