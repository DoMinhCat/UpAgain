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
} from "@mantine/core";
import { useParams } from "react-router-dom";
import {
  IconSearch,
  IconFilter,
  IconSortDescending,
} from "@tabler/icons-react";
import MyBreadcrumbs from "../../../components/nav/MyBreadcrumbs";
import { EventCard } from "../../../components/event/EventCard";
import PaginationFooter from "../../../components/common/PaginationFooter";
import { useState } from "react";
import { PATHS } from "../../../routes/paths";

export default function EventCategoryPage() {
  const { category } = useParams<{ category: string }>();
  const [page, setPage] = useState(1);

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
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">
            <TextInput
              placeholder="Search in this category..."
              leftSection={<IconSearch size={18} />}
              size="sm"
              radius="xl"
            />
            <Group justify="flex-end">
              <Select
                placeholder="Filter"
                leftSection={<IconFilter size={18} />}
                data={["Paris", "Lyon", "Marseille", "Bordeaux", "Toulouse"]}
                size="sm"
                radius="xl"
                style={{ width: 200 }}
              />
              <Select
                placeholder="Sort by"
                leftSection={<IconSortDescending size={18} />}
                data={[
                  "Date: Soonest",
                  "Date: Latest",
                  "Price: Low to High",
                  "Price: High to Low",
                ]}
                size="sm"
                radius="xl"
                style={{ width: 200 }}
              />
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
            <Text c="dimmed" size="lg" maw={800}>
              {categoryDescription}
            </Text>
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
            total_records={48}
            last_page={6}
            limit={8}
            unit="events"
          />
        </Stack>
      </Container>
    </Stack>
  );
}
