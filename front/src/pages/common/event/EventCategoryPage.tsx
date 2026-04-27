import {
  Container,
  Title,
  Text,
  Stack,
  SimpleGrid,
  Group,
  TextInput,
  Select,
  Paper,
  Box,
  Button,
  Tooltip,
  ActionIcon,
  Center,
} from "@mantine/core";
import { useParams } from "react-router-dom";
import {
  IconSearch,
  IconFilter,
  IconSortDescending,
  IconRefresh,
  IconCalendar,
  IconCalendarOff,
} from "@tabler/icons-react";
import MyBreadcrumbs from "../../../components/nav/MyBreadcrumbs";
import { EventCard } from "../../../components/event/EventCard";
import PaginationFooter from "../../../components/common/PaginationFooter";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { PATHS } from "../../../routes/paths";
import { NotFoundPage } from "../../error/404";
import { useNavigate } from "react-router-dom";
import FullScreenLoader from "../../../components/common/FullScreenLoader";
import { useAuth } from "../../../context/AuthContext";
import { useGetAllEvents } from "../../../hooks/eventHooks";
import { useHandleStripeEventRegistration } from "../../../hooks/stripeHooks";

export default function EventCategoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  useHandleStripeEventRegistration();
  const { category } = useParams<{ category: string }>();
  let event_category = category?.substring(0, category.length - 1);
  if (event_category === "meetup") {
    event_category = "meetups";
  }
  const LIMIT = 12;
  const [page, setPage] = useState<number>(1);
  const [filters, setFilters] = useState<{
    search: string | null;
    city: string | null;
    sort: string | null;
  }>({ search: null, city: null, sort: null });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };
  const handleSearchClick = () => {
    setAppliedFilters(filters);
    setPage(1);
  };
  const handleResetFilters = () => {
    const defaultFilters = {
      search: null,
      city: null,
      sort: null,
    };
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setPage(1);
  };

  const { data: eventsData, isLoading: isLoadingEvents } = useGetAllEvents(
    -1,
    LIMIT,
    appliedFilters.search || "",
    "approved",
    appliedFilters.sort || "",
    event_category,
    appliedFilters.city || "",
    false,
    true,
  );
  const events = eventsData?.events || [];
  const { t } = useTranslation("events");

  if (
    category != "workshops" &&
    category != "conferences" &&
    category != "meetups" &&
    category != "expositions" &&
    category != "others"
  ) {
    return <NotFoundPage />;
  }
  const baseCat = category.slice(0, -1); // remove 's'

  const categoryTitle = t(`categories.${baseCat}_plural`);
  const categoryDescription = t("categories.explore_description", {
    category: t(`categories.${baseCat}`),
  });
  if (isLoadingEvents) {
    return <FullScreenLoader />;
  }
  return (
    <Stack gap={0} mb="xl">
      {/* 1. FILTER BAR */}
      <Box
        style={{
          borderBottom: "1px solid var(--border-color)",
          backgroundColor: "var(--mantine-color-body)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
        py="md"
      >
        <Container size="xl">
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
            {/* SEARCH INPUT */}
            <TextInput
              placeholder={t("categories.search_placeholder")}
              leftSection={
                <IconSearch size={18} color="var(--upagain-neutral-green)" />
              }
              value={filters.search || ""}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearchClick();
                }
              }}
            />

            {/* ACTIONS & FILTERS */}
            <Group justify="flex-end" gap="xs" wrap="nowrap">
              <Select
                placeholder={t("filters.city")}
                leftSection={<IconFilter size={16} />}
                data={["Paris", "Lyon", "Marseille", "Bordeaux", "Toulouse"]}
                value={filters.city}
                onChange={(value) => handleFilterChange("city", value)}
                style={{ width: 140 }}
              />

              <Select
                placeholder={t("filters.sort")}
                leftSection={<IconSortDescending size={16} />}
                data={[
                  {
                    value: "earliest_start_date",
                    label: t("filters.sort_soonest"),
                  },
                  { value: "lowest_price", label: t("filters.sort_lowest") },
                  { value: "highest_price", label: t("filters.sort_highest") },
                  { value: "most_popular", label: t("filters.sort_popular") },
                ]}
                value={filters.sort}
                onChange={(value) => handleFilterChange("sort", value)}
                style={{ width: 140 }}
              />

              <Group gap={8}>
                <Button
                  className="button"
                  data-variant="primary"
                  size="sm"
                  onClick={handleSearchClick}
                >
                  {t("filters.apply")}
                </Button>

                {/* Reset icon button instead of text button to save space */}
                <Tooltip label={t("filters.reset")} position="bottom">
                  <ActionIcon
                    className="actionIcon"
                    data-variant="primary"
                    size="lg"
                    radius="xl"
                    onClick={handleResetFilters}
                  >
                    <IconRefresh size={18} stroke={1.5} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Group>
          </SimpleGrid>
        </Container>
      </Box>

      <Container size="xl" py={40} w="100%">
        <Stack gap="xl">
          {/* 2. HEADER & BREADCRUMBS */}
          <Stack gap="xs">
            <MyBreadcrumbs
              breadcrumbs={[
                {
                  title: t("home:title", { defaultValue: "Home" }),
                  href: PATHS.HOME,
                },
                {
                  title: t("events", { defaultValue: "Events" }),
                  href: "/events",
                },
                { title: categoryTitle, href: "#" },
              ]}
            />
            <Title order={1} size={42} fw={900}>
              {categoryTitle}
            </Title>
            <Group justify="space-between" align="end" mb="lg">
              <Text c="dimmed" size="lg" maw={800}>
                {categoryDescription}
              </Text>
              {user?.role !== "admin" && (
                <Button
                  className="button"
                  data-variant="primary"
                  onClick={() =>
                    navigate(PATHS.EVENTS.PLANNING, {
                      state: { from: "eventCategory", category: category },
                    })
                  }
                  rightSection={<IconCalendar size={16} />}
                >
                  {t("my_events.title")}
                </Button>
              )}
            </Group>
          </Stack>

          {/* 3. BODY: EVENT LIST */}
          <Paper p={0} radius="lg" style={{ background: "transparent" }}>
            {events && events.length > 0 ? (
              <SimpleGrid
                cols={{ base: 1, sm: 2, md: 4 }}
                spacing="xl"
                verticalSpacing="50"
              >
                {events.map((event) => (
                  <EventCard
                    onclick={() => navigate(`${event.id}`)}
                    key={event.id}
                    title={event.title}
                    description={event.description}
                    authorName={event.employee_name || "Unknown"}
                    authorAvatar={event.employee_avatar || ""}
                    createdAt={event.created_at}
                    eventDate={event.start_at}
                    image={event.images?.[0] || ""}
                    price={event.price}
                    city={event.city}
                    registeredCount={event.registered}
                    category={event.category}
                    fullEvent={event}
                  />
                ))}
              </SimpleGrid>
            ) : (
              <Center h={400} w="100%">
                <Stack align="center" gap="xs" justify="center">
                  <IconCalendarOff
                    size={48}
                    stroke={1.2}
                    color="var(--mantine-color-dimmed)"
                    style={{ opacity: 0.5 }}
                  />

                  <Stack gap={4} align="center">
                    <Text fw={700} c="var(--mantine-color-text)" size="lg">
                      {t("empty_state.no_events")}
                    </Text>
                    <Text size="sm" c="dimmed" ta="center">
                      {t("empty_state.try_adjusting")}
                    </Text>
                  </Stack>

                  <Button
                    variant="secondary"
                    onClick={handleResetFilters}
                    mt="sm"
                  >
                    {t("empty_state.clear_filters")}
                  </Button>
                </Stack>
              </Center>
            )}
          </Paper>

          {/* 4. PAGINATION FOOTER */}
          <PaginationFooter
            activePage={page}
            setPage={setPage}
            total_records={eventsData?.total_records || 0}
            last_page={eventsData?.last_page || 0}
            limit={LIMIT}
            hidden={!events || events.length === 0}
            unit={t("events").charAt(0).toLowerCase() + t("events").slice(1)}
          />
        </Stack>
      </Container>
    </Stack>
  );
}
