import { HeroBanner } from "../../components/common/hero/HeroBanner";
import {
  Anchor,
  Button,
  Container,
  Divider,
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
  Badge,
  ThemeIcon,
  Box,
  Progress,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useAccountDetails } from "../../hooks/accountHooks";
import FullScreenLoader from "../../components/common/FullScreenLoader";
import { useAuth } from "../../context/AuthContext";
import { ScoreRing } from "../../components/user/ScoreRing";
import { IconLeaf, IconDroplet, IconTrophy } from "@tabler/icons-react";
import { PATHS } from "../../routes/paths";
import PostCard from "../../components/common/event/PostCard";

export default function UserHome() {
  const navigate = useNavigate();
  const scheme = useComputedColorScheme("light");
  const { user } = useAuth();

  // GET ACCOUNT INFO
  const { data: accountDetails, isLoading: isLoadingAccountDetails } =
    useAccountDetails(user?.id || 0);
  const magicNumberWater = 4500;
  const magicNumberElectricity = 820;
  // const calculatedWater = ((accountDetails?.totalWaterSaved || 0) / (accountDetails?.totalWaterSaved ?? 1 + magicNumberWater)) * 100;
  // const calculatedElectricity = ((accountDetails?.totalElectricitySaved || 0) / (accountDetails?.totalElectricitySaved ?? 1 + magicNumberElectricity)) * 100;

  // SAMPLES
  const SAMPLE_POSTS = {
    title: "How to upcycle old wooden pallets into a vertical garden",
    description:
      "In this guide, we explore the step-by-step process of transforming industrial waste into a beautiful, functional green wall for your balcony.",
    image: "/banners/user-banner1-light.png",
    category: "Workshop",
    authorName: "Arnaud Petit",
    authorAvatar:
      "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-1.png",
    postedTime: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
    views: 1240,
    likes: 85,
  };
  const UPCOMING_EVENTS_MOCK = [
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
            Hi {accountDetails?.username}, let's <br /> Save the Planet, One
            Piece at a Time.
          </Title>
          <Text size="xl" fw={500} ta="center" maw={700} c="dimmed">
            One platform to share objects, create value, and reduce waste
            together.
          </Text>
        </Stack>
      </HeroBanner>

      {/* SECTION 2: YOUR IMPACT */}
      <Container px="md" py={50} size="xl">
        <Stack gap="xl">
          {/* Section Header */}
          <Stack gap={0}>
            <Title order={2} size={32} c="var(--mantine-color-text)">
              Your impact so far
            </Title>
            <Text c="dimmed" size="sm">
              Real-time tracking of your environmental contribution
            </Text>
          </Stack>

          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
            {/* CARD 1: CO2 IMPACT */}
            <Paper
              variant="primary"
              p="xl"
              radius="lg"
              style={{
                transition: "transform 0.2s ease",
                borderLeft: "4px solid var(--upagain-neutral-green)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-4px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              <Stack gap="md" align="center">
                <Group justify="space-between" w="100%">
                  <Text size="xs" fw={700} tt="uppercase">
                    Total CO² saved
                  </Text>
                  <ThemeIcon
                    variant="light"
                    color="var(--upagain-neutral-green)"
                    radius="md"
                  >
                    <IconLeaf size={18} />
                  </ThemeIcon>
                </Group>

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
                    That is about 1 Elephant!
                  </Text>
                </Box>
              </Stack>
            </Paper>

            {/* CARD 2: RESOURCES */}
            <Paper
              variant="primary"
              p="xl"
              radius="lg"
              style={{
                transition: "transform 0.2s ease",
                borderLeft: "4px solid var(--upagain-yellow)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-4px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              <Stack gap="md">
                <Group justify="space-between">
                  <Text size="xs" fw={700} tt="uppercase">
                    Resources saved
                  </Text>
                  <ThemeIcon
                    variant="light"
                    color="var(--upagain-yellow)"
                    radius="md"
                  >
                    <IconDroplet size={18} />
                  </ThemeIcon>
                </Group>

                <Stack gap="xs" mt="sm">
                  <Group justify="space-between">
                    <Text size="sm" fw={500}>
                      Water
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
                      Electricity
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
              </Stack>
            </Paper>

            {/* CARD 3: SCORE */}
            <Paper
              variant="primary"
              p="xl"
              radius="lg"
              style={{
                transition: "transform 0.2s ease",
                borderLeft: "4px solid var(--upagain-light-green)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-4px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              <Stack gap="md" align="center">
                <Group justify="space-between" w="100%">
                  <Text size="xs" fw={700} tt="uppercase">
                    Upcycling Score
                  </Text>
                  <ThemeIcon
                    variant="light"
                    color="var(--upagain-neutral-green)"
                    radius="md"
                  >
                    <IconTrophy size={18} />
                  </ThemeIcon>
                </Group>

                <Box pos="relative" my="sm">
                  <ScoreRing score={99} size={140} />
                </Box>
                <Text size="xs" c="dimmed" ta="center">
                  Top 99999% of Upcyclers this month!
                </Text>
              </Stack>
            </Paper>
          </SimpleGrid>
        </Stack>
      </Container>

      <Title ta="center" order={2} my="md">
        Altogether we saved{" "}
        <Text
          span
          c="var(--upagain-yellow)"
          inherit
          style={{ textShadow: "0 0 15px rgba(252,186,3,0.3)" }}
        >
          {/* {accountDetails?.totalWaterSaved}  */}
          123456789+{" "}
        </Text>
        kg of CO2
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
                  My active objects
                </Title>
                <Text c="dimmed" size="sm">
                  Track your ongoing contributions to the circular economy.
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
                    Listings
                  </Title>
                  <Text size="sm">
                    You have <b>3 active</b> items in the{" "}
                    <Anchor href={PATHS.MARKETPLACE.LISTINGS}>
                      Marketplace
                    </Anchor>
                    .
                  </Text>
                  <Text
                    className="text"
                    data-variant="primary"
                    size="sm"
                    fw={700}
                    onClick={() => navigate(PATHS.MARKETPLACE.LISTINGS)}
                  >
                    Manage all listings →
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
                    Deposits
                  </Title>
                  <Text size="sm">
                    <b>1 object</b> to be delivered.
                  </Text>
                  <Text
                    className="text"
                    data-variant="primary"
                    size="sm"
                    fw={700}
                    onClick={() => navigate(PATHS.MARKETPLACE.DEPOSITS)}
                  >
                    Track all my deposits →
                  </Text>
                </Stack>
              </Group>
            </Stack>

            {/* RIGHT COLUMN: QUICK ACTIONS */}
            <Stack gap="lg" justify="center">
              <Title order={3} ta="center">
                Ready to do more, {accountDetails?.username}?
              </Title>

              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <Button
                  className="button"
                  data-variant="primary"
                  size="lg"
                  onClick={() => navigate(PATHS.MARKETPLACE.LISTINGS)}
                >
                  Create a listing
                </Button>
                <Button
                  className="button"
                  data-variant="cta" // Golden shine for creating deposits
                  size="lg"
                  onClick={() => navigate(PATHS.MARKETPLACE.DEPOSITS)}
                >
                  Create a deposit
                </Button>
              </SimpleGrid>

              <Stack gap="xs">
                <Title order={3} ta="center">
                  Explore the community
                </Title>
                <Group justify="center">
                  <Button
                    className="button"
                    data-variant="secondary"
                    size="sm"
                    onClick={() => navigate(PATHS.MARKETPLACE.DEPOSITS)}
                  >
                    Guides & Projects
                  </Button>
                  <Button
                    className="button"
                    data-variant="secondary"
                    size="sm"
                    onClick={() => navigate(PATHS.MARKETPLACE.DEPOSITS)}
                  >
                    Workshops & Events
                  </Button>
                </Group>
              </Stack>
            </Stack>
          </SimpleGrid>
        </Paper>
      </Container>

      {/* SECTION 4: COMMUNITY */}
      <Container px="md" py={50} size="xl">
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <Stack>
            <Title order={2} size={32}>
              From the Community
            </Title>
            {/* Cards of sponsored or latest posts */}
          </Stack>
          <Stack gap="xl">
            <Title order={2} size={32}>
              Your upcoming events ({UPCOMING_EVENTS_MOCK.length})
            </Title>

            {UPCOMING_EVENTS_MOCK.length > 0 ? (
              <>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  {/* 2 CARDS MAX RULE */}
                  {UPCOMING_EVENTS_MOCK.slice(0, 2).map((event) => (
                    <PostCard
                      key={event.id}
                      title={event.title}
                      description={event.description}
                      image={event.image}
                      category={event.category}
                      authorName={event.authorName}
                      authorAvatar={event.authorAvatar}
                      postedTime={event.postedTime}
                      views={event.views}
                      likes={event.likes}
                    />
                  ))}
                </SimpleGrid>
                {UPCOMING_EVENTS_MOCK.length > 0 && (
                  <Text
                    className="text"
                    data-variant="primary"
                    size="sm"
                    fw={700}
                    mt={0}
                    onClick={() => navigate("#")}
                  >
                    See all of my events →
                  </Text>
                )}
              </>
            ) : (
              /* EMPTY STATE - Placeholder */
              <Paper
                className="paper"
                data-variant="primary"
                p="xl"
                radius="lg"
                style={{ borderStyle: "dashed", textAlign: "center" }}
              >
                <Stack align="center" gap="md">
                  <Text c="dimmed" fw={500}>
                    You have no upcoming events planned yet.
                  </Text>
                  <Button
                    className="button"
                    data-variant="cta" // Catchy yellow shine to encourage engagement
                    size="md"
                    onClick={() => navigate("#")}
                  >
                    Discover exciting events
                  </Button>
                </Stack>
                {/* TODO: Integrate fetch for suggested local events here if count == 0 */}
              </Paper>
            )}
          </Stack>
        </SimpleGrid>
      </Container>
    </>
  );
}
