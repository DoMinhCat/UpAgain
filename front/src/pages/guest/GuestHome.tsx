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
import { useTranslation } from "react-i18next";
import { HeroBanner } from "../../components/hero/HeroBanner";
import { useComputedColorScheme } from "@mantine/core";
import HeroBadge from "../../components/hero/HeroBadge";
import { useInViewport } from "@mantine/hooks";
import {
  IconArchive,
  IconBox,
  IconUpload,
  IconTruck,
  IconCircleCheck,
} from "@tabler/icons-react";
import HeroCard from "../../components/hero/HeroCard";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../routes/paths";
import classes from "../../styles/GlobalStyles.module.css";

export default function GuestHome() {
  const { t } = useTranslation("home");
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
      <HeroBanner
        src={`/banners/guest-banner1-${scheme}.png`}
        height="80vh"
        style={{
          maskImage:
            "linear-gradient(to bottom, black 0%, black 80%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, black 80%, transparent 100%)",
        }}
      >
        <Stack
          align="center"
          gap="xs"
          style={{ animation: "fadeIn 1s ease-out" }}
        >
          <Title size={56} ta="center" style={{ lineHeight: 1.1 }}>
            {t("guest.hero_title")}
          </Title>
          <Text size="xl" fw={500} ta="center" maw={700} c="dimmed">
            {t("guest.hero_desc")}
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
              {t("guest.cta_join")}
            </Button>
            <Button size="lg" variant="secondary">
              {t("guest.cta_articles")}
            </Button>
          </Group>
        </Stack>
      </HeroBanner>

      {/* SECTION 2: PROBLEM AWARENESS */}
      <Reveal>
        <HeroBanner
          src={`/banners/guest-banner2-${scheme}.png`}
          height="90vh"
          style={{
            maskImage:
              "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
          }}
        >
          <Stack align="center" gap="md">
            <Title ta="center" size={42} fw={800}>
              {t("guest.reality_title").split(":")[0]}:{" "}
              <Text
                span
                c="var(--upagain-yellow)"
                inherit
                style={{ textShadow: "0 0 15px rgba(252,186,3,0.3)" }}
              >
                {t("guest.reality_title").split(":")[1]?.trim()}
              </Text>
            </Title>
            <Text ta="center" size="lg" maw={600} c="dimmed">
              {t("guest.reality_desc")}
            </Text>
            <Group gap="md" mt="xl">
              <HeroBadge text={t("guest.badge_waste")} height={32} />
              <HeroBadge text={t("guest.badge_resources")} height={32} />
              <HeroBadge text={t("guest.badge_climate")} height={32} />
            </Group>
          </Stack>
        </HeroBanner>
      </Reveal>

      {/* SECTION 3: THE MISSION */}
      <Reveal>
        <HeroBanner
          src={`/banners/guest-banner3-${scheme}.png`}
          height="100vh"
          style={{
            maskImage:
              "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
          }}
        >
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
                {t("guest.mission_title")}
              </Title>
              <Title order={2} size={28} ta="center" fw={600} mt="md">
                {t("guest.mission_subtitle")}
              </Title>
            </Stack>
            <Text size="lg" ta="center">
              {t("guest.mission_desc")}
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
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Box
                pos="absolute"
                top={-80}
                left={-80}
                w={300}
                h={300}
                bg={
                  scheme === "dark" ? "white" : "var(--upagain-neutral-green)"
                }
                style={{
                  borderRadius: "100%",
                  opacity: scheme === "dark" ? 0.03 : 0.15,
                  animation: `${classes.pulse} 6s infinite ease-in-out`,
                  animationDelay: "0.2s",
                }}
              />
              <Stack
                align="center"
                gap="xl"
                pos="relative"
                style={{ zIndex: 2 }}
              >
                <HeroBadge text="1" height={48} />
                <Stack gap={4} align="center">
                  <Title order={2} size={32} ta="center">
                    {t("guest.step1_title")}
                  </Title>
                  <Text c="dimmed" fw={500}>
                    {t("guest.step1_subtitle")}
                  </Text>
                </Stack>
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl" w="100%">
                  <HeroCard
                    scheme={scheme}
                    step={1}
                    title={t("guest.step1_card1_title")}
                    description={t("guest.step1_card1_desc")}
                    icon={<IconArchive size={32} />}
                  />
                  <HeroCard
                    scheme={scheme}
                    step={2}
                    title={t("guest.step1_card2_title")}
                    description={t("guest.step1_card2_desc")}
                    icon={<IconUpload size={32} />}
                  />
                  <HeroCard
                    scheme={scheme}
                    step={3}
                    title={t("guest.step1_card3_title")}
                    description={t("guest.step1_card3_desc")}
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
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Box
                pos="absolute"
                top={-60}
                right={-60}
                w={300}
                h={300}
                bg={
                  scheme === "dark" ? "white" : "var(--upagain-neutral-green)"
                }
                style={{
                  opacity: scheme === "dark" ? 0.03 : 0.15,
                  borderRadius: "100%",
                  animationDelay: "0.1s",
                  animation: `${classes.pulse} 5s infinite reverse`,
                }}
              />
              <Stack
                align="center"
                gap="xl"
                pos="relative"
                style={{ zIndex: 2 }}
              >
                <HeroBadge text="2" height={48} />
                <Stack gap={4} align="center">
                  <Title order={2} size={32} ta="center">
                    {t("guest.step2_title")}
                  </Title>
                  <Text c="dimmed" fw={500} ta="center" maw={600}>
                    {t("guest.step2_subtitle")}
                  </Text>
                </Stack>
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl" w="100%">
                  <HeroCard
                    scheme={scheme}
                    step={1}
                    title={t("guest.step2_card1_title")}
                    description={t("guest.step2_card1_desc")}
                    icon={<IconUpload size={32} />}
                  />
                  <HeroCard
                    scheme={scheme}
                    step={2}
                    title={t("guest.step2_card2_title")}
                    description={t("guest.step2_card2_desc")}
                    icon={<IconBox size={32} />}
                  />
                  <HeroCard
                    scheme={scheme}
                    step={3}
                    title={t("guest.step2_card3_title")}
                    description={t("guest.step2_card3_desc")}
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
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Box
                pos="absolute"
                bottom={-90}
                right={-10}
                w={300}
                h={300}
                bg={
                  scheme === "dark" ? "white" : "var(--upagain-neutral-green)"
                }
                style={{
                  opacity: scheme === "dark" ? 0.03 : 0.15,
                  animationDelay: "0.8s",
                  borderRadius: "100%",
                  animation: `${classes.pulse} 4s infinite`,
                }}
              />
              <Stack
                align="center"
                gap="xl"
                pos="relative"
                style={{ zIndex: 2 }}
              >
                <HeroBadge text="3" height={48} />
                <Stack gap={4} align="center">
                  <Title order={2} size={32} ta="center">
                    {t("guest.step3_title")}
                  </Title>
                  <Text c="dimmed" fw={500} ta="center" maw={600}>
                    {t("guest.step3_subtitle")}
                  </Text>
                </Stack>
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl" w="100%">
                  {/* TODO: 3 random articles */}
                  <Center h={100} w="100%" style={{ gridColumn: "1 / -1" }}>
                    <Text c="dimmed" fs="italic">
                      3 random articles coming soon... (HEHE)
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
                animationDelay: "0.01s",
                animation: `${classes.pulse} 4s infinite`,
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
                  {t("guest.cta_title")}
                </Title>
                <Text c="green.1" size="xl" fw={500} ta="center" maw={600}>
                  {t("guest.cta_subtitle")}
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
                    {t("guest.cta_join")}
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
                {t("guest.pro_title")}
              </Title>
              <Text size="xl" c="dimmed" ta="center" fw={500}>
                {t("guest.pro_subtitle")}
              </Text>
            </Stack>
            <Grid gap={40} align="stretch">
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
                        {t("guest.pro_source_title")}
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
                        <List.Item>{t("guest.pro_source_item1")}</List.Item>
                        <List.Item>{t("guest.pro_source_item2")}</List.Item>
                        <List.Item>{t("guest.pro_source_item3")}</List.Item>
                        <List.Item>{t("guest.pro_source_item4")}</List.Item>
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
                        {t("guest.pro_grow_title")}
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
                        <List.Item>{t("guest.pro_grow_item1")}</List.Item>
                        <List.Item>{t("guest.pro_grow_item2")}</List.Item>
                        <List.Item>{t("guest.pro_grow_item3")}</List.Item>
                        <List.Item>{t("guest.pro_grow_item4")}</List.Item>
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
              <Button
                size="xl"
                radius="xl"
                variant="primary"
                px={50}
                onClick={() =>
                  navigate(PATHS.GUEST.REGISTER, { state: { role: "pro" } })
                }
              >
                {t("guest.pro_cta")}
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
