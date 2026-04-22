import {
  Container,
  Title,
  Text,
  Stack,
  SimpleGrid,
  Group,
  TextInput,
  Select,
  Anchor,
  Box,
  BackgroundImage,
  Overlay,
  Paper,
} from "@mantine/core";
import { IconSearch, IconChevronRight, IconFilter, IconSortDescending } from "@tabler/icons-react";
import { EventCard } from "../../components/event/EventCard";
import { useState } from "react";

const CATEGORIES = [
  { value: "workshop", label: "Workshops" },
  { value: "conference", label: "Conferences" },
  { value: "exposition", label: "Expositions" },
  { value: "other", label: "Other Events" },
  { value: "community", label: "Community Meetups" },
];

export default function EventPage() {
  const [search, setSearch] = useState("");

  const mockEvent = {
    title: "Eco-Design Workshop",
    description: "Learn how to upcycle your old furniture into modern pieces.",
    authorName: "Julian Thorne",
    authorAvatar: "",
    createdAt: new Date().toISOString(),
    eventDate: new Date().toISOString(),
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=2070&auto=format&fit=crop",
    price: 15,
    city: "Paris",
    postalCode: "75001",
  };

  return (
    <Stack gap={0}>
      {/* 1. HERO SECTION */}
      <Box h={450} pos="relative">
        <BackgroundImage
          src="https://images.unsplash.com/photo-1540575861501-7ad058ca3c98?q=80&w=2070&auto=format&fit=crop"
          h="100%"
        >
          <Overlay
            gradient="linear-gradient(180deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.8) 100%)"
            opacity={0.7}
            zIndex={1}
          />
          <Container size="xl" h="100%" pos="relative" style={{ zIndex: 2 }}>
            <Stack justify="center" align="center" h="100%" gap="xl">
              <Stack gap="xs" align="center">
                <Title order={1} size={60} c="white" ta="center" fw={900} style={{ lineHeight: 1.1 }}>
                  Discover <Text span c="var(--upagain-light-green)" inherit>Sustainable</Text> Events
                </Title>
                <Text c="white" size="lg" ta="center" maw={700} opacity={0.9} fw={500}>
                  Join thousands of enthusiasts in workshops, conferences, and exhibitions dedicated to 
                  giving a second life to objects.
                </Text>
              </Stack>
            </Stack>
          </Container>
        </BackgroundImage>
      </Box>

      {/* 2. SEARCH & FILTER SECTION */}
      <Container size="xl" mt={-40} pos="relative" style={{ zIndex: 10 }} w="100%">
        <Paper shadow="md" p="xl" radius="lg" withBorder>
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
            <TextInput
              placeholder="Search events, workshops..."
              leftSection={<IconSearch size={18} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              size="md"
              radius="md"
            />
            <Select
              placeholder="Filter by material"
              leftSection={<IconFilter size={18} />}
              data={["Wood", "Metal", "Textile", "Glass", "Plastic"]}
              size="md"
              radius="md"
            />
            <Select
              placeholder="Sort by date"
              leftSection={<IconSortDescending size={18} />}
              data={["Soonest", "Latest", "Price: Low to High", "Price: High to Low"]}
              size="md"
              radius="md"
            />
          </SimpleGrid>
        </Paper>
      </Container>

      <Container size="xl" py={80} w="100%">
        <Stack gap={100}>
          {/* 3. CATEGORY SECTIONS */}
          {CATEGORIES.map((cat) => (
            <Stack key={cat.value} gap="xl">
              <Group justify="space-between" align="center">
                <Stack gap={4}>
                  <Title order={2} size={32} fw={800}>
                    {cat.label}
                  </Title>
                  <Text c="dimmed" size="sm">
                    Explore our curated selection of {cat.label.toLowerCase()} near you.
                  </Text>
                </Stack>
                <Anchor
                  component="button"
                  size="sm"
                  fw={700}
                  c="var(--upagain-neutral-green)"
                >
                  <Group gap={4}>
                    View all {cat.label.toLowerCase()}
                    <IconChevronRight size={14} />
                  </Group>
                </Anchor>
              </Group>

              <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="xl">
                {[1, 2, 3, 4].map((i) => (
                  <EventCard 
                    key={`${cat.value}-${i}`} 
                    {...mockEvent} 
                    category={cat.value} 
                  />
                ))}
              </SimpleGrid>
            </Stack>
          ))}
        </Stack>
      </Container>
    </Stack>
  );
}
