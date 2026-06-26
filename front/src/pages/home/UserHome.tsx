import { HeroBanner } from "../../components/hero/HeroBanner";
import {
  Anchor,
  Button,
  Container,
  Group,
  useComputedColorScheme,
} from "@mantine/core";
import {
  Stack,
  Title,
  Text,
  SimpleGrid,
  Paper,
  Box,
  Progress,
  Center,
} from "@mantine/core";
import { useTranslation, Trans } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAccountDetails, useAccountStats } from "../../hooks/accountHooks";
import {
  useLikePost,
  useSavePost,
  useGetAllPosts,
} from "../../hooks/postHooks";
import { useGetUserImpact, useGetGlobalImpact } from "../../hooks/userHooks";
import { useGetMyEvents } from "../../hooks/eventHooks";
import FullScreenSkeleton from "../../components/common/FullScreenSkeleton";
import { useAuth } from "../../context/AuthContext";
import { ScoreRing } from "../../components/score/ScoreRing";
import { IconLeaf, IconDroplet, IconTrophy } from "@tabler/icons-react";
import { PATHS } from "../../routes/paths";
import PostCard from "../../components/post/PostCard";
import { EventCard } from "../../components/event/EventCard";
import { DashboardCard } from "../../components/dashboard/DashboardCard";
import { useHandleVerifyStripeEventRegistration } from "../../hooks/stripeHooks";

const WATER_MAX_L = 1000;
const ELECTRICITY_MAX_KWH = 100;

interface CO2Comparison {
  emoji: string;
  key: string;
}

function getCO2Comparison(co2Kg: number): CO2Comparison {
  if (co2Kg < 1) return { emoji: "🐹", key: "user.impact.animals.hamster" };
  if (co2Kg < 5) return { emoji: "🐱", key: "user.impact.animals.cat" };
  if (co2Kg < 15) return { emoji: "🐕", key: "user.impact.animals.dog" };
  if (co2Kg < 50) return { emoji: "🐑", key: "user.impact.animals.sheep" };
  if (co2Kg < 150) return { emoji: "🦁", key: "user.impact.animals.lion" };
  if (co2Kg < 500) return { emoji: "🐴", key: "user.impact.animals.horse" };
  if (co2Kg < 5000) return { emoji: "🐘", key: "user.impact.animals.elephant" };
  return { emoji: "🐋", key: "user.impact.animals.whale" };
}

