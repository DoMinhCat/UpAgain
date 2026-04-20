import { useAuth } from "../../context/AuthContext.tsx";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../routes/paths.ts";
import {
  Container,
  Stack,
  Title,
  Text,
  SimpleGrid,
  Group,
  Image,
  Progress,
  Box,
  Button,
} from "@mantine/core";
import { useAccountDetails } from "../../hooks/accountHooks.tsx";
import FullScreenLoader from "../../components/common/FullScreenLoader.tsx";
import { DashboardCard } from "../../components/common/dashboard/DashboardCard.tsx";
import { IconLeaf, IconDroplet, IconTrophy } from "@tabler/icons-react";
import { ScoreRing } from "../../components/user/ScoreRing";

export default function UserScorePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user?.role;

  // USER DATA
  const { data: accountDetails, isLoading: isLoadingAccountDetails } =
    useAccountDetails(user?.id || 0);

  if (role !== "user") {
    navigate(PATHS.HOME);
  }

  if (isLoadingAccountDetails) {
    return <FullScreenLoader />;
  }
  return (
    <Container px="md" py={50} size="xl">
      <Title ta="center" mb="xl">
        Thank you for your effort, {accountDetails?.username}!
      </Title>
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
          <DashboardCard
            title="Total CO² saved"
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
                That is about 1 Elephant!
              </Text>
            </Box>
          </DashboardCard>

          {/* CARD 2: RESOURCES */}
          <DashboardCard
            title="Resources saved"
            icon={<IconDroplet size={18} />}
            color="var(--upagain-yellow)"
          >
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
          </DashboardCard>

          {/* CARD 3: SCORE */}
          <DashboardCard
            title="Upcycling Score"
            icon={<IconTrophy size={18} />}
            color="var(--upagain-light-green)"
            align="center"
          >
            <Box pos="relative" my="sm">
              <ScoreRing score={99} size={140} />
            </Box>
            <Text size="xs" c="dimmed" ta="center">
              Top 99999% of Upcyclers this month!
            </Text>
          </DashboardCard>
        </SimpleGrid>
      </Stack>

      <Title ta="center" my={50}>
        Let's gain some more points!
      </Title>
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
        <Button variant="cta-reverse" size="lg" radius="xl">
          Post a new item
        </Button>
        <Button variant="cta" size="lg" radius="xl">
          Check out our guides and projects
        </Button>
        <Button variant="cta-reverse" size="lg" radius="xl">
          Join an event
        </Button>
      </SimpleGrid>

      <Title ta="center" my={50}>
        Objects you gaved a second life
      </Title>
    </Container>
  );
}
