import {
  Container,
  Title,
  Text,
  Grid,
  Image,
  Paper,
  ThemeIcon,
  SimpleGrid,
  Button,
  Group,
  Stack,
  Card,
  Badge,
} from "@mantine/core";
import { useTranslation, Trans } from "react-i18next";
import {
  IconLeaf,
  IconHammer,
  IconHeartHandshake,
  IconRecycle,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../routes/paths";
import classes from "../../styles/Guest.module.css";

export default function AboutPage() {
  const { t } = useTranslation("about");
  const navigate = useNavigate();

  const aboutFeatures = [
    {
      icon: IconHeartHandshake,
      title: t("impact.features.connect.title"),
      description: t("impact.features.connect.description"),
    },
    {
      icon: IconHammer,
      title: t("impact.features.upcycle.title"),
      description: t("impact.features.upcycle.description"),
    },
    {
      icon: IconLeaf,
      title: t("impact.features.reduce.title"),
      description: t("impact.features.reduce.description"),
    },
  ];

  return (
    <Container size="xl" py="xl">
      {/* Hero Section */}
      <Grid gap="xl" align="center" mb={60} mt={40}>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Stack align="flex-start" gap="md">
            <Badge
              variant="light"
              color="var(--upagain-neutral-green)"
              size="lg"
            >
              {t("hero.badge")}
            </Badge>
            <Title order={1} style={{ fontSize: 48, lineHeight: 1.1 }}>
              <Trans
                i18nKey="hero.title"
                ns="about"
                components={{
                  1: (
                    <Text
                      component="span"
                      inherit
                      style={{ color: "var(--upagain-neutral-green)" }}
                    />
                  ),
                }}
              />
            </Title>
            <Text c="dimmed" size="lg">
              {t("hero.description")}
            </Text>
            <Group mt="md">
              <Button
                variant="cta"
                size="lg"
                onClick={() => navigate(PATHS.GUEST.REGISTER)}
              >
                {t("hero.cta_join")}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate(PATHS.GUEST.POSTS)}
              >
                {t("hero.cta_explore")}
              </Button>
            </Group>
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper
            radius="md"
            style={{ overflow: "hidden" }}
            shadow="md"
            withBorder
          >
            <Image src="/about/about1.png" alt="Community upcycling" h={400} />
          </Paper>
        </Grid.Col>
      </Grid>

      {/* Mission Section */}
      <Paper
        radius="lg"
        p="xl"
        mb={60}
        withBorder
        style={{
          backgroundColor: "var(--upagain-dark-green)",
          color: "white",
        }}
      >
        <Grid gap="xl" align="center">
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Image
              radius="md"
              src="/about/about2.png"
              alt="Community upcycling"
              fallbackSrc="https://placehold.co/400x400?text=Placeholder"
              h={400}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Stack>
              <Title order={2} style={{ color: "var(--upagain-yellow)" }}>
                {t("mission.title")}
              </Title>
              <Text size="lg">
                {t("mission.text1")}
              </Text>
              <Text size="lg">
                {t("mission.text2")}
              </Text>
              <Group mt="xs">
                <ThemeIcon
                  size={40}
                  radius="md"
                  color="var(--upagain-yellow)"
                  variant="filled"
                >
                  <IconRecycle size={24} color="var(--upagain-dark-green)" />
                </ThemeIcon>
                <Text fw={600} style={{ color: "#f9f7f2" }}>
                  {t("mission.footer")}
                </Text>
              </Group>
            </Stack>
          </Grid.Col>
        </Grid>
      </Paper>

      {/* Features Grid */}
      <Stack align="center" mb={40}>
        <Title order={2}>{t("impact.title")}</Title>
        <Text c="dimmed" ta="center" maw={600}>
          {t("impact.description")}
        </Text>
      </Stack>

      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl" mb={60}>
        {aboutFeatures.map((feature, index) => (
          <Card
            key={index}
            shadow="sm"
            padding="xl"
            radius="md"
            withBorder
            className={classes.card}
          >
            <ThemeIcon
              size={50}
              radius="md"
              color="var(--upagain-neutral-green)"
              variant="light"
              mb="md"
            >
              <feature.icon size={26} stroke={1.5} />
            </ThemeIcon>
            <Title order={4} mb="sm" style={{ color: "var(--upagain-brown)" }}>
              {feature.title}
            </Title>
            <Text size="sm" c="dimmed" lh={1.6}>
              {feature.description}
            </Text>
          </Card>
        ))}
      </SimpleGrid>
    </Container>
  );
}
