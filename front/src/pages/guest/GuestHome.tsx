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
  Anchor,
  Button,
  ActionIcon,
  Divider,
} from "@mantine/core";
import { HeroBanner } from "../../components/common/hero/HeroBanner";
import { useComputedColorScheme } from "@mantine/core";
import HeroBadge from "../../components/common/hero/HeroBadge";
import {
  IconArchive,
  IconBox,
  IconUpload,
  IconTruck,
  IconCircleCheck,
  IconMail,
  IconMapPin,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandFacebook,
} from "@tabler/icons-react";
import HeroCard from "../../components/common/hero/HeroCard";

export default function GuestHome() {
  const scheme = useComputedColorScheme("light");

  return (
    <>
      {/* SECTION 1: MAIN HERO */}
      <HeroBanner src={`/banners/guest-banner1-${scheme}.png`} height="85vh">
        <Stack align="center" gap="xs">
          <Title size={56} ta="center" style={{ lineHeight: 1.1 }}>
            Nothing is waste until you give up on it.
          </Title>
          <Text size="xl" fw={500} ta="center" maw={700} c="dimmed">
            One platform to share objects, create value, and reduce waste
            together.
          </Text>
        </Stack>
      </HeroBanner>

      {/* SECTION 2: PROBLEM AWARENESS */}
      <HeroBanner src={`/banners/guest-banner2-${scheme}.png`} height="100vh">
        <Stack align="center" gap="md">
          <Title ta="center" size={42} fw={800}>
            The sad reality: waste is{" "}
            <Text span c="var(--upagain-yellow)" inherit>
              everywhere
            </Text>
          </Title>
          <Text ta="center" size="lg" maw={600} c="dimmed">
            Every minute, tons of usable objects are thrown away while resources
            become scarcer.
          </Text>

          <Group gap="md" mt="xl">
            <HeroBadge text="More waste" height={32} />
            <HeroBadge text="Less resources" height={32} />
            <HeroBadge text="Climate change" height={32} />
          </Group>
        </Stack>
      </HeroBanner>

      {/* SECTION 3: THE MISSION */}
      <HeroBanner src={`/banners/guest-banner3-${scheme}.png`} height="100vh">
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

      {/* SECTION 4: HOW IT WORKS (CONTAINED) */}
      <Container px="md" py={100} size="xl">
        <Stack gap={80}>
          {" "}
          {/* STEP BLOCK 1 */}
          <Box
            p={{ base: "xl", md: 50 }}
            style={{
              borderRadius: "32px", // Softer, more modern radius
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
          {/* STEP BLOCK 2 */}
          <Box
            p={{ base: "xl", md: 50 }}
            style={{
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
          {/* STEP BLOCK 3 COMMUNITY */}
          <Box
            p={{ base: "xl", md: 50 }}
            style={{
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
                  A lively community{" "}
                </Title>
                <Text c="dimmed" fw={500} ta="center" maw={600}>
                  Discover our latest guides, events, workshops, and much more !
                </Text>
              </Stack>

              <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl" w="100%">
                {/* TODO: 3 random articles */}3 random articles
              </SimpleGrid>
            </Stack>
          </Box>
        </Stack>
      </Container>

      <Container size="xl" py={100}>
        <Stack gap={50} align="center">
          {/* Section Heading */}
          <Stack gap="xs" align="center">
            <Title order={2} size={42} ta="center" style={{ maxWidth: 800 }}>
              Are you a Professional or Artisan?
            </Title>
            <Text size="xl" c="dimmed" ta="center" fw={500}>
              Looking for materials for your next upcycling project?
            </Text>
          </Stack>

          <Grid gutter={40} align="stretch">
            {/* Left Column: Materials & Analytics */}
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
                      center
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
                    alt="Professional Dashboard Preview"
                    fallbackSrc="https://placehold.co/600x350"
                  />
                </Stack>
              </Paper>
            </Grid.Col>

            {/* Right Column: Promotion & Partnerships */}
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
                      center
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
                    alt="Promoted Projects Preview"
                    fallbackSrc="https://placehold.co/600x350"
                  />
                </Stack>
              </Paper>
            </Grid.Col>
          </Grid>

          {/* Final CTA */}
          <Center mt="xl">
            <Button size="xl" radius="xl" variant="primary" px={50}>
              Sign up as a Professional
            </Button>
          </Center>
        </Stack>
      </Container>

      {/* FOOTER */}
      <Box
        component="footer"
        pt={80}
        pb={40}
        bg={
          scheme === "dark"
            ? "var(--upagain-dark-green)"
            : "var(--upagain-neutral-green)"
        }
        style={{
          borderTop: `1px solid ${scheme === "dark" ? "var(--mantine-color-dark-7)" : "var(--mantine-color-gray-2)"}`,
        }}
      >
        <Container size="xl">
          <Grid gutter={50}>
            {/* Column 1: Company Description */}
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Stack gap="md">
                <Title order={3} size="h3" fw={900}>
                  UpAgain
                </Title>
                <Text
                  size="sm"
                  lh={1.6}
                  c={
                    scheme === "dark" ? "#c7c7c7" : "var(--mantine-color-text)"
                  }
                >
                  Giving materials a second life through community-driven reuse
                  and smart logistics. We connect people and professionals to
                  ensure that nothing is waste until we give up on it.
                </Text>
                <Group gap="xs">
                  <ActionIcon
                    size="lg"
                    radius="xl"
                    color={
                      scheme === "dark"
                        ? "var(--upagain-neutral-green)"
                        : "var(--upagain-dark-green)"
                    }
                  >
                    <IconBrandInstagram size={18} />
                  </ActionIcon>
                  <ActionIcon
                    size="lg"
                    radius="xl"
                    color={
                      scheme === "dark"
                        ? "var(--upagain-neutral-green)"
                        : "var(--upagain-dark-green)"
                    }
                  >
                    <IconBrandLinkedin size={18} />
                  </ActionIcon>
                  <ActionIcon
                    size="lg"
                    radius="xl"
                    color={
                      scheme === "dark"
                        ? "var(--upagain-neutral-green)"
                        : "var(--upagain-dark-green)"
                    }
                  >
                    <IconBrandFacebook size={18} />
                  </ActionIcon>
                </Group>
              </Stack>
            </Grid.Col>

            {/* Column 2: Explore */}
            <Grid.Col span={{ base: 6, sm: 4, md: 2 }}>
              <Text fw={700} mb="lg" size="sm" tt="uppercase">
                Explore
              </Text>
              <Stack gap="xs">
                <Anchor
                  href="#"
                  size="sm"
                  c={
                    scheme === "dark" ? "#c7c7c7" : "var(--mantine-color-text)"
                  }
                  underline="hover"
                >
                  Browse Objects On Sale
                </Anchor>
                <Anchor
                  href="#"
                  size="sm"
                  c={
                    scheme === "dark" ? "#c7c7c7" : "var(--mantine-color-text)"
                  }
                  underline="hover"
                >
                  Smart Deposits
                </Anchor>
                <Anchor
                  href="#"
                  size="sm"
                  c={
                    scheme === "dark" ? "#c7c7c7" : "var(--mantine-color-text)"
                  }
                  underline="hover"
                >
                  Community Articles
                </Anchor>
                <Anchor
                  href="#"
                  size="sm"
                  c={
                    scheme === "dark" ? "#c7c7c7" : "var(--mantine-color-text)"
                  }
                  underline="hover"
                >
                  Events and Workshops
                </Anchor>
              </Stack>
            </Grid.Col>

            {/* Column 3: Contact Info */}
            <Grid.Col span={{ base: 6, sm: 4, md: 3 }}>
              <Text fw={700} mb="lg" size="sm" tt="uppercase">
                Contact
              </Text>
              <Stack gap="sm">
                <Group gap="xs" wrap="nowrap" align="flex-start">
                  <IconMail
                    size={16}
                    color={
                      scheme === "dark"
                        ? "#c7c7c7"
                        : "var(--mantine-color-text)"
                    }
                  />
                  <Anchor
                    href="mailto:support@upagain.com"
                    size="sm"
                    c={
                      scheme === "dark"
                        ? "#c7c7c7"
                        : "var(--mantine-color-text)"
                    }
                  >
                    support@upagain.com
                  </Anchor>
                </Group>
                <Group gap="xs" wrap="nowrap" align="flex-start">
                  <IconMapPin
                    size={16}
                    color={
                      scheme === "dark"
                        ? "#c7c7c7"
                        : "var(--mantine-color-text)"
                    }
                  />
                  <Text
                    size="sm"
                    c={
                      scheme === "dark"
                        ? "#c7c7c7"
                        : "var(--mantine-color-text)"
                    }
                  >
                    21 Erard street, 75012 Paris, France
                  </Text>
                </Group>
              </Stack>
            </Grid.Col>

            {/* Column 4: Legals */}
            <Grid.Col span={{ base: 12, sm: 4, md: 3 }}>
              <Text fw={700} mb="lg" size="sm" tt="uppercase">
                Legal
              </Text>
              <Stack gap="xs">
                <Anchor
                  href="#"
                  size="sm"
                  c={
                    scheme === "dark" ? "#c7c7c7" : "var(--mantine-color-text)"
                  }
                  underline="hover"
                >
                  Terms & Conditions
                </Anchor>
                <Anchor
                  href="#"
                  size="sm"
                  c={
                    scheme === "dark" ? "#c7c7c7" : "var(--mantine-color-text)"
                  }
                  underline="hover"
                >
                  Privacy Policy
                </Anchor>
                <Anchor
                  href="#"
                  size="sm"
                  c={
                    scheme === "dark" ? "#c7c7c7" : "var(--mantine-color-text)"
                  }
                  underline="hover"
                >
                  Cookie Settings
                </Anchor>
              </Stack>
            </Grid.Col>
          </Grid>

          <Divider
            my="xl"
            label={`© ${new Date().getFullYear()} UpAgain. All rights reserved.`}
            labelPosition="center"
          />
        </Container>
      </Box>
    </>
  );
}
