import { useState } from "react";
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
import { DashboardCard } from "../../components/dashboard/DashboardCard.tsx";
import { IconLeaf, IconDroplet, IconTrophy } from "@tabler/icons-react";
import { ScoreRing } from "../../components/score/ScoreRing.tsx";
import PaginationFooter from "../../components/common/PaginationFooter.tsx";
import { UserImpactObjectCard } from "../../components/object/UserImpactObjectCard.tsx";
export default function UserScorePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user?.role;

  // USER DATA
  const { data: accountDetails, isLoading: isLoadingAccountDetails } =
    useAccountDetails(user?.id || 0);

  const [activePage, setActivePage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // BACKEND INTEGRATION:
  // In a real scenario, you would fetch these from an API like:
  // const { data: myObjects, isLoading } = useGetMyImpactObjects({ page: activePage, limit: ITEMS_PER_PAGE });
  // For now, we use mock data to demonstrate the layout.

  const MOCK_OBJECTS = [
    {
      id: 1,
      title: "Vintage Oak Coffee Table",
      image: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88",
      price: 85,
      material: "Solid Wood",
      buyerName: "Julian R.",
      soldDate: "2026-04-18",
      impact: { co2: 12.5, water: 450, electricity: 18 },
    },
    {
      id: 2,
      title: "Retro Velvet Armchair",
      image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c",
      price: 120,
      material: "Velvet & Metal",
      buyerName: "Sarah M.",
      soldDate: "2026-04-15",
      impact: { co2: 8.2, water: 120, electricity: 5 },
    },
    // Add more mock items as needed
  ];

  const hasObjects = MOCK_OBJECTS.length > 0;
  const totalPages = 100;

  if (role !== "user") {
    navigate(PATHS.HOME);
  }

  if (isLoadingAccountDetails) {
    return <FullScreenLoader />;
  }

  return (
    <Container px="md" py={50} size="xl">
      <Title ta="center" mb="xl">
        Thank you for your effort, {accountDetails?.username || "Eco-warrior"}!
      </Title>

      <Stack gap="xl">
        {/* Section Header */}
        <Stack gap={0}>
          <Title order={2} size={32} c="var(--mantine-color-text)">
            Your environmental contribution
          </Title>
          <Text c="dimmed" size="sm">
            Real-time tracking of the resources you've helped preserve.
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
                {/* {accountDetails?.totalCo2Saved ?? "1,240"} */}{" "}
                <Text span size="xl" fw={500}>
                  1240 kg
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
                  {/* {accountDetails?.totalWaterSaved ??  */}
                  4,500 Liters
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
                  {/* {accountDetails?.totalElectricitySaved ??  */}
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
              <ScoreRing score={accountDetails?.score ?? 0} size={140} />
            </Box>
            <Text size="xs" c="dimmed" ta="center">
              Top 1% of Upcyclers this month!
            </Text>
          </DashboardCard>
        </SimpleGrid>
      </Stack>

      <Stack my={80} align="center" gap="xl">
        <Title order={2} ta="center">
          Let's boost your impact!
        </Title>
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg" w="100%">
          <Button
            variant="cta-reverse"
            size="lg"
            radius="xl"
            onClick={() => navigate(PATHS.MARKETPLACE.LISTINGS)}
          >
            Post a new item
          </Button>
          <Button
            variant="cta"
            size="lg"
            radius="xl"
            onClick={() => navigate(PATHS.MARKETPLACE.DEPOSITS)}
          >
            Explore workshops
          </Button>
          <Button
            variant="cta-reverse"
            size="lg"
            radius="xl"
            onClick={() => navigate(PATHS.MARKETPLACE.LISTINGS)}
          >
            Join a cleanup
          </Button>
        </SimpleGrid>
      </Stack>

      <Stack gap="xl">
        <Title ta="center" mb="lg">
          Objects you gave a second life
        </Title>

        {hasObjects ? (
          <Stack gap="md">
            {MOCK_OBJECTS.map((obj) => (
              <UserImpactObjectCard
                key={obj.id}
                title={obj.title}
                image={obj.image}
                price={obj.price}
                material={obj.material}
                buyerName={obj.buyerName}
                soldDate={obj.soldDate}
                impact={obj.impact}
              />
            ))}

            {totalPages > 1 && (
              <PaginationFooter
                activePage={activePage}
                setPage={setActivePage}
                total_records={MOCK_OBJECTS.length}
                last_page={totalPages}
                limit={ITEMS_PER_PAGE}
                unit="objects"
                loading={false}
                hidden={false}
              />
            )}
          </Stack>
        ) : (
          <Stack align="center" py={40} gap="xl">
            <Text c="dimmed" ta="center">
              You haven't redirected any objects yet. Every recycled item
              counts!
            </Text>
            <SimpleGrid
              cols={{ base: 1, sm: 2 }}
              spacing="md"
              w="100%"
              maw={600}
            >
              <Button
                variant="primary"
                className="button"
                data-variant="primary"
                size="lg"
                onClick={() => navigate(PATHS.MARKETPLACE.LISTINGS)}
              >
                Create a listing
              </Button>
              <Button
                variant="primary"
                className="button"
                data-variant="primary"
                size="lg"
                onClick={() => navigate(PATHS.MARKETPLACE.DEPOSITS)}
              >
                Make a deposit
              </Button>
            </SimpleGrid>
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
