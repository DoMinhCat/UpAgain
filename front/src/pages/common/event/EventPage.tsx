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
} from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import { useTranslation, Trans } from "react-i18next";
import { EventCard } from "../../../components/event/EventCard";

import { HeroBanner } from "../../../components/hero/HeroBanner";
import { useNavigate } from "react-router-dom";
import MyBreadcrumbs from "../../../components/nav/MyBreadcrumbs";
import { PATHS } from "../../../routes/paths";

const CATEGORIES = [
  "workshop",
  "conference",
  "meetup",
  "exposition",
  "other",
] as const;

export default function EventPage() {
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

  return (
    <Stack gap={0}>
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
        <MyBreadcrumbs
          mb="lg"
          breadcrumbs={[
            {
              title: t("home:home_title", { defaultValue: "Home" }),
              href: PATHS.HOME,
            },
            { title: t("events", { defaultValue: "Events" }), href: "#" },
          ]}
        />
        <Stack gap={60}>
          {/* 2. CATEGORY SECTIONS */}
          {CATEGORIES.map((cat) => (
            <Stack key={cat} gap="xl">
              <Group justify="space-between" align="center">
                <Title order={2} style={{ textTransform: "capitalize" }}>
                  {t(`categories.${cat}_plural`)}
                </Title>
                <Anchor
                  component="button"
                  size="sm"
                  fw={700}
                  c="var(--upagain-neutral-green)"
                  onClick={() => navigate(`/events/${cat}s`)}
                >
                  <Group gap={4}>
                    {t("categories.see_all", {
                      category: t(`categories.${cat}_plural`),
                    })}
                    <IconChevronRight size={14} />
                  </Group>
                </Anchor>
              </Group>

              <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
                {[1, 2, 3, 4].map((i) => (
                  <EventCard
                    onclick={() => navigate(`/events/${cat}s/${99}`)}
                    key={`${cat}-${i}`}
                    {...mockEvent}
                    category={cat}
                  />
                ))}
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