export default function UserHome() {
  const { t } = useTranslation("home");
  const navigate = useNavigate();
  const scheme = useComputedColorScheme("light");
  const { user } = useAuth();

  useHandleVerifyStripeEventRegistration();

  const { data: accountDetails, isLoading: isLoadingAccountDetails } =
    useAccountDetails(user?.id || 0);

  const { mutateAsync: likePostAsync } = useLikePost();
  const { mutateAsync: savePostAsync } = useSavePost();

  const { data: userImpactData } = useGetUserImpact();
  const { data: globalImpactData } = useGetGlobalImpact();
  const { data: accountStats } = useAccountStats(user?.id || 0, !!user?.id);
  const { data: myEvents } = useGetMyEvents();

  const myUpcomingEvents =
    myEvents && myEvents.length > 0
      ? myEvents.filter((event) => new Date(event.start_at) > new Date())
      : [];

  const { data: postsData } = useGetAllPosts(1, 2, "", "", "highest_like");
  const posts = postsData?.posts ?? [];

  const co2Comparison = getCO2Comparison(userImpactData?.co2 ?? 0);

  if (isLoadingAccountDetails) {
    return <FullScreenSkeleton />;
  }

  return (
    <>
      <HeroBanner
        src={`/banners/user-banner1-${scheme}.png`}
        height="80vh"
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
            {t("user.hero.title", { username: accountDetails?.username })}
          </Title>
          <Text size="xl" fw={500} ta="center" maw={700} c="dimmed">
            {t("user.hero.subtitle")}
          </Text>
        </Stack>
      </HeroBanner>

      {/* SECTION 2: YOUR IMPACT */}
      <Container id="onboard-impact" px="md" py={50} size="xl">
        <Stack gap="xl">
          <Stack gap={0}>
            <Title order={2} size={32} c="var(--mantine-color-text)">
              {t("user.impact.title")}
            </Title>
            <Text c="dimmed" size="sm">
              {t("user.impact.subtitle")}
            </Text>
          </Stack>

          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
            {/* CARD 1: CO2 IMPACT */}
            <DashboardCard
              title={t("user.impact.co2_saved")}
              icon={<IconLeaf size={18} />}
              color="var(--upagain-neutral-green)"
              align="center"
            >
              <Stack gap={0} align="center">
                <Text size="32px" fw={900} style={{ lineHeight: 1 }}>
                  {userImpactData?.co2.toFixed(1) ?? "0"}{" "}
                  <Text span size="xl" fw={500}>
                    kg
                  </Text>
                </Text>
              </Stack>

              <Box pos="relative" py="sm">
                <Text size="3rem" ta="center" style={{ lineHeight: 1 }}>
                  {co2Comparison.emoji}
                </Text>
                <Text
                  size="xs"
                  ta="center"
                  mt="xs"
                  c="var(--upagain-dark-green)"
                  fw={600}
                  style={{
                    backgroundColor: "var(--upagain-light-green)",
                    borderRadius: "4px",
                    padding: "2px 8px",
                  }}
                >
                  {t(co2Comparison.key)}
                </Text>
              </Box>
            </DashboardCard>

            {/* CARD 2: RESOURCES */}
            <DashboardCard
              title={t("user.impact.resources_saved")}
              icon={<IconDroplet size={18} />}
              color="var(--upagain-yellow)"
            >
              <Stack gap="xs" mt="sm">
                <Group justify="space-between">
                  <Text size="sm" fw={500}>
                    {t("user.impact.water")}
                  </Text>
                  <Text size="sm" fw={700} c="var(--upagain-neutral-green)">
                    {userImpactData?.water.toFixed(0) ?? "0"} L
                  </Text>
                </Group>
                <Progress
                  value={Math.min(
                    ((userImpactData?.water ?? 0) / WATER_MAX_L) * 100,
                    100,
                  )}
                  color="var(--upagain-neutral-green)"
                  size="sm"
                  radius="xl"
                />

                <Group justify="space-between" mt="xs">
                  <Text size="sm" fw={500}>
                    {t("user.impact.electricity")}
                  </Text>
                  <Text size="sm" fw={700} c="var(--upagain-yellow)">
                    {userImpactData?.electricity.toFixed(1) ?? "0"} kWh
                  </Text>
                </Group>
                <Progress
                  value={Math.min(
                    ((userImpactData?.electricity ?? 0) / ELECTRICITY_MAX_KWH) *
                      100,
                    100,
                  )}
                  color="var(--upagain-yellow)"
                  size="sm"
                  radius="xl"
                />
              </Stack>
            </DashboardCard>

            {/* CARD 3: SCORE */}
            <DashboardCard
              title={t("user.impact.upcycling_score")}
              icon={<IconTrophy size={18} />}
              color="var(--upagain-light-green)"
              align="center"
            >
              <Box pos="relative" my="sm">
                <ScoreRing score={accountDetails?.score ?? 0} size={140} />
              </Box>
              {accountDetails?.score && accountDetails.score > 0 ? (
                <Text size="xs" c="dimmed" ta="center">
                  {t("user.impact.score_points", {
                    score: accountDetails.score,
                  })}
                </Text>
              ) : (
                <Button
                  variant="cta-reverse"
                  onClick={() => navigate(PATHS.MARKETPLACE.NEW)}
                >
                  {t("user.impact.start_upcycling_cta")}
                </Button>
              )}
            </DashboardCard>
          </SimpleGrid>
        </Stack>
      </Container>

      <Title ta="center" order={2} my="md">
        <Trans
          i18nKey="user.impact.altogether_saved"
          ns="home"
          values={{
            co2: globalImpactData?.co2.toFixed(0) ?? "...",
            electricity: globalImpactData?.electricity.toFixed(0) ?? "...",
            water: globalImpactData?.water.toFixed(0) ?? "...",
          }}
          components={{
            span: (
              <Text
                span
                c="var(--upagain-yellow)"
                inherit
                style={{ textShadow: "0 0 15px rgba(252,186,3,0.3)" }}
              />
            ),
          }}
        />
      </Title>

      {/* SECTION 3: MANAGE OBJECTS */}
      <Container id="onboard-manage" px="md" py={50} size="xl">
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
            {/* LEFT COLUMN: ACTIVE STATUS */}
            <Stack gap="xl">
              <Stack gap={5}>
                <Title order={2} size={32}>
                  {t("user.manage.title")}
                </Title>
                <Text c="dimmed" size="sm">
                  {t("user.manage.subtitle")}
                </Text>
              </Stack>

              <Group align="stretch" grow>
                {/* COLUMN 1 */}
                <Stack gap="md" style={{ flex: 1 }}>
                  <Box style={{ flex: 1 }}>
                    <Title
                      order={4}
                      size="sm"
                      c={
                        scheme === "light"
                          ? "var(--upagain-dark-green)"
                          : "var(--upagain-light-green)"
                      }
                      tt="uppercase"
                      lts={1}
                    >
                      {t("user.manage.listings_title")}
                    </Title>
                    <Text size="sm" mt="xs">
                      <Trans
                        i18nKey="user.manage.listings_status"
                        ns="home"
                        values={{ count: accountStats?.total_listings ?? 0 }}
                        components={{
                          1: <Anchor href={PATHS.MARKETPLACE.HOME} />,
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
                    onClick={() => navigate(PATHS.MARKETPLACE.ME)}
                  >
                    {t("user.manage.manage_listings")}
                  </Text>
                </Stack>

                {/* COLUMN 2 */}
                <Stack gap="md" style={{ flex: 1 }}>
                  <Box style={{ flex: 1 }}>
                    <Title
                      order={4}
                      size="sm"
                      c={
                        scheme === "light"
                          ? "var(--upagain-dark-green)"
                          : "var(--upagain-light-green)"
                      }
                      tt="uppercase"
                      lts={1}
                    >
                      {t("user.manage.deposits_title")}
                    </Title>
                    <Text size="sm" mt="xs">
                      <Trans
                        i18nKey="user.manage.deposits_status"
                        ns="home"
                        values={{ count: accountStats?.total_deposits ?? 0 }}
                        components={{
                          1: <Anchor href={PATHS.MARKETPLACE.ME} />,
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
                    onClick={() => navigate(PATHS.MARKETPLACE.ME)}
                  >
                    {t("user.manage.track_deposits")}
                  </Text>
                </Stack>
              </Group>
            </Stack>

            {/* RIGHT COLUMN: QUICK ACTIONS */}
            <Stack gap="lg" justify="center">
              <Title order={3} ta="center">
                {t("user.manage.ready_to_do_more", {
                  username: accountDetails?.username,
                })}
              </Title>

              <Button
                className="button"
                data-variant="cta"
                size="lg"
                onClick={() => navigate(PATHS.MARKETPLACE.NEW)}
              >
                {t("user.manage.create_listing")}
              </Button>

              <Stack gap="xs">
                <Title order={3} ta="center">
                  {t("user.manage.explore_community")}
                </Title>
                <Group justify="center">
                  <Button
                    className="button"
                    data-variant="secondary"
                    size="sm"
                    onClick={() => navigate(PATHS.USER.POSTS.ALL)}
                  >
                    {t("user.manage.guides_projects")}
                  </Button>
                  <Button
                    className="button"
                    data-variant="secondary"
                    size="sm"
                    onClick={() => navigate(PATHS.EVENTS.HOME)}
                  >
                    {t("user.manage.workshops_events")}
                  </Button>
                </Group>
              </Stack>
            </Stack>
          </SimpleGrid>
        </Paper>
      </Container>

      {/* SECTION 4: COMMUNITY & AGENDA */}
      <Container
        id="onboard-community-events"
        px="md"
        py={50}
        size="xl"
        mb="xl"
      >
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
          {/* 4.1 COMMUNITY INSIGHTS */}
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
                  {t("user.community.highlights")}
                </Title>
                <Text c="dimmed" size="sm">
                  {t("user.community.highlights_desc")}
                </Text>
              </Stack>

              <Box style={{ flex: 1 }}>
                {posts.length > 0 ? (
                  <Stack gap="md">
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                      {posts.map((post) => (
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
                        />
                      ))}
                    </SimpleGrid>
                  </Stack>
                ) : (
                  <Center h="100%" style={{ minHeight: 200 }}>
                    <Stack align="center" gap="xs">
                      <IconLeaf
                        size={40}
                        color="var(--upagain-neutral-green)"
                        stroke={1.5}
                      />
                      <Text c="dimmed" ta="center" maw={300}>
                        {t("user.community.quiet_community")}
                      </Text>
                    </Stack>
                  </Center>
                )}
              </Box>

              <Button
                variant="secondary"
                className="button"
                data-variant="secondary"
                onClick={() => navigate(PATHS.USER.POSTS.ALL)}
                fullWidth
              >
                {t("user.community.discover_topics")}
              </Button>
            </Stack>
          </Paper>

          {/* 4.2 USER AGENDA */}
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
                  {t("user.agenda.title")}
                </Title>
                <Text c="dimmed" size="sm">
                  {t("user.agenda.subtitle")}
                </Text>
              </Stack>

              <Box style={{ flex: 1 }}>
                {myUpcomingEvents.length > 0 ? (
                  <Stack gap="md">
                    {myUpcomingEvents?.slice(0, 2).map((event) => (
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
                  <Center h="100%" style={{ minHeight: 200 }}>
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
                      >
                        {t("user.agenda.explore_workshops")}
                      </Button>
                    </Stack>
                  </Center>
                )}
              </Box>
            </Stack>
          </Paper>
        </SimpleGrid>
      </Container>
    </>
  );
}
