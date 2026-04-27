import {
  Container,
  Stack,
  Title,
  Group,
  Text,
  SimpleGrid,
  ActionIcon,
  Divider,
  Center,
  Button,
} from "@mantine/core";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import MyBreadcrumbs from "../../../components/nav/MyBreadcrumbs";
import { useTranslation } from "react-i18next";
import { PATHS } from "../../../routes/paths";
import { Schedule, type ScheduleEventData } from "@mantine/schedule";
import { EventCard } from "../../../components/event/EventCard";
import {
  IconChevronRight,
  IconChevronLeft,
  IconCalendarOff,
} from "@tabler/icons-react";
import { useAuth } from "../../../context/AuthContext";
import { NotFoundPage } from "../../error/404";
import { useGetMyEvents } from "../../../hooks/eventHooks";
import type { AppEvent } from "../../../api/interfaces/event";
import FullScreenLoader from "../../../components/common/FullScreenLoader";
import { useDisclosure } from "@mantine/hooks";
import { EventListModal } from "../../../components/event/EventListModal";
import dayjs from "dayjs";

export default function UpcomingEventsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { state } = useLocation();
  const { t } = useTranslation();

  const baseCatFrom = state?.category ? state.category.slice(0, -1) : null;
  const categoryTitle = t(`events:categories.${baseCatFrom}_plural`);

  // ALL EVENTS OF ACCOUNT
  const { data: myEvents, isLoading: myEventsLoading } = useGetMyEvents();

  // MODAL STATE
  const [openedModal, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [modalEvents, setModalEvents] = useState<AppEvent[]>([]);

  const handleSlotClick = (dateStr: string) => {
    const date = new Date(dateStr);
    setSelectedDate(date);
    const dayEvents =
      myEvents?.filter((e) => {
        const start = dayjs(e.start_at).startOf("day");
        const end = dayjs(e.end_at).endOf("day");
        const current = dayjs(date);
        return (
          current.isSame(start, "day") ||
          current.isSame(end, "day") ||
          (current.isAfter(start) && current.isBefore(end))
        );
      }) || [];
    setModalEvents(dayEvents);
    openModal();
  };

  const scheduleEvents: ScheduleEventData[] = myEvents
    ? myEvents.map((e: AppEvent) => {
        const isPast = new Date(e.end_at) < new Date();
        return {
          id: String(e.id),
          title: e.title,
          start: e.start_at,
          end: e.end_at,
          variant: "filled",
          style: {
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "0.8rem",
            borderRadius: "4px",
          },
          color: isPast
            ? "gray"
            : e.category === "workshop"
              ? "blue"
              : e.category === "conference"
                ? "var(--upagain-neutral-green)"
                : e.category === "meetups"
                  ? "var(--upagain-yellow)"
                  : "red",
          payload: {
            category: e.category,
          },
        };
      })
    : [];

  // UPCOMING EVENTS
  const [currentUpcomingPage, setCurrentUpcomingPage] = useState(1);
  const itemsPerUpcomingPage = 3;
  const upcomingEvents = myEvents?.filter(
    (e: AppEvent) => new Date(e.start_at) > new Date(),
  );
  const totalUpcomingPages = Math.ceil(
    (upcomingEvents?.length || 0) / itemsPerUpcomingPage,
  );

  const handlePrevious = () => {
    setCurrentUpcomingPage((prev) => Math.max(prev - 1, 1));
  };
  const handleNext = () => {
    setCurrentUpcomingPage((prev) => Math.min(prev + 1, totalUpcomingPages));
  };

  const startIndex = (currentUpcomingPage - 1) * itemsPerUpcomingPage;
  const visibleUpcomingEvents = upcomingEvents?.slice(
    startIndex,
    startIndex + itemsPerUpcomingPage,
  );

  if (!user || (user?.role !== "user" && user.role !== "pro")) {
    return <NotFoundPage />;
  }

  if (myEventsLoading) {
    return <FullScreenLoader />;
  }

  return (
    <Container size="xl" py={40} w="100%" mb="xl">
      <Stack gap="xl">
        {/* 1. HEADER TITLE AND BREADCRUMBS */}
        <Stack gap="xs">
          <MyBreadcrumbs
            breadcrumbs={[
              {
                title: t("home:title", { defaultValue: "Home" }),
                href: PATHS.HOME,
              },
              {
                title: t("events:events", { defaultValue: "Events" }),
                href: PATHS.EVENTS.HOME,
              },
              ...(state?.from === "eventCategory"
                ? [
                    {
                      title: categoryTitle,
                      href: `/events/${baseCatFrom}s`,
                    },
                  ]
                : []),
              { title: t("events:my_events.title"), href: "#" },
            ]}
          />
          <Title order={1} size={42} fw={900}>
            {t("events:my_events.title")}
          </Title>
          <Group justify="space-between" align="end" mb="lg">
            <Text c="dimmed" size="lg" maw={800}>
              {t("events:my_events.description")}
            </Text>
            {totalUpcomingPages >= 1 && (
              <Group gap={"sm"}>
                <ActionIcon
                  size="lg"
                  variant="filled"
                  color="var(--upagain-neutral-green)"
                  radius="xl"
                  aria-label="Previous"
                  onClick={handlePrevious}
                  disabled={currentUpcomingPage === 1}
                >
                  <IconChevronLeft size={18} stroke={1.5} />
                </ActionIcon>
                <Text size="lg" fw={700}>
                  {currentUpcomingPage} / {totalUpcomingPages}
                </Text>
                <ActionIcon
                  size="lg"
                  variant="filled"
                  color="var(--upagain-neutral-green)"
                  radius="xl"
                  aria-label="Next"
                  onClick={handleNext}
                  disabled={currentUpcomingPage === totalUpcomingPages}
                >
                  <IconChevronRight size={18} stroke={1.5} />
                </ActionIcon>
              </Group>
            )}
          </Group>
          {/* 2. UPCOMING EVENT CARDS */}
          {visibleUpcomingEvents && visibleUpcomingEvents.length > 0 ? (
            <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="xl">
              {visibleUpcomingEvents?.map((e) => (
                <EventCard
                  orientation="horizontal"
                  onclick={() =>
                    navigate(
                      `${PATHS.EVENTS.HOME}/${e.category === "meetups" ? e.category : e.category + "s"}/${e.id}`,
                      { state: { from: "upcomingEvents" } },
                    )
                  }
                  key={e.id}
                  category={e.category}
                  title={e.title}
                  description={e.description}
                  authorName={e.employee_name || "Unknown"}
                  authorAvatar={e.employee_avatar || ""}
                  createdAt={e.created_at}
                  eventDate={e.start_at}
                  image={e.images?.[0] || ""}
                  price={e.price}
                  city={e.city}
                  registeredCount={e.registered}
                />
              ))}
            </SimpleGrid>
          ) : (
            <Center my="md" w="100%">
              <Stack align="center" gap="xs" justify="center">
                <IconCalendarOff
                  size={48}
                  stroke={1.2}
                  color="var(--mantine-color-dimmed)"
                  style={{ opacity: 0.5 }}
                />

                <Stack gap={4} align="center">
                  <Text fw={700} c="var(--mantine-color-text)" size="lg">
                    {t("events:empty_state.no_events")}
                  </Text>
                </Stack>

                <Button
                  variant="cta"
                  onClick={() => navigate(PATHS.EVENTS.HOME)}
                  mt="sm"
                >
                  {t("home:user.agenda.explore_workshops")}
                </Button>
              </Stack>
            </Center>
          )}
        </Stack>

        <Divider my="xl" />

        {/* 3. SCHEDULE */}
        <Stack gap="xs">
          <Title order={2} size={36} fw={900}>
            {t("events:my_events.schedule_description")}
          </Title>
          <Schedule
            layout="responsive"
            defaultView="month"
            events={scheduleEvents}
            onDayClick={(date) => handleSlotClick(date)}
            onAllDaySlotClick={(date) => handleSlotClick(date)}
            onTimeSlotClick={(data) => handleSlotClick(data.slotStart)}
            onEventClick={(event) => {
              navigate(
                `${PATHS.EVENTS.HOME}/${event.payload?.category === "meetups" ? event.payload.category : event.payload?.category + "s"}/${event.id}`,
                { state: { from: "upcomingEvents" } },
              );
            }}
          />
        </Stack>
      </Stack>

      <EventListModal
        opened={openedModal}
        onClose={closeModal}
        events={modalEvents}
        dateTitle={
          selectedDate ? dayjs(selectedDate).format("MMMM D, YYYY") : ""
        }
      />
    </Container>
  );
}
