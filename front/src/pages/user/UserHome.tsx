import { HeroBanner } from "../../components/hero/HeroBanner";
import {
  Anchor,
  Button,
  Container,
  Group,
  Image,
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
import { useAccountDetails } from "../../hooks/accountHooks";
import FullScreenLoader from "../../components/common/FullScreenLoader";
import { useAuth } from "../../context/AuthContext";
import { ScoreRing } from "../../components/score/ScoreRing";
import { IconLeaf, IconDroplet, IconTrophy } from "@tabler/icons-react";
import { PATHS } from "../../routes/paths";
import PostCard from "../../components/post/PostCard";
import { EventCard } from "../../components/event/EventCard";
import { DashboardCard } from "../../components/dashboard/DashboardCard";
import { useHandleStripeEventRegistration } from "../../hooks/stripeHooks";

export default function UserHome() {
  const { t } = useTranslation("home");
  const navigate = useNavigate();
  const scheme = useComputedColorScheme("light");
  const { user } = useAuth();

  useHandleStripeEventRegistration();

  // GET ACCOUNT INFO
  const { data: accountDetails, isLoading: isLoadingAccountDetails } =
    useAccountDetails(user?.id || 0);
  // const magicNumberWater = 4500;
  // const magicNumberElectricity = 820;
  // const calculatedWater = ((accountDetails?.totalWaterSaved || 0) / (accountDetails?.totalWaterSaved ?? 1 + magicNumberWater)) * 100;
  // const calculatedElectricity = ((accountDetails?.totalElectricitySaved || 0) / (accountDetails?.totalElectricitySaved ?? 1 + magicNumberElectricity)) * 100;

  // SAMPLES
  // const SAMPLE_POSTS = {
  //   title: "How to upcycle old wooden pallets into a vertical garden",
  //   description:
  //     "In this guide, we explore the step-by-step process of transforming industrial waste into a beautiful, functional green wall for your balcony.",
  //   image: "/banners/user-banner1-light.png",
  //   category: "Workshop",
  //   authorName: "Arnaud Petit",
  //   authorAvatar:
  //     "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-1.png",
  //   postedTime: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
  //   views: 1240,
  //   likes: 85,
  // };
  const POST_MOCK = [
    {
      id: "evt-1",
      title: "Community Woodworking Workshop",
      description:
        "Learn how to build modular shelving units from salvaged pine. Tools and safety gear provided by UpAgain.",
      image: "/banners/user-banner1-light.png",
      category: "Workshop",
      authorName: "Marcus Wood",
      authorAvatar:
        "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-9.png",
      postedTime: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
      views: 450,
      likes: 32,
    },
    {
      id: "evt-2",
      title: "Textile Repair & Embroidery Café",
      description:
        "Don't throw away those torn jeans! Join us for a session on visible mending and creative embroidery techniques.",
      image: "/banners/user-banner1-dark.png",
      category: "Meetup",
      authorName: "Elena Stitch",
      authorAvatar:
        "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-6.png",
      postedTime: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      views: 890,
      likes: 156,
    },
    {
      id: "evt-3",
      title: "Zero Waste Cooking Class",
      description:
        "Master the art of root-to-leaf cooking and reduce your weekly organic waste significantly.",
      image: "/banners/user-banner1-light.png",
      category: "Education",
      authorName: "Chef Julian",
      authorAvatar:
        "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-3.png",
      postedTime: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
      views: 1100,
      likes: 210,
    },
  ];
  if (isLoadingAccountDetails) {
    return <FullScreenLoader />;
  }
  return (
    <>
      <HeroBanner
        src={`/banners/user-banner1-${scheme}.png`}
        height="80vh"
        style={{
          // We start the fade much later (at 85%) so it's only at the very edge
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
            // Moves content up by shifting the flex alignment or adding a bottom "spacer"
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
      <Container px="md" py={50} size="xl">
        <Stack gap="xl">
          {/* Section Header */}
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
                  1,240{" "}
                  <Text span size="xl" fw={500}>
                    kg
                  </Text>
                </Text>
              </Stack>

              <Box pos="relative" py="sm">
                <Image
                  src="/banners/user-banner1-light.png"
                  height={80}
                  width={80}
                  style={{ filter: "grayscale(1) opacity(0.3)" }}
                />
                {/* Catchy Overlay Text */}
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
                  {t("user.impact.elephant_comparison")}
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
                    4,500 L
                  </Text>
                </Group>
                <Progress
                  value={75}
                  color="var(--upagain-neutral-green)"
                  size="sm"
                  radius="xl"
                />

                <Group justify="space-between" mt="xs">
                  <Text size="sm" fw={500}>
                    {t("user.impact.electricity")}
                  </Text>
                  <Text size="sm" fw={700} c="var(--upagain-yellow)">
                    820 kWh
                  </Text>
                </Group>
                <Progress
                  value={40}
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
                <ScoreRing score={99} size={140} />
              </Box>
              <Text size="xs" c="dimmed" ta="center">
                {t("user.impact.score_rank", { percentage: 99 })}
              </Text>
            </DashboardCard>
          </SimpleGrid>
        </Stack>
      </Container>

      <Title ta="center" order={2} my="md">
        <Trans
          i18nKey="user.impact.altogether_saved"
          ns="home"
          values={{ amount: "123,456,789+" }}
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
        >
          Altogether we saved{" "}
          <Text
            span
            c="var(--upagain-yellow)"
            inherit
            style={{ textShadow: "0 0 15px rgba(252,186,3,0.3)" }}
          >
            123,456,789+
          </Text>{" "}
          kg of CO2
        </Trans>
      </Title>

      {/* SECTION 3: MANAGE OBJECTS */}
      <Container px="md" py={50} size="xl">
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

              <Group align="flex-start" grow>
                <Stack gap="md">
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
                  <Text size="sm">
                    <Trans
                      i18nKey="user.manage.listings_status"
                      ns="home"
                      values={{ count: 3 }}
                      components={{
                        1: <Anchor href={PATHS.MARKETPLACE.LISTINGS} />,
                        b: <b />,
                      }}
                    >
                      You have <b>3 active</b> items in the{" "}
                      <Anchor href={PATHS.MARKETPLACE.LISTINGS}>
                        Marketplace
                      </Anchor>
                      .
                    </Trans>
                  </Text>
                  <Text
                    className="text"
                    data-variant="primary"
                    size="sm"
                    fw={700}
                    onClick={() => navigate(PATHS.MARKETPLACE.LISTINGS)}
                  >
                    {t("user.manage.manage_listings")}
                  </Text>
                </Stack>

                <Stack gap="md">
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
                  <Text size="sm">
                    {t("user.manage.deposits_status", { count: 1 })}
                  </Text>
                  <Text
                    className="text"
                    data-variant="primary"
                    size="sm"
                    fw={700}
                    onClick={() => navigate(PATHS.MARKETPLACE.DEPOSITS)}
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

              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <Button
                  className="button"
                  data-variant="cta-reverse"
                  size="lg"
                  onClick={() => navigate(PATHS.MARKETPLACE.LISTINGS)}
                >
                  {t("user.manage.create_listing")}
                </Button>
                <Button
                  className="button"
                  data-variant="cta" // Golden shine for creating deposits
                  size="lg"
                  onClick={() => navigate(PATHS.MARKETPLACE.DEPOSITS)}
                >
                  {t("user.manage.create_deposit")}
                </Button>
              </SimpleGrid>

              <Stack gap="xs">
                <Title order={3} ta="center">
                  {t("user.manage.explore_community")}
                </Title>
                <Group justify="center">
                  <Button
                    className="button"
                    data-variant="secondary"
                    size="sm"
                    onClick={() => navigate(PATHS.MARKETPLACE.DEPOSITS)}
                  >
                    {t("user.manage.guides_projects")}
                  </Button>
                  <Button
                    className="button"
                    data-variant="secondary"
                    size="sm"
                    onClick={() => navigate(PATHS.MARKETPLACE.DEPOSITS)}
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
      <Container px="md" py={50} size="xl" mb="xl">
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
                {/* 
                  BACKEND LOGIC:
                  The backend should ideally provide a 'featured' or 'community_selection' list.
                  If the user has specific interests, this could be filtered by tags.
                */}
                {POST_MOCK && POST_MOCK.length > 0 ? (
                  <Stack gap="md">
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                      {/* We display max 2 posts to keep the layout clean */}
                      {POST_MOCK.slice(0, 2).map((post) => (
                        <PostCard
                          key={post.id}
                          title={post.title}
                          description={post.description}
                          image={post.image}
                          category={post.category}
                          authorName={post.authorName}
                          authorAvatar={post.authorAvatar}
                          postedTime={post.postedTime}
                          views={post.views}
                          likes={post.likes}
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
                onClick={() => navigate(PATHS.MARKETPLACE.LISTINGS)}
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
                {/* 
                  BACKEND LOGIC:
                  Render event cards if 'accountDetails.registeredEvents' (or similar) is not empty.
                  Else, render the CTA below to encourage participation.
                */}
                {/* PLACEHOLDER: Assuming accountDetails has an 'events' array in the future */}
                {accountDetails?.id && false ? ( // Replace 'false' with 'accountDetails.events.length > 0'
                  <Stack gap="md">
                    <EventCard
                      onclick={() => navigate("/events/workshops/1")}
                      orientation="horizontal"
                      category="Workshop"
                      title="Restoring Mid-Century Furniture"
                      description="Learn sanding, staining, and finishing techniques."
                      image="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158"
                      authorName="Thomas L."
                      authorAvatar="..."
                      createdAt={new Date().toISOString()}
                      eventDate="2026-05-12T10:00:00Z"
                      price={15}
                      registeredCount={99}
                      city="Paris"
                      postalCode="75012"
                    />
                    {/* Add more cards selectively if returned by backend */}
                    <Text
                      className="text"
                      data-variant="primary"
                      size="sm"
                      fw={700}
                      onClick={() => navigate("#")}
                    >
                      View all my events →
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
                        onClick={() => navigate(PATHS.MARKETPLACE.DEPOSITS)} // Assuming event exploration is there
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
