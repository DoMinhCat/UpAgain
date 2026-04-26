import {
  Container,
  Title,
  Text,
  Stack,
  SimpleGrid,
  Group,
  Anchor,
  useComputedColorScheme,
  Box,
  Paper,
  Button,
  Center,
} from "@mantine/core";
import { IconCalendar, IconChevronRight, IconCalendarOff } from "@tabler/icons-react";
import { useTranslation, Trans } from "react-i18next";
import { EventCard } from "../../../components/event/EventCard";

import { HeroBanner } from "../../../components/hero/HeroBanner";
import { useNavigate } from "react-router-dom";
import MyBreadcrumbs from "../../../components/nav/MyBreadcrumbs";
import { PATHS } from "../../../routes/paths";
import { useAuth } from "../../../context/AuthContext";
import { useGetAllEvents } from "../../../hooks/eventHooks";
import FullScreenLoader from "../../../components/common/FullScreenLoader";
import type { AppEvent } from "../../../api/interfaces/event";

export default function EventPage() {
  const { user } = useAuth();
  const { t } = useTranslation("events");
  const theme = useComputedColorScheme("light");
  const navigate = useNavigate();

  // Placeholder data for drafting layout
  const mockEvent = {
    title: "Eco-Design Workshop",
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
  // GET EVENTS BY CATE
  const LIMIT = 4;

  // workshop
  const { data: workshops, isLoading: isLoadingWorkshop } = useGetAllEvents(
    -1,
    LIMIT,
    undefined,
    "approved",
    "most_recent_creation",
    "workshop",
    undefined,
    false,
    true,
  );
  // conference
  const { data: conferences, isLoading: isLoadingConference } = useGetAllEvents(
    -1,
    LIMIT,
    undefined,
    "approved",
    "most_recent_creation",
    "conference",
    undefined,
    false,
    true,
  );
  // meetup
  const { data: meetups, isLoading: isLoadingMeetup } = useGetAllEvents(
    -1,
    LIMIT,
    undefined,
    "approved",
    "most_recent_creation",
    "meetups",
    undefined,
    false,
    true,
  );
  // exposition
  const { data: expositions, isLoading: isLoadingExposition } = useGetAllEvents(
    -1,
    LIMIT,
    undefined,
    "approved",
    "most_recent_creation",
    "exposition",
    undefined,
    false,
    true,
  );
  // other
  const { data: others, isLoading: isLoadingOther } = useGetAllEvents(
    -1,
    LIMIT,
    undefined,
    "approved",
    "most_recent_creation",
    "other",
    undefined,
    false,
    true,
  );
  const eventsByCategory = [
    { name: "workshop", items: workshops },
    { name: "conference", items: conferences },
    { name: "meetup", items: meetups },
    { name: "exposition", items: expositions },
    { name: "other", items: others },
  ];

  if (
    isLoadingWorkshop ||
    isLoadingConference ||
    isLoadingMeetup ||
    isLoadingExposition ||
    isLoadingOther
  ) {
    return <FullScreenLoader />;
  }

  return (
    <Stack gap={0} mb="xl">
      {/* 1. HERO SECTION */}
      <HeroBanner
        src={`/banners/event-banner1-${theme === "light" ? "light" : "dark"}.png`}
        height="70vh"
        overlayOpacity={0.4}
      >
        <Stack justify="center" align="center" gap="md">
          <Title order={1} size={52} c="white" ta="center" fw={900}>
            {t("hero.title")}
          </Title>
          <Text c="white" size="xl" ta="center" maw={600} opacity={0.9}>
            {t("hero.subtitle")}
          </Text>
        </Stack>
      </HeroBanner>

      <Container size="xl" py={40} w="100%" mt="md">
        <Group justify="space-between" align="center" mb="lg">
          <MyBreadcrumbs
            mb="lg"
            breadcrumbs={[
              {
                title: t("home:title", { defaultValue: "Home" }),
                href: PATHS.HOME,
              },
              { title: t("events", { defaultValue: "Events" }), href: "#" },
            ]}
          />
          {user?.role !== "admin" && (
            <Button
              className="button"
              data-variant="primary"
              onClick={() =>
                navigate(PATHS.EVENTS.PLANNING, {
                  state: { from: "eventIndex" },
                })
              }
              rightSection={<IconCalendar size={16} />}
            >
              {t("my_events.title")}
            </Button>
          )}
        </Group>

        <Stack gap={60}>
          {/* 2. CATEGORY SECTIONS */}
          {eventsByCategory.map(({ name, items }) => (
            <Stack key={name} gap="xl">
              <Group justify="space-between" align="center">
                <Title order={2} style={{ textTransform: "capitalize" }}>
                  {t(`categories.${name}_plural`)}
                </Title>
                <Anchor
                  component="button"
                  size="sm"
                  fw={700}
                  c="var(--upagain-neutral-green)"
                  onClick={() => navigate(`/events/${name}s`)}
                >
                  <Group gap={4}>
                    {t("categories.see_all", {
                      category: t(`categories.${name}_plural`),
                    })}
                    <IconChevronRight size={14} />
                  </Group>
                </Anchor>
              </Group>

              <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
                {items?.events && items?.events.length > 0 ? (
                  items?.events?.map((event: AppEvent) => (
                    <EventCard
                      onclick={() => navigate(`/events/${name}s/${event.id}`)}
                      key={`${event.id}`}
                      title={event.title}
                      image={event.images?.[0] || ""}
                      description={event.description}
                      authorName={event.employee_name || "Unknown organizer"}
                      authorAvatar={event?.employee_avatar || ""}
                      createdAt={event.created_at}
                      eventDate={event.start_at}
                      price={event.price}
                      city={event.city}
                      registeredCount={event.registered}
                      category={name}
                    />
                  ))
                ) : (
                  <Center h={200} w="100%" style={{ gridColumn: "1 / -1" }}>
                    <Stack align="center" gap="xs">
                      <IconCalendarOff
                        size={40}
                        stroke={1.5}
                        color="var(--mantine-color-dimmed)"
                        style={{ opacity: 0.6 }}
                      />
                      <Text c="dimmed" fw={500} size="sm" ta="center">
                        {t("no_event", {
                          event_type:
                            t(`categories.${name}_plural`)
                              .charAt(0)
                              .toLowerCase() +
                            t(`categories.${name}_plural`).slice(1),
                        })}
                      </Text>
                    </Stack>
                  </Center>
                )}
              </SimpleGrid>
            </Stack>
          ))}
          {/* 5th SECTION: How it works */}
          <Paper
            radius="xl"
            p={60}
            pos="relative"
            my="xl"
            variant="primary"
            style={{
              overflow: "hidden",
              backgroundImage: `url('/event_how_it_works_doodle_bg_1776815718114.png')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              border: "none",
            }}
          >
            <Stack gap={50} align="center" pos="relative" style={{ zIndex: 2 }}>
              <Stack gap={10} align="center">
                <Title order={2} size={48} fw={900} ta="center">
                  {t("how_it_works.title")}
                </Title>
                <Text size="lg" fw={500} ta="center" maw={600}>
                  {t("how_it_works.subtitle")}
                </Text>
              </Stack>

              <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing={40}>
                <Stack align="center" gap="md">
                  <Box
                    className="paper"
                    data-variant="primary"
                    w={60}
                    h={60}
                    style={{
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 24,
                      fontWeight: 900,
                      backgroundColor: "var(--upagain-light-green)",
                      color: "white",
                    }}
                  >
                    1
                  </Box>
                  <Title order={4} ta="center">
                    {t("how_it_works.step1_title")}
                  </Title>
                  <Text size="sm" ta="center" c="dimmed" fw={500}>
                    {t("how_it_works.step1_desc")}
                  </Text>
                </Stack>

                <Stack align="center" gap="md">
                  <Box
                    className="paper"
                    data-variant="primary"
                    w={60}
                    h={60}
                    style={{
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 24,
                      fontWeight: 900,
                      backgroundColor: "var(--upagain-neutral-green)",
                      color: "white",
                    }}
                  >
                    2
                  </Box>
                  <Title order={4} ta="center">
                    {t("how_it_works.step2_title")}
                  </Title>
                  <Text size="sm" ta="center" c="dimmed" fw={500}>
                    {t("how_it_works.step2_desc")}
                  </Text>
                </Stack>

                <Stack align="center" gap="md">
                  <Box
                    className="paper"
                    data-variant="primary"
                    w={60}
                    h={60}
                    style={{
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 24,
                      fontWeight: 900,
                      backgroundColor: "var(--upagain-dark-green)",
                      color: "white",
                    }}
                  >
                    3
                  </Box>
                  <Title order={4} ta="center">
                    {t("how_it_works.step3_title")}
                  </Title>
                  <Text size="sm" ta="center" c="dimmed" fw={500}>
                    <Trans
                      i18nKey="how_it_works.step3_desc"
                      ns="events"
                      components={{
                        1: (
                          <Anchor
                            href="#"
                            fw={700}
                            c="var(--upagain-neutral-green)"
                          />
                        ),
                      }}
                    />
                  </Text>
                </Stack>

                <Stack align="center" gap="md">
                  <Box
                    className="paper"
                    data-variant="primary"
                    w={60}
                    h={60}
                    style={{
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 24,
                      fontWeight: 900,
                      backgroundColor: "var(--upagain-yellow)",
                      color: "white",
                    }}
                  >
                    4
                  </Box>
                  <Title order={4} ta="center">
                    {t("how_it_works.step4_title")}
                  </Title>
                  <Text size="sm" ta="center" c="dimmed" fw={500}>
                    {t("how_it_works.step4_desc")}
                  </Text>
                </Stack>
              </SimpleGrid>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Stack>
  );
}
