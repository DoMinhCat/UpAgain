import {
  Center,
  Text,
  Title,
  Stack,
  Group,
  SimpleGrid,
  Box,
  Container,
  Grid,
  List,
  Image,
  Paper,
  ThemeIcon,
  Button,
} from "@mantine/core";
import { HeroBanner } from "../../components/common/hero/HeroBanner";
import { useComputedColorScheme } from "@mantine/core";
import HeroBadge from "../../components/common/hero/HeroBadge";
import { useInViewport } from "@mantine/hooks";
import {
  IconArchive,
  IconBox,
  IconUpload,
  IconTruck,
  IconCircleCheck,
} from "@tabler/icons-react";
import HeroCard from "../../components/common/hero/HeroCard";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../routes/paths";

export default function GuestHome() {
  const navigate = useNavigate();
  const scheme = useComputedColorScheme("light");
  const cardHoverStyle = {
    transition:
      "transform 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease",
    cursor: "default",
  };

  const onCardEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = "translateY(-8px)";
    e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.12)";
    if (scheme !== "dark")
      e.currentTarget.style.borderColor = "var(--upagain-neutral-green)";
  };

  const onCardLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = "none";
    if (scheme !== "dark")
      e.currentTarget.style.borderColor = "var(--upagain-neutral-green)";
  };

  return (
    <>
      {/* SECTION 1: MAIN HERO */}
      <HeroBanner src={`/banners/guest-banner1-${scheme}.png`} height="80vh">
        <Stack
          align="center"
          gap="xs"
          style={{ animation: "fadeIn 1s ease-out" }}
        >
          <Title size={56} ta="center" style={{ lineHeight: 1.1 }}>
            Nothing is waste until you give up on it.
          </Title>
          <Text size="xl" fw={500} ta="center" maw={700} c="dimmed">
            One platform to share objects, create value, and reduce waste
            together.
          </Text>
          <Group mt="xl">
            <Button
              size="lg"
              variant="primary"
              onClick={() => navigate(PATHS.GUEST.REGISTER)}
              style={{ transition: "transform 0.2s ease" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              Join us today
            </Button>
            <Button size="lg" variant="secondary">
              See our articles
            </Button>
          </Group>
        </Stack>
      </HeroBanner>

      {/* SECTION 2: PROBLEM AWARENESS */}
      <Reveal>
        <HeroBanner src={`/banners/guest-banner2-${scheme}.png`} height="90vh">
          <Stack align="center" gap="md">
            <Title ta="center" size={42} fw={800}>
              The sad reality: waste is{" "}
              <Text
                span
                c="var(--upagain-yellow)"
                inherit
                style={{ textShadow: "0 0 15px rgba(252,186,3,0.3)" }}
              >
                everywhere
              </Text>
            </Title>
            <Text ta="center" size="lg" maw={600} c="dimmed">
              Every minute, tons of usable objects are thrown away while
              resources become scarcer.
            </Text>
            <Group gap="md" mt="xl">
              <HeroBadge text="More waste" height={32} />
              <HeroBadge text="Less resources" height={32} />
              <HeroBadge text="Climate change" height={32} />
            </Group>
          </Stack>
        </HeroBanner>
      </Reveal>

      {/* SECTION 3: THE MISSION */}
      <Reveal>
        <HeroBanner src={`/banners/guest-banner3-${scheme}.png`} height="100vh">
          {/* Decorative Background Glow */}
          <Box
            pos="absolute"
            w={300}
            h={300}
            bg="green.5"
            style={{
              filter: "blur(120px)",
              opacity: 0.07,
              top: "10%",
              left: "5%",
            }}
          />

          <Stack align="center" gap="xl">
            <Stack gap={0} align="center">
              <Title size={64} fw={900} variant="gradient">
                Meet UpAgain
              </Title>
              <Title order={2} size={28} ta="center" fw={600} mt="md">
                Reuse and upcycling made simple.
              </Title>
            </Stack>
            <Text size="lg" ta="center">
              A common space where we connect to give materials a second life.
            </Text>
          </Stack>
        </HeroBanner>
      </Reveal>

      {/* SECTION 4: HOW IT WORKS */}
      <Container px="md" py={100} size="xl">
        <Stack gap={80}>
          {/* STEP BLOCK 1 */}
          <Reveal>
            <Box
              p={{ base: "xl", md: 50 }}
              onMouseEnter={onCardEnter}
              onMouseLeave={onCardLeave}
              style={{
                ...cardHoverStyle,
                borderRadius: "32px",
                backgroundColor:
                  scheme === "dark"
                    ? "var(--upagain-dark-green)"
                    : "var(--upagain-light-green)",
                border: `1px solid ${scheme === "dark" ? "transparent" : "var(--upagain-neutral-green)"}`,
              }}
            >
              <Stack align="center" gap="xl">
                <HeroBadge text="1" height={48} />
                <Stack gap={4} align="center">
                  <Title order={2} size={32} ta="center">
                    Give or sell objects you no longer use
                  </Title>
                  <Text c="dimmed" fw={500}>
                    Simple actions, real impact.
                  </Text>
                </Stack>
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl" w="100%">
                  <HeroCard
                    scheme={scheme}
                    step={1}
                    title="Gather materials"
                    description="Find items you no longer need"
                    icon={<IconArchive size={32} />}
                  />
                  <HeroCard
                    scheme={scheme}
                    step={2}
                    title="Post announcement"
                    description="Upload details to the platform"
                    icon={<IconUpload size={32} />}
                  />
                  <HeroCard
                    scheme={scheme}
                    step={3}
                    title="Professional collection"
                    description="A pro will buy and collect it"
                    icon={<IconTruck size={32} />}
                  />
                </SimpleGrid>
              </Stack>
            </Box>
          </Reveal>

          {/* STEP BLOCK 2 */}
          <Reveal>
            <Box
              p={{ base: "xl", md: 50 }}
              onMouseEnter={onCardEnter}
              onMouseLeave={onCardLeave}
              style={{
                ...cardHoverStyle,
                borderRadius: "32px",
                backgroundColor:
                  scheme === "dark"
                    ? "var(--upagain-dark-green)"
                    : "var(--upagain-light-green)",
                border: `1px solid ${scheme === "dark" ? "transparent" : "var(--upagain-neutral-green)"}`,
              }}
            >
              <Stack align="center" gap="xl">
                <HeroBadge text="2" height={48} />
                <Stack gap={4} align="center">
                  <Title order={2} size={32} ta="center">
                    Smart container deposits
                  </Title>
                  <Text c="dimmed" fw={500} ta="center" maw={600}>
                    Don’t have time to meet? Deposit your objects in our smart
                    containers.
                  </Text>
                </Stack>
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl" w="100%">
                  <HeroCard
                    scheme={scheme}
                    step={1}
                    title="Request deposit"
                    description="We assess the object first"
                    icon={<IconUpload size={32} />}
                  />
                  <HeroCard
                    scheme={scheme}
                    step={2}
                    title="Secure drop-off"
                    description="Scan your code and deposit"
                    icon={<IconBox size={32} />}
                  />
                  <HeroCard
                    scheme={scheme}
                    step={3}
                    title="Final collection"
                    description="Pros collect from the hub"
                    icon={<IconTruck size={32} />}
                  />
                </SimpleGrid>
              </Stack>
            </Box>
          </Reveal>

          {/* STEP BLOCK 3 */}
          <Reveal>
            <Box
              p={{ base: "xl", md: 50 }}
              onMouseEnter={onCardEnter}
              onMouseLeave={onCardLeave}
              style={{
                ...cardHoverStyle,
                borderRadius: "32px",
                backgroundColor:
                  scheme === "dark"
                    ? "var(--upagain-dark-green)"
                    : "var(--upagain-light-green)",
                border: `1px solid ${scheme === "dark" ? "transparent" : "var(--upagain-neutral-green)"}`,
              }}
            >
              <Stack align="center" gap="xl">
                <HeroBadge text="3" height={48} />
                <Stack gap={4} align="center">
                  <Title order={2} size={32} ta="center">
                    A lively community
                  </Title>
                  <Text c="dimmed" fw={500} ta="center" maw={600}>
                    Discover our latest guides, events, workshops, and much more
                    !
                  </Text>
                </Stack>
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl" w="100%">
                  {/* TODO: 3 random articles */}
                  <Center h={100} w="100%" style={{ gridColumn: "1 / -1" }}>
                    <Text c="dimmed" fs="italic">
                      3 random articles coming soon...
                    </Text>
                  </Center>
                </SimpleGrid>
              </Stack>
            </Box>
          </Reveal>
        </Stack>
      </Container>

      {/* REGISTRATION CTA */}
      <Reveal>
        <Container size="xl" py={50}>
          <Paper
            p={{ base: "xl", md: 60 }}
            radius="32px"
            bg={
              scheme === "dark"
                ? "var(--upagain-dark-green)"
                : "var(--upagain-neutral-green)"
            }
            style={{
              boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* Animated Background Circle */}
            <Box
              pos="absolute"
              top={-50}
              right={-50}
              w={250}
              h={250}
              bg="white"
              style={{
                opacity: 0.1,
                borderRadius: "100%",
                animation: "pulse 4s infinite",
              }}
            />

            <Stack align="center" gap="xl" pos="relative" style={{ zIndex: 2 }}>
              <Stack gap={8} align="center">
                <Title
                  order={2}
                  size={42}
                  c="white"
                  ta="center"
                  style={{ lineHeight: 1.2 }}
                >
                  Are you hyped up to upcycle and save our planet?
                </Title>
                <Text c="green.1" size="xl" fw={500} ta="center" maw={600}>
                  Join a community of thousands making reuse the new standard.
                </Text>
              </Stack>
              <Group w="100%" justify="center">
                <Stack w={{ base: "100%", sm: 400 }} gap="xs">
                  <Button
                    size="xl"
                    radius="xl"
                    color="var(--upagain-yellow)"
                    c="dark.9"
                    fullWidth
                    onClick={() => navigate(PATHS.GUEST.REGISTER)}
                    style={{
                      fontSize: "1.1rem",
                      transition: "transform 0.2s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.transform = "scale(1.05)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = "scale(1)")
                    }
                  >
                    Join us today
                  </Button>
                </Stack>
              </Group>
            </Stack>
          </Paper>
        </Container>
      </Reveal>

      {/* PROFESSIONAL SECTION */}
      <Reveal>
        <Container size="xl" py={50}>
          <Stack gap={50} align="center" mt="xl">
            <Stack gap="xs" align="center">
              <Title order={2} size={42} ta="center" style={{ maxWidth: 800 }}>
                Are you a Professional or Artisan?
              </Title>
              <Text size="xl" c="dimmed" ta="center" fw={500}>
                Looking for materials for your next upcycling project?
              </Text>
            </Stack>
            <Grid gutter={40} align="stretch">
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Paper
                  p="xl"
                  radius="lg"
                  withBorder
                  h="100%"
                  bg={
                    scheme === "dark"
                      ? "var(--upagain-dark-green)"
                      : "var(--upagain-light-green)"
                  }
                >
                  <Stack justify="space-between" h="100%" gap="xl">
                    <Stack gap="md">
                      <Title order={3} size={24}>
                        Source with Precision
                      </Title>
                      <List
                        spacing="sm"
                        size="md"
                        icon={
                          <ThemeIcon
                            color="var(--upagain-neutral-green)"
                            size={24}
                            radius="xl"
                          >
                            <IconCircleCheck size={16} />
                          </ThemeIcon>
                        }
                      >
                        <List.Item>
                          Access to high-quality reusable materials
                        </List.Item>
                        <List.Item>
                          Smart alerts for specific material arrivals
                        </List.Item>
                        <List.Item>
                          Real-time impact and circularity analytics
                        </List.Item>
                        <List.Item>Premium dedicated dashboard</List.Item>
                      </List>
                    </Stack>
                    <Image
                      src="https://placehold.co/600x350?text=Dashboard+Preview"
                      radius="md"
                      alt="Dashboard"
                    />
                  </Stack>
                </Paper>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Paper
                  p="xl"
                  radius="lg"
                  withBorder
                  h="100%"
                  bg={
                    scheme === "dark"
                      ? "var(--upagain-dark-green)"
                      : "var(--upagain-light-green)"
                  }
                >
                  <Stack justify="space-between" h="100%" gap="xl">
                    <Stack gap="md">
                      <Title order={3} size={24}>
                        Grow Your Impact
                      </Title>
                      <List
                        spacing="sm"
                        size="md"
                        icon={
                          <ThemeIcon
                            color="var(--upagain-yellow)"
                            size={24}
                            radius="xl"
                          >
                            <IconCircleCheck size={16} />
                          </ThemeIcon>
                        }
                      >
                        <List.Item>
                          Promote your upcycling projects to our community
                        </List.Item>
                        <List.Item>
                          Reach new audiences interested in sustainability
                        </List.Item>
                        <List.Item>
                          Build local B2B and B2C partnerships
                        </List.Item>
                        <List.Item>
                          Track your impact via Upcycling Score
                        </List.Item>
                      </List>
                    </Stack>
                    <Image
                      src="https://placehold.co/600x350?text=Promoted+Projects+Preview"
                      radius="md"
                      alt="Projects"
                    />
                  </Stack>
                </Paper>
              </Grid.Col>
            </Grid>
            <Center mt="xl">
              <Button size="xl" radius="xl" variant="primary" px={50}>
                Sign up as a Professional
              </Button>
            </Center>
          </Stack>
        </Container>
      </Reveal>
    </>
  );
}

function Reveal({ children }: { children: React.ReactNode }) {
  const { ref, inViewport } = useInViewport();
  return (
    <Box
      ref={ref}
      style={{
        opacity: inViewport ? 1 : 0,
        transform: inViewport ? "translateY(0)" : "translateY(40px)",
        transition: "all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)",
      }}
    >
      {children}
    </Box>
  );
}
