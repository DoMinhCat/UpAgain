import {
  Container,
  Stack,
  Title,
  Group,
  Text,
  SimpleGrid,
  ActionIcon,
  Divider,
} from "@mantine/core";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import MyBreadcrumbs from "../../../components/nav/MyBreadcrumbs";
import { useTranslation } from "react-i18next";
import { PATHS } from "../../../routes/paths";
import { Schedule } from "@mantine/schedule";
import { EventCard } from "../../../components/event/EventCard";
import { IconChevronRight, IconChevronLeft } from "@tabler/icons-react";
import { useAuth } from "../../../context/AuthContext";
import { NotFoundPage } from "../../error/404";

export default function UpcomingEventsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { state } = useLocation();
  const { t } = useTranslation();

  const baseCatFrom = state?.category ? state.category.slice(0, -1) : null;
  const categoryTitle = t(`events:categories.${baseCatFrom}_plural`);

  // UPCOMING EVENTS
  const [currentUpcomingPage, setCurrentUpcomingPage] = useState(1);
  const itemsPerUpcomingPage = 3;
  const mockEventsList = [1, 2, 3, 4, 5, 6, 7, 8];
  const totalUpcomingPages = Math.ceil(
    mockEventsList.length / itemsPerUpcomingPage,
  );

  const handlePrevious = () => {
    setCurrentUpcomingPage((prev) => Math.max(prev - 1, 1));
  };
  const handleNext = () => {
    setCurrentUpcomingPage((prev) => Math.min(prev + 1, totalUpcomingPages));
  };

  const startIndex = (currentUpcomingPage - 1) * itemsPerUpcomingPage;
  const visibleUpcomingEvents = mockEventsList.slice(
    startIndex,
    startIndex + itemsPerUpcomingPage,
  );

  const mockEvent = {
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
    registeredCount: 24,
  };

  if (!user || (user?.role !== "user" && user.role !== "pro")) {
    return <NotFoundPage />;
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
          </Group>
          {/* 2. UPCOMING EVENT CARDS */}
          <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="xl">
            {visibleUpcomingEvents.map((i) => (
              <EventCard
                orientation="horizontal"
                onclick={() => navigate(`${i}`)}
                key={i}
                {...mockEvent}
                category={mockEvent.category || "other"}
              />
            ))}
          </SimpleGrid>
        </Stack>

        <Divider my="xl" />
        {/* 3. SCHEDULE */}
        <Stack gap="xs">
          <Title order={2} size={36} fw={900}>
            {t("events:my_events.schedule_description")}
          </Title>
          <Schedule layout="responsive" />
        </Stack>
      </Stack>
    </Container>
  );
}
