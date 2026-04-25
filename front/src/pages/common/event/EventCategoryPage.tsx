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
} from "@mantine/core";
import { useParams } from "react-router-dom";
import {
  IconSearch,
  IconFilter,
  IconSortDescending,
  IconRefresh,
  IconCalendar,
} from "@tabler/icons-react";
import MyBreadcrumbs from "../../../components/nav/MyBreadcrumbs";
import { EventCard } from "../../../components/event/EventCard";
import PaginationFooter from "../../../components/common/PaginationFooter";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../../routes/paths";
import { NotFoundPage } from "../../error/404";
// import FullScreenLoader from "../../../components/common/FullScreenLoader";
import { useAuth } from "../../../context/AuthContext";

export default function EventCategoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { category } = useParams<{ category: string }>();
  let event_category = category?.substring(0, category.length - 1);
  if (event_category === "meetup") {
    event_category = "meetups";
  }

  // FILTER OPTIONS
  const [page, setPage] = useState<number>(1);
  const LIMIT = 12;
  const [filters, setFilters] = useState<{
    search: string | null;
    city: string | null;
    sort: string | null;
  }>({ search: null, city: null, sort: null });

  const handleApply = () => {
    // TODO: fetch data with search, filter and sort
    setPage(1);
  };

  const handleReset = () => {
    setFilters({ search: null, city: null, sort: null });
    setPage(1);
  };

  if (
    category != "workshops" &&
    category != "conferences" &&
    category != "meetups" &&
    category != "expositions" &&
    category != "others"
  ) {
    return <NotFoundPage />;
  }

  // Mock data for drafting
  const categoryTitle = category
    ? category.charAt(0).toUpperCase() + category.slice(1)
    : "Events";
  const categoryDescription = `Explore our collection of ${category || "upcoming"} events. Join workshops, conferences, and meetups to learn new skills and connect with the community.`;

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
    registeredCount: 24,
  };

  // if(isloading){
  //   return <FullScreenLoader />
  // }
  return (
    <Stack gap={0}>
      {/* 1. FILTER BAR (Below Navbar) */}
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
              placeholder="Search in this category..."
              leftSection={
                <IconSearch size={18} color="var(--upagain-neutral-green)" />
              }
              value={filters.search || ""}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />

            {/* ACTIONS & FILTERS */}
            <Group justify="flex-end" gap="xs" wrap="nowrap">
              <Select
                placeholder="City"
                leftSection={<IconFilter size={16} />}
                data={["Paris", "Lyon", "Marseille", "Bordeaux", "Toulouse"]}
                value={filters.city}
                onChange={(value) => setFilters({ ...filters, city: value })}
                style={{ width: 140 }}
              />

              <Select
                placeholder="Sort by"
                leftSection={<IconSortDescending size={16} />}
                data={[
                  { value: "soonest_date", label: "Soonest" },
                  { value: "lowest_price", label: "Lowest price" },
                  { value: "highest_price", label: "Highest price" },
                  { value: "most_popular", label: "Most popular" },
                ]}
                value={filters.sort}
                onChange={(value) => setFilters({ ...filters, sort: value })}
                style={{ width: 140 }}
              />

              <Group gap={8}>
                <Button
                  className="button"
                  data-variant="primary"
                  size="sm"
                  onClick={handleApply}
                >
                  Apply
                </Button>

                {/* Reset icon button instead of text button to save space */}
                <Tooltip label="Reset Filters" position="bottom">
                  <ActionIcon
                    className="actionIcon"
                    data-variant="primary"
                    size="lg"
                    radius="xl"
                    onClick={handleReset}
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
                { title: "Home", href: PATHS.HOME },
                { title: "Events", href: "/events" },
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
                  onClick={() => navigate(PATHS.EVENTS.PLANNING)}
                  rightSection={<IconCalendar size={16} />}
                >
                  My Events
                </Button>
              )}
            </Group>
          </Stack>

          {/* 3. BODY: EVENT LIST */}
          <Paper p={0} radius="lg" style={{ background: "transparent" }}>
            <SimpleGrid
              cols={{ base: 1, sm: 2, md: 4 }}
              spacing="xl"
              verticalSpacing="50"
            >
              {/* Placeholders for dynamic data */}
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <EventCard
                  key={i}
                  {...mockEvent}
                  category={category || "other"}
                />
              ))}
            </SimpleGrid>
          </Paper>

          {/* 4. PAGINATION FOOTER */}
          <PaginationFooter
            activePage={page}
            setPage={setPage}
            total_records={999}
            last_page={6}
            limit={LIMIT}
            unit="events"
          />
        </Stack>
      </Container>
    </Stack>
  );
}
