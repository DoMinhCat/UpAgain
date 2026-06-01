import {
  Container,
  Stack,
  Title,
  Text,
  SimpleGrid,
  Paper,
  Box,
  Button,
  Group,
  Center,
  Badge,
  Skeleton,
  useComputedColorScheme,
  Anchor,
} from "@mantine/core";
import { useTranslation, Trans } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAccountDetails, useAccountStats } from "../../hooks/accountHooks";
import { useGetMyEvents } from "../../hooks/eventHooks";
import { useGetAllItems } from "../../hooks/itemHooks";
import { useAuth } from "../../context/AuthContext";
import { useDisclosure } from "@mantine/hooks";
import { PATHS } from "../../routes/paths";
import { HeroBanner } from "../../components/hero/HeroBanner";
import { DashboardCard } from "../../components/dashboard/DashboardCard";
import ItemCard from "../../components/market/ItemCard";
import { EventCard } from "../../components/event/EventCard";
import { CreatePostModal } from "../../components/post/CreatePostModal";
import {
  IconCalendarEvent,
  IconListDetails,
  IconBuildingStore,
  IconPackage,
  IconSparkles,
  IconTrophy,
  IconChevronsUp,
} from "@tabler/icons-react";

export function ProHomeFreeSkeleton() {
  return (
    <Container size="xl" px="md" py={40}>
      <Stack gap="xl">
        {/* Hero Banner Skeleton */}
        <Skeleton height={280} radius="lg" />

        {/* Dashboard Stats Cards Skeleton */}
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
          <Skeleton height={120} radius="lg" />
          <Skeleton height={120} radius="lg" />
          <Skeleton height={120} radius="lg" />
        </SimpleGrid>

        {/* Quick Action Container Skeleton */}
        <Skeleton height={220} radius="lg" />

        {/* Split grid for Sourcing and Agenda Skeleton */}
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
          <Skeleton height={400} radius="lg" />
          <Skeleton height={400} radius="lg" />
        </SimpleGrid>
      </Stack>
    </Container>
  );
}

