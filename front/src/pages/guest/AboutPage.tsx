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
import {
  IconLeaf,
  IconHammer,
  IconHeartHandshake,
  IconRecycle,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../routes/paths";
import classes from "../../styles/Guest.module.css";

const aboutFeatures = [
  {
    icon: IconHeartHandshake,
    title: "Connect & Share",
    description:
      "Find local communities to share items you no longer need. Give objects a second life by passing them to those who will cherish them.",
  },
  {
    icon: IconHammer,
    title: "Upcycle & Create",
    description:
      "Transform ordinary discarded items into valuable treasures. Join upcycling workshops, learn new restoration skills, and monetize your creations.",
  },
  {
    icon: IconLeaf,
    title: "Reduce Waste",
    description:
      "Every upcycled item is a win for our planet! Track your CO2 savings and actively participate in building a circular, sustainable economy.",
  },
];

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <Container size="xl" py="xl">
      {/* Hero Section */}
      <Grid gutter="xl" align="center" mb={60} mt={40}>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Stack align="flex-start" gap="md">
            <Badge
              variant="light"
              color="var(--upagain-neutral-green)"
              size="lg"
            >
              Our Vision
            </Badge>
            <Title order={1} style={{ fontSize: 48, lineHeight: 1.1 }}>
              Breathe new life into every{" "}
              <Text
                component="span"
                inherit
                style={{ color: "var(--upagain-neutral-green)" }}
              >
                object
              </Text>
            </Title>
            <Text c="dimmed" size="lg">
              UpAgain is a collaborative platform dedicated to reducing waste
              and empowering local communities. We make it easy to exchange
              underutilized items, embark on upcycling projects, and create
              tangible value through sustainability.
            </Text>
            <Group mt="md">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate(PATHS.GUEST.REGISTER)}
              >
                Join the Movement
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate(PATHS.GUEST.POSTS)}
              >
                Explore Community
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
        <Grid gutter="xl" align="center">
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
                Why UpAgain?
              </Title>
              <Text size="lg">
                Millions of tons of usable items are discarded every year. We
                believe that the fastest way to environmental sustainability is
                fostering localized connection and equipping people with the
                inspiration to create rather than discard.
              </Text>
              <Text size="lg">
                We're bridging the gap between individuals who have too much and
                creators who see potential in everything. Together, we're
                building an economy where creativity dictates value.
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
                <Text fw={600} style={{ color: "var(--component-color-bg)" }}>
                  Make sustainability an easy, everyday choice.
                </Text>
              </Group>
            </Stack>
          </Grid.Col>
        </Grid>
      </Paper>

      {/* Features Grid */}
      <Stack align="center" mb={40}>
        <Title order={2}>How We Make An Impact</Title>
        <Text c="dimmed" ta="center" maw={600}>
          Whether you're looking to clean out your garage or you're an artisan
          seeking fresh materials, UpAgain offers the perfect ecosystem.
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
