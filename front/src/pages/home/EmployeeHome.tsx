import { HeroBanner } from "../../components/hero/HeroBanner";
import {
  Button,
  Container,
  Group,
  useComputedColorScheme,
  Stack,
  Title,
  Text,
  SimpleGrid,
  Paper,
  Box,
  Center,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useDisclosure } from "@mantine/hooks";
import {
  IconCalendarEvent,
  IconClock,
  IconFileText,
  IconPlus,
  IconCalendar,
} from "@tabler/icons-react";
import { PATHS } from "../../routes/paths";
import { useAuth } from "../../context/AuthContext";
import { useGetMyEvents } from "../../hooks/eventHooks";
import { useGetMyPosts, useLikePost, useSavePost } from "../../hooks/postHooks";
import { CreateEventModal } from "../../components/event/CreateEventModal";
import { CreatePostModal } from "../../components/post/CreatePostModal";
import { EventCard } from "../../components/event/EventCard";
import PostCard from "../../components/post/PostCard";
import { DashboardCard } from "../../components/dashboard/DashboardCard";
import FullScreenSkeleton from "../../components/common/FullScreenSkeleton";

export default function EmployeeHome() {
  const { t } = useTranslation("home");
  const navigate = useNavigate();
  const scheme = useComputedColorScheme("light");
  const { user } = useAuth();

  // Create modals state
  const [
    openedCreateEvent,
    { open: openCreateEvent, close: closeCreateEvent },
  ] = useDisclosure(false);
  const [openedCreatePost, { open: openCreatePost, close: closeCreatePost }] =
    useDisclosure(false);

  // Queries
  const { data: myEvents, isLoading: isLoadingEvents } = useGetMyEvents();
  const { data: myPostsData, isLoading: isLoadingPosts } = useGetMyPosts(1, 10);

  const { mutateAsync: likePostAsync } = useLikePost();
  const { mutateAsync: savePostAsync } = useSavePost();

  // Filter events
  const upcomingEvents =
    myEvents?.filter(
      (e) => e.status === "approved" && new Date(e.start_at) > new Date(),
    ) || [];

  const proposedEvents =
    myEvents?.filter((e) => e.status === "pending" || e.status === "refused") ||
    [];

  const pendingCount =
    myEvents?.filter((e) => e.status === "pending").length || 0;

  const myPosts = myPostsData?.posts || [];

  if (isLoadingEvents || isLoadingPosts) {
    return <FullScreenSkeleton />;
  }

  return (
    <>
      {/* HERO SECTION */}
      <HeroBanner
        src={`/banners/user-banner1-${scheme}.png`}
        height="70vh"
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
            animation: "fadeIn 1s ease-out",
            marginTop: "-10vh",
          }}
        >
          <Title size={56} ta="center" style={{ lineHeight: 1.1 }}>
            {t("employee.hero.title", { username: user?.username })}
          </Title>
          <Text size="xl" fw={500} ta="center" maw={750} c="dimmed">
            {t("employee.hero.subtitle")}
          </Text>
        </Stack>
      </HeroBanner>

      {/* DASHBOARD STATS */}
      <Container px="md" py={30} size="xl">
        <Stack gap="xl">
          <Stack gap={0}>
            <Title order={2} size={32} c="var(--mantine-color-text)">
              {t("employee.stats.title")}
            </Title>
            <Text c="dimmed" size="sm">
              {t("employee.stats.subtitle")}
            </Text>
          </Stack>

          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
            {/* STAT 1: UPCOMING APPROVED EVENTS */}
            <DashboardCard
              title={t("employee.stats.upcoming_workshops")}
              icon={<IconCalendarEvent size={18} />}
              color="var(--upagain-neutral-green)"
              align="center"
            >
              <Stack
                gap="xs"
                align="center"
                justify="center"
                style={{ flex: 1, minHeight: 80 }}
              >
                <Text size="44px" fw={900} c="var(--upagain-neutral-green)">
                  {upcomingEvents.length}
                </Text>
                <Text size="xs" c="dimmed" ta="center">
                  {t("employee.stats.upcoming_workshops")}
                </Text>
              </Stack>
            </DashboardCard>

            {/* STAT 2: PENDING PROPOSALS */}
            <DashboardCard
              title={t("employee.stats.pending_proposals")}
              icon={<IconClock size={18} />}
              color="var(--upagain-yellow)"
              align="center"
            >
              <Stack
                gap="xs"
                align="center"
                justify="center"
                style={{ flex: 1, minHeight: 80 }}
              >
                <Text size="44px" fw={900} c="var(--upagain-yellow)">
                  {proposedEvents.length}
                </Text>
                <Text size="xs" c="dimmed" ta="center">
                  {pendingCount} pending /{" "}
                  {proposedEvents.length - pendingCount} refused
                </Text>
              </Stack>
            </DashboardCard>

            {/* STAT 3: MY GUIDES */}
            <DashboardCard
              title={t("employee.stats.my_guides")}
              icon={<IconFileText size={18} />}
              color="var(--upagain-light-green)"
              align="center"
            >
              <Stack
                gap="xs"
                align="center"
                justify="center"
                style={{ flex: 1, minHeight: 80 }}
              >
                <Text size="44px" fw={900} c="var(--upagain-dark-green)">
                  {myPostsData?.total_records || 0}
                </Text>
                <Text size="xs" c="dimmed" ta="center">
                  {t("employee.stats.my_guides")}
                </Text>
              </Stack>
            </DashboardCard>
          </SimpleGrid>
        </Stack>
      </Container>

      {/* QUICK ACTIONS */}
      <Container px="md" py={30} size="xl">
        <Paper
          className="paper"
          data-variant="primary"
          p={40}
          radius="lg"
          style={{
            borderLeft: "6px solid var(--upagain-neutral-green)",
          }}
        >
          <Stack gap="xl">
            <Title order={2} size={28}>
              {t("employee.actions.ready")}
            </Title>
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing={40}>
              {/* ACTION 1: PROPOSE WORKSHOP */}
              <Paper
                withBorder
                p="lg"
                radius="md"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <Stack gap="md" style={{ flex: 1 }}>
                  <Group gap="xs">
                    <IconCalendar
                      size={24}
                      color="var(--upagain-neutral-green)"
                    />
                    <Title order={4} size="lg">
                      {t("employee.actions.propose_title")}
                    </Title>
                  </Group>
                  <Text size="sm" c="dimmed">
                    {t("employee.actions.propose_desc")}
                  </Text>
                </Stack>
                <Button
                  className="button"
                  data-variant="cta"
                  onClick={openCreateEvent}
                  mt="xl"
                  leftSection={<IconPlus size={16} />}
                >
                  {t("employee.actions.propose_button")}
                </Button>
              </Paper>

              {/* ACTION 2: WRITE POST */}
              <Paper
                withBorder
                p="lg"
                radius="md"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <Stack gap="md" style={{ flex: 1 }}>
                  <Group gap="xs">
                    <IconFileText size={24} color="var(--upagain-yellow)" />
                    <Title order={4} size="lg">
                      {t("employee.actions.write_title")}
                    </Title>
                  </Group>
                  <Text size="sm" c="dimmed">
                    {t("employee.actions.write_desc")}
                  </Text>
                </Stack>
                <Button
                  className="button"
                  data-variant="secondary"
                  onClick={openCreatePost}
                  mt="xl"
                  leftSection={<IconPlus size={16} />}
                >
                  {t("employee.actions.write_button")}
                </Button>
              </Paper>
            </SimpleGrid>

            <Group justify="center" mt="md">
              <Button
                variant="cta-reverse"
                color="var(--upagain-neutral-green)"
                onClick={() => navigate(PATHS.EVENTS.PLANNING)}
              >
                {t("employee.actions.planning_button")}
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Container>

      {/* AGENDA & MY POSTS SECTION */}
      <Container px="md" py={30} size="xl" mb="xl">
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
          {/* UPCOMING SCHEDULE */}
          <Paper
            variant="primary"
            p={30}
            radius="lg"
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            <Stack gap="xl" style={{ flex: 1 }}>
              <Stack gap={5}>
                <Title order={2} size={28}>
                  {t("employee.agenda.title")}
                </Title>
                <Text c="dimmed" size="sm">
                  {t("employee.agenda.subtitle")}
                </Text>
              </Stack>

              <Box style={{ flex: 1 }}>
                {upcomingEvents.length > 0 ? (
                  <Stack gap="md">
                    {upcomingEvents.slice(0, 2).map((event) => (
                      <EventCard
                        key={event.id}
                        onclick={() =>
                          navigate(
                            `/events/${event?.category === "meetups" ? "meetup" : event?.category}/${event.id}`,
                          )
                        }
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
                      style={{ cursor: "pointer" }}
                    >
                      {t("employee.agenda.view_planning")}
                    </Text>
                  </Stack>
                ) : (
                  <Center h="100%" style={{ minHeight: 200 }}>
                    <Stack align="center" gap="lg" w="100%">
                      <Stack align="center" gap={0}>
                        <IconCalendarEvent
                          size={48}
                          color="var(--upagain-neutral-green)"
                          stroke={1.5}
                        />
                        <Text fw={600} size="lg" mt="md">
                          {t("employee.agenda.no_events_title")}
                        </Text>
                        <Text c="dimmed" ta="center" size="sm" maw={280}>
                          {t("employee.agenda.no_events_desc")}
                        </Text>
                      </Stack>
                      <Button
                        className="button"
                        data-variant="cta"
                        size="md"
                        onClick={openCreateEvent}
                        fullWidth
                      >
                        {t("employee.actions.propose_button")}
                      </Button>
                    </Stack>
                  </Center>
                )}
              </Box>
            </Stack>
          </Paper>

          {/* LATEST POSTS */}
          <Paper
            variant="primary"
            p={30}
            radius="lg"
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            <Stack gap="xl" style={{ flex: 1 }}>
              <Stack gap={5}>
                <Title order={2} size={28}>
                  {t("employee.posts.title")}
                </Title>
                <Text c="dimmed" size="sm">
                  {t("employee.posts.subtitle")}
                </Text>
              </Stack>

              <Box style={{ flex: 1 }}>
                {myPosts.length > 0 ? (
                  <Stack gap="md">
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                      {myPosts.slice(0, 2).map((post) => (
                        <PostCard
                          currentRole={user?.role || ""}
                          key={post.id}
                          title={post.title}
                          description={post.content}
                          image={
                            post.photos?.[0] ??
                            "/banners/user-banner1-light.png"
                          }
                          category={post.category}
                          authorName={post.creator}
                          authorAvatar={post.creator_avatar ?? ""}
                          postedTime={post.created_at}
                          views={post.view_count}
                          likes={post.like_count}
                          isLiked={post.is_liked ?? false}
                          isSaved={post.is_saved ?? false}
                          isSponsored={post.ads_id !== null}
                          onLike={() => likePostAsync(post.id)}
                          onSave={() => savePostAsync(post.id)}
                          onClick={() => navigate(`/community/${post.id}`)}
                        />
                      ))}
                    </SimpleGrid>
                    <Text
                      className="text"
                      data-variant="primary"
                      size="sm"
                      fw={700}
                      onClick={() => navigate(PATHS.POSTS.MY_POSTS)}
                      style={{ cursor: "pointer" }}
                    >
                      {t("employee.posts.view_all")}
                    </Text>
                  </Stack>
                ) : (
                  <Center h="100%" style={{ minHeight: 200 }}>
                    <Stack align="center" gap="lg" w="100%">
                      <Stack align="center" gap={0}>
                        <IconFileText
                          size={48}
                          color="var(--upagain-yellow)"
                          stroke={1.5}
                        />
                        <Text fw={600} size="lg" mt="md">
                          {t("employee.posts.no_posts_title")}
                        </Text>
                        <Text c="dimmed" ta="center" size="sm" maw={280}>
                          {t("employee.posts.no_posts_desc")}
                        </Text>
                      </Stack>
                      <Button
                        className="button"
                        data-variant="secondary"
                        size="md"
                        onClick={openCreatePost}
                        fullWidth
                      >
                        {t("employee.actions.write_button")}
                      </Button>
                    </Stack>
                  </Center>
                )}
              </Box>
            </Stack>
          </Paper>
        </SimpleGrid>
      </Container>

      {/* MODALS */}
      <CreateEventModal opened={openedCreateEvent} onClose={closeCreateEvent} />
      <CreatePostModal
        opened={openedCreatePost}
        onClose={closeCreatePost}
        role={user?.role || ""}
      />
    </>
  );
}