export default function ProHomeFree() {
  const { t } = useTranslation(["home", "common", "marketplace", "events"]);
  const navigate = useNavigate();
  const scheme = useComputedColorScheme("light");
  const { user } = useAuth();

  const [openedCreatePost, { open: openCreatePost, close: closeCreatePost }] =
    useDisclosure(false);

  const { data: accountDetails, isLoading: isLoadingAccountDetails } =
    useAccountDetails(user?.id || 0);

  const { data: accountStats, isLoading: isLoadingAccountStats } =
    useAccountStats(user?.id || 0, !!user?.id);

  const { data: myEvents, isLoading: isLoadingEvents } = useGetMyEvents();

  // Fetch 3 items from marketplace to encourage buying
  const { data: itemsData, isLoading: isLoadingItems } = useGetAllItems(
    1,
    3,
    "",
    "latest",
    "approved",
  );

  const myUpcomingEvents =
    myEvents && myEvents.length > 0
      ? myEvents.filter((event) => new Date(event.start_at) > new Date())
      : [];

  const itemsToBuy = itemsData?.items ?? [];

  const isLoading =
    isLoadingAccountDetails ||
    isLoadingAccountStats ||
    isLoadingEvents ||
    isLoadingItems;

  if (isLoading) {
    return <ProHomeFreeSkeleton />;
  }

  return (
    <>
      {/* SECTION 1: HERO SECTION */}
      <HeroBanner
        src={`/banners/user-banner1-${scheme}.png`}
        height="75vh"
        style={{
          maskImage:
            "linear-gradient(to bottom, black 0%, black 85%, rgba(0, 0, 0, 0.5) 92%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, black 85%, rgba(0, 0, 0, 0.5) 92%, transparent 100%)",
        }}
      >
        <Stack
          align="center"
          gap="xs"
          style={{
            animation: "fadeIn 1.5s ease-out",
            marginTop: "-8vh",
          }}
        >
          <Badge
            variant="gradient"
            gradient={{ from: "teal", to: "blue", deg: 45 }}
            size="lg"
            radius="xl"
            mb="xs"
          >
            {t("pro.hero.premium_badge")}
          </Badge>
          <Title size={48} ta="center" style={{ lineHeight: 1.15 }}>
            {t("pro.hero.title", { username: accountDetails?.username })}
          </Title>
          <Text size="lg" fw={500} ta="center" maw={650} c="dimmed">
            {t("pro.hero.subtitle")}
          </Text>

          {/* Premium Subscription Upgrade Card */}
          <Paper
            variant="primary"
            p="md"
            mt="lg"
            radius="md"
            style={{
              maxWidth: 580,
              backgroundColor:
                scheme === "light"
                  ? "rgba(69, 165, 117, 0.08)"
                  : "rgba(69, 165, 117, 0.15)",
              border: "1px solid rgba(69, 165, 117, 0.3)",
              boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.05)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }}
          >
            <Stack gap="xs" align="center">
              <Group gap="xs">
                <IconSparkles size={16} color="var(--upagain-yellow)" />
                <Text size="xs" fw={700} tt="uppercase" lts={1} c="teal">
                  Premium Feature
                </Text>
              </Group>
              <Text size="sm" ta="center" fw={600}>
                {t("pro.hero.premium_cta")}
              </Text>
              <Button
                size="xs"
                variant="cta"
                className="button"
                data-variant="cta"
                leftSection={<IconChevronsUp stroke={2} />}
                onClick={() => navigate(PATHS.GUEST.PRICING)}
              >
                Premium
              </Button>
            </Stack>
          </Paper>
        </Stack>
      </HeroBanner>

      {/* SECTION 2: DISSBOARD STATS */}
      <Container px="md" py={30} size="xl">
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
          {/* Card 1: Published Projects */}
          <DashboardCard
            title={t("pro.stats.published_projects")}
            icon={<IconListDetails size={18} />}
            color="var(--upagain-neutral-green)"
            align="center"
          >
            <Stack gap={0} align="center" py="xs">
              <Text size="32px" fw={900} style={{ lineHeight: 1 }}>
                {accountStats?.total_posts ?? 0}
              </Text>
              <Text size="xs" c="dimmed" mt="xs">
                Guides & creations shared
              </Text>
            </Stack>
          </DashboardCard>

          {/* Card 2: Registered Events */}
          <DashboardCard
            title={t("pro.stats.registered_events")}
            icon={<IconCalendarEvent size={18} />}
            color="var(--upagain-yellow)"
            align="center"
          >
            <Stack gap={0} align="center" py="xs">
              <Text size="32px" fw={900} style={{ lineHeight: 1 }}>
                {myUpcomingEvents.length}
              </Text>
              <Text size="xs" c="dimmed" mt="xs">
                Upcoming workshops rejoined
              </Text>
            </Stack>
          </DashboardCard>

          {/* Card 3: Marketplace Listings */}
          <DashboardCard
            title={t("pro.stats.marketplace_items")}
            icon={<IconBuildingStore size={18} />}
            color="var(--upagain-light-green)"
            align="center"
          >
            <Stack gap={0} align="center" py="xs">
              <Text size="32px" fw={900} style={{ lineHeight: 1 }}>
                {accountStats?.total_listings ?? 0}
              </Text>
              <Text size="xs" c="dimmed" mt="xs">
                Active materials listed
              </Text>
            </Stack>
          </DashboardCard>
        </SimpleGrid>
      </Container>

      {/* SECTION 3: QUICK ACTIONS & BUSINESS OVERVIEW */}
      <Container px="md" py={30} size="xl">
        <Paper
          className="paper"
          data-variant="primary"
          p={40}
          radius="lg"
          style={{
            borderLeft: "6px solid var(--upagain-neutral-green)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "translateY(-4px)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "translateY(0)")
          }
        >
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing={50}>
            {/* Left Column: Stats overview and follow up */}
            <Stack gap="xl">
              <Stack gap={5}>
                <Title order={2} size={32}>
                  {t("pro.manage.title")}
                </Title>
                <Text c="dimmed" size="sm">
                  {t("pro.manage.subtitle")}
                </Text>
              </Stack>

              <Group align="stretch" grow>
                {/* Column 1: Projects details */}
                <Stack gap="md" style={{ flex: 1 }}>
                  <Box style={{ flex: 1 }}>
                    <Title
                      order={4}
                      size="sm"
                      c="var(--upagain-neutral-green)"
                      tt="uppercase"
                      lts={1}
                    >
                      {t("pro.stats.published_projects")}
                    </Title>
                    <Text size="sm" mt="xs">
                      <Trans
                        i18nKey="pro.manage.posts_status"
                        ns="home"
                        values={{ count: accountStats?.total_posts ?? 0 }}
                        components={{
                          b: <b />,
                        }}
                      />
                    </Text>
                  </Box>
                  <Text
                    className="text"
                    data-variant="primary"
                    size="sm"
                    fw={700}
                    onClick={() => navigate(PATHS.POSTS.MY_POSTS)}
                  >
                    {t("pro.manage.manage_posts")}
                  </Text>
                </Stack>

                {/* Column 2: Events registration */}
                <Stack gap="md" style={{ flex: 1 }}>
                  <Box style={{ flex: 1 }}>
                    <Title
                      order={4}
                      size="sm"
                      c="var(--upagain-neutral-green)"
                      tt="uppercase"
                      lts={1}
                    >
                      {t("pro.stats.registered_events")}
                    </Title>
                    <Text size="sm" mt="xs">
                      <Trans
                        i18nKey="pro.manage.events_status"
                        ns="home"
                        values={{ count: myUpcomingEvents.length }}
                        components={{
                          b: <b />,
                        }}
                      />
                    </Text>
                  </Box>
                  <Anchor
                    size="sm"
                    fw={700}
                    c="var(--upagain-neutral-green)"
                    onClick={() => navigate(PATHS.EVENTS.HOME)}
                  >
                    {t("pro.manage.manage_events")}
                  </Anchor>
                </Stack>
              </Group>
            </Stack>

            {/* Right Column: Quick Action buttons */}
            <Stack gap="lg" justify="center">
              <Title order={3} ta="center">
                {t("pro.manage.ready_to_do_more", {
                  username: accountDetails?.username,
                })}
              </Title>

              <Button
                className="button"
                data-variant="cta"
                size="lg"
                onClick={openCreatePost}
              >
                {t("pro.manage.create_post")}
              </Button>

              <Stack gap="xs">
                <Title order={3} ta="center">
                  {t("pro.manage.explore_community")}
                </Title>
                <Group justify="center">
                  <Button
                    className="button"
                    data-variant="secondary"
                    size="sm"
                    onClick={() => navigate(PATHS.MARKETPLACE.HOME)}
                  >
                    {t("pro.manage.materials_marketplace")}
                  </Button>
                  <Button
                    className="button"
                    data-variant="secondary"
                    size="sm"
                    onClick={() => navigate(PATHS.EVENTS.HOME)}
                  >
                    {t("pro.manage.discover_more_events")}
                  </Button>
                </Group>
              </Stack>
            </Stack>
          </SimpleGrid>
        </Paper>
      </Container>

      {/* SECTION 4: MARKETPLACE SOURCING & AGENDA */}
      <Container px="md" py={30} size="xl" mb="xl">
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
          {/* 4.1 Marketplace Sourcing (Items grid) */}
          <Paper
            variant="primary"
            p={30}
            radius="lg"
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              transition: "transform 0.2s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "translateY(-4px)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "translateY(0)")
            }
          >
            <Stack gap="xl" style={{ flex: 1 }}>
              <Stack gap={5}>
                <Title order={2} size={28}>
                  {t("pro.marketplace.title")}
                </Title>
                <Text c="dimmed" size="sm">
                  {t("pro.marketplace.subtitle")}
                </Text>
              </Stack>

              <Box style={{ flex: 1 }}>
                {itemsToBuy.length > 0 ? (
                  <Stack gap="md">
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                      {itemsToBuy.slice(0, 2).map((item) => (
                        <ItemCard key={item.id} item={item} />
                      ))}
                    </SimpleGrid>
                  </Stack>
                ) : (
                  <Center h="100%" style={{ minHeight: 220 }}>
                    <Stack align="center" gap="xs">
                      <IconPackage
                        size={40}
                        color="var(--upagain-neutral-green)"
                        stroke={1.5}
                      />
                      <Text c="dimmed" ta="center" maw={300}>
                        {t("pro.marketplace.quiet_marketplace")}
                      </Text>
                    </Stack>
                  </Center>
                )}
              </Box>

              <Button
                variant="secondary"
                className="button"
                data-variant="secondary"
                onClick={() => navigate(PATHS.MARKETPLACE.HOME)}
                fullWidth
              >
                {t("pro.marketplace.discover_marketplace")}
              </Button>
            </Stack>
          </Paper>

          {/* 4.2 Pro Registered Events Agenda */}
          <Paper
            variant="primary"
            p={30}
            radius="lg"
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              transition: "transform 0.2s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "translateY(-4px)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "translateY(0)")
            }
          >
            <Stack gap="xl" style={{ flex: 1 }}>
              <Stack gap={5}>
                <Title order={2} size={28}>
                  {t("pro.manage.registered_events_list")}
                </Title>
                <Text c="dimmed" size="sm">
                  {t("user.agenda.subtitle")}
                </Text>
              </Stack>

              <Box style={{ flex: 1 }}>
                {myUpcomingEvents.length > 0 ? (
                  <Stack gap="md">
                    {myUpcomingEvents.slice(0, 2).map((event) => (
                      <EventCard
                        key={event.id}
                        onclick={() => navigate(`/events/${event.id}`)}
                        orientation="horizontal"
                        category={event.category}
                        title={event.title}
                        description={event.description ?? ""}
                        image={
                          event.images?.[0] ?? "/banners/user-banner1-light.png"
                        }
                        authorName={event.employee_name ?? "UpAgain"}
                        authorAvatar={event.employee_avatar ?? ""}
                        createdAt={event.created_at}
                        eventDate={event.start_at}
                        price={event.price ?? 0}
                        registeredCount={event.registered ?? 0}
                        city={event.city}
                      />
                    ))}
                    <Text
                      className="text"
                      data-variant="primary"
                      size="sm"
                      fw={700}
                      onClick={() => navigate(PATHS.EVENTS.PLANNING)}
                    >
                      {t("user.agenda.view_all")} →
                    </Text>
                  </Stack>
                ) : (
                  <Center h="100%" style={{ minHeight: 220 }}>
                    <Stack align="center" gap="lg" w="100%">
                      <Stack align="center" gap={0}>
                        <IconTrophy
                          size={48}
                          color="var(--upagain-yellow)"
                          stroke={1.5}
                        />
                        <Text fw={600} size="lg" mt="md">
                          {t("user.agenda.no_events_title")}
                        </Text>
                        <Text c="dimmed" ta="center" size="sm" maw={280}>
                          {t("user.agenda.no_events_desc")}
                        </Text>
                      </Stack>
                      <Button
                        className="button"
                        data-variant="cta"
                        size="md"
                        fullWidth
                        onClick={() => navigate(PATHS.EVENTS.HOME)}
                      >
                        {t("pro.manage.discover_more_events")}
                      </Button>
                    </Stack>
                  </Center>
                )}
              </Box>
            </Stack>
          </Paper>
        </SimpleGrid>
      </Container>

      {/* CREATE PROJECT MODAL */}
      <CreatePostModal
        opened={openedCreatePost}
        onClose={closeCreatePost}
        role={user?.role || "pro"}
      />
    </>
  );
}
