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
  Badge,
  Box,
  Button,
} from "@mantine/core";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import MyBreadcrumbs from "../../../components/nav/MyBreadcrumbs";
import { useTranslation } from "react-i18next";
import { PATHS } from "../../../routes/paths";
import { Schedule, type ScheduleEventData } from "@mantine/schedule";
import { EventCard } from "../../../components/event/EventCard";
import { CreateEventModal } from "../../../components/event/CreateEventModal";
import {
  IconChevronRight,
  IconChevronLeft,
  IconCalendarOff,
  IconClock,
  IconX,
  IconPlus,
} from "@tabler/icons-react";
import { useAuth } from "../../../context/AuthContext";
import { NotFoundPage } from "../../error/404";
import { useGetMyEvents } from "../../../hooks/eventHooks";
import type { AppEvent } from "../../../api/interfaces/event";
import FullScreenLoader from "../../../components/common/FullScreenLoader";
import { useDisclosure } from "@mantine/hooks";
import { EventListModal } from "../../../components/event/EventListModal";
import dayjs from "dayjs";
import { useHandleVerifyStripeEventRegistration } from "../../../hooks/stripeHooks";

export default function EmployeeEventsPlanning() {
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
  const [openedCreate, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [modalEvents, setModalEvents] = useState<AppEvent[]>([]);

  const handleSlotClick = (dateStr: string) => {
    const date = new Date(dateStr);
    setSelectedDate(date);
    const dayEvents =
      myEvents?.filter((e) => {
        if (e.status !== "approved") return false;
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
    ? myEvents
        .filter((e) => e.status === "approved")
        .map((e: AppEvent) => {
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
    (e: AppEvent) =>
      e.status === "approved" && new Date(e.start_at) > new Date(),
  );
  const totalUpcomingPages = Math.ceil(
    (upcomingEvents?.length || 0) / itemsPerUpcomingPage,
  );

  const handlePrevious = () => {
    setCurrentUpcomingPage((prev) => Math.max(prev - 1, 1));
  };
  // Add hook to handle stripe redirect
  useHandleVerifyStripeEventRegistration();

  const handleNext = () => {
    setCurrentUpcomingPage((prev) => Math.min(prev + 1, totalUpcomingPages));
  };

  const startIndex = (currentUpcomingPage - 1) * itemsPerUpcomingPage;
  const visibleUpcomingEvents = upcomingEvents?.slice(
    startIndex,
    startIndex + itemsPerUpcomingPage,
  );

  // MY PROPOSALS
  const [currentProposalsPage, setCurrentProposalsPage] = useState(1);
  const itemsPerProposalsPage = 3;
  const proposedEvents = myEvents?.filter(
    (e: AppEvent) => e.status === "pending" || e.status === "refused",
  );
  const totalProposalsPages = Math.ceil(
    (proposedEvents?.length || 0) / itemsPerProposalsPage,
  );

  const handleProposalsPrevious = () => {
    setCurrentProposalsPage((prev) => Math.max(prev - 1, 1));
  };

  const handleProposalsNext = () => {
    setCurrentProposalsPage((prev) => Math.min(prev + 1, totalProposalsPages));
  };

  const proposalsStartIndex =
    (currentProposalsPage - 1) * itemsPerProposalsPage;
  const visibleProposedEvents = proposedEvents?.slice(
    proposalsStartIndex,
    proposalsStartIndex + itemsPerProposalsPage,
  );

  if (!user || user.role !== "employee") {
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
              { title: t("events:employee_planning.title"), href: "#" },
            ]}
          />
          <Title order={1} size={42} fw={900}>
            {t("events:employee_planning.title")}
          </Title>
        </Stack>

        {/* 2. UPCOMING EVENT CARDS */}
        <Stack gap="md">
          <Group justify="space-between" align="end">
            <Stack gap={4}>
              <Title order={2} size={28} fw={800}>
                {t("events:employee_planning.upcoming_events_title")}
              </Title>
              <Text c="dimmed" size="sm">
                {t("events:employee_planning.upcoming_events_desc")}
              </Text>
            </Stack>
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
                  fullEvent={e}
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
                <Text fw={700} c="var(--mantine-color-text)" size="lg">
                  {t("events:empty_state.no_events")}
                </Text>
              </Stack>
            </Center>
          )}
        </Stack>

        <Divider my="md" />

        {/* 3. MY PROPOSALS */}
        <Stack gap="md">
          <Group justify="space-between" align="end">
            <Stack gap={4}>
              <Group gap="md" align="center" justify="space-between">
                <Title order={2} size={28} fw={800}>
                  {t("events:employee_planning.my_proposals_title")}
                </Title>
              </Group>
              <Text c="dimmed" size="sm">
                {t("events:employee_planning.my_proposals_desc")}
              </Text>
            </Stack>
            <Stack>
              <Button
                variant="primary"
                onClick={openCreate}
                leftSection={<IconPlus size={14} />}
                radius="md"
              >
                {t("events:employee_planning.propose_event")}
              </Button>
              {totalProposalsPages >= 1 && (
                <Group gap={"sm"}>
                  <ActionIcon
                    size="lg"
                    variant="filled"
                    color="var(--upagain-neutral-green)"
                    radius="xl"
                    aria-label="Previous"
                    onClick={handleProposalsPrevious}
                    disabled={currentProposalsPage === 1}
                  >
                    <IconChevronLeft size={18} stroke={1.5} />
                  </ActionIcon>
                  <Text size="lg" fw={700}>
                    {currentProposalsPage} / {totalProposalsPages}
                  </Text>
                  <ActionIcon
                    size="lg"
                    variant="filled"
                    color="var(--upagain-neutral-green)"
                    radius="xl"
                    aria-label="Next"
                    onClick={handleProposalsNext}
                    disabled={currentProposalsPage === totalProposalsPages}
                  >
                    <IconChevronRight size={18} stroke={1.5} />
                  </ActionIcon>
                </Group>
              )}
            </Stack>
          </Group>

          {visibleProposedEvents && visibleProposedEvents.length > 0 ? (
            <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="xl">
              {visibleProposedEvents?.map((e) => (
                <Box pos="relative" key={e.id}>
                  <EventCard
                    orientation="horizontal"
                    onclick={() =>
                      navigate(
                        `${PATHS.EVENTS.HOME}/${e.category === "meetups" ? e.category : e.category + "s"}/${e.id}`,
                        { state: { from: "upcomingEvents" } },
                      )
                    }
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
                    fullEvent={e}
                  />
                  <Badge
                    pos="absolute"
                    top={12}
                    right={12}
                    color={e.status === "pending" ? "yellow" : "red"}
                    variant="filled"
                    style={{ zIndex: 5, boxShadow: "var(--mantine-shadow-md)" }}
                    leftSection={
                      e.status === "pending" ? (
                        <IconClock size={12} />
                      ) : (
                        <IconX size={12} />
                      )
                    }
                  >
                    {e.status === "pending"
                      ? t("events:employee_planning.status_pending")
                      : t("events:employee_planning.status_refused")}
                  </Badge>
                </Box>
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
                <Text fw={700} c="var(--mantine-color-text)" size="lg">
                  {t("events:employee_planning.no_proposals")}
                </Text>
              </Stack>
            </Center>
          )}
        </Stack>

        <Divider my="xl" />

        {/* 4. SCHEDULE */}
        <Stack gap="xs">
          <Title order={2} size={36} fw={900}>
            {t("events:employee_planning.schedule_title")}
          </Title>
          <Schedule
            layout="responsive"
            defaultView="month"
            events={scheduleEvents}
            onDayClick={(date) => handleSlotClick(date)}
            onAllDaySlotClick={(date) => handleSlotClick(date)} // here
            onTimeSlotClick={(data) => handleSlotClick(data.slotStart)} // here
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
      <CreateEventModal opened={openedCreate} onClose={closeCreate} />
    </Container>
  );
}
