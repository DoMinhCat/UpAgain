import { useState } from "react";
import { useAuth } from "../../context/AuthContext.tsx";
import { useLocation, useNavigate } from "react-router-dom";
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
import { useGetUserImpact, useGetUserImpactItems } from "../../hooks/userHooks";
import FullScreenSkeleton from "../../components/common/FullScreenSkeleton.tsx";
import { DashboardCard } from "../../components/dashboard/DashboardCard.tsx";
import { IconLeaf, IconDroplet, IconTrophy } from "@tabler/icons-react";
import { ScoreRing } from "../../components/score/ScoreRing.tsx";
import PaginationFooter from "../../components/common/PaginationFooter.tsx";
import { UserImpactObjectCard } from "../../components/object/UserImpactObjectCard.tsx";
import MyBreadcrumbs from "../../components/nav/MyBreadcrumbs.tsx";
import { useTranslation } from "react-i18next";
import { resolveUrl } from "../../utils/imageUtils.ts";
export default function UserScorePage() {
  const location = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const role = user?.role;

  // USER DATA
  const { data: accountDetails, isLoading: isLoadingAccountDetails } =
    useAccountDetails(user?.id || 0);

  const [activePage, setActivePage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const { data: impactData, isLoading: isLoadingImpact } = useGetUserImpact();
  const { data: impactItemsData, isLoading: isLoadingItems } =
    useGetUserImpactItems(activePage, ITEMS_PER_PAGE);

  const items = impactItemsData?.items ?? [];
  const hasObjects = items.length > 0;
  const totalPages = impactItemsData?.last_page ?? 1;

  if (role !== "user") {
    navigate(PATHS.HOME);
  }

  if (isLoadingAccountDetails || isLoadingImpact || isLoadingItems) {
    return <FullScreenSkeleton />;
  }

  return (
    <Container px="md" py={50} size="xl" mt="lg" mb="xl">
      <MyBreadcrumbs
        breadcrumbs={[
          {
            title: t("home:title"),
            href: PATHS.HOME,
          },
          ...(location.state?.from === "profile"
            ? [
                {
                  title: t("profile:title"),
                  href: PATHS.USER.PROFILE,
                },
              ]
            : []),
          {
            title: t("admin:users.score.title"),
            href: "#",
          },
        ]}
      />
      <Title ta="center" mt="xl" mb="xl">
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
                <Text span size="xl" fw={500}>
                  {impactData?.co2.toFixed(1) ?? "0"} kg
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
                  {impactData?.water.toFixed(0) ?? "0"} L
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
                  {impactData?.electricity.toFixed(1) ?? "0"} kWh
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
            onClick={() => navigate(PATHS.EVENTS.HOME)}
          >
            Take part in our events
          </Button>
          <Button
            variant="cta"
            size="lg"
            radius="xl"
            onClick={() => navigate(PATHS.MARKETPLACE.NEW)}
          >
            Post a new item
          </Button>
          <Button
            variant="cta-reverse"
            size="lg"
            radius="xl"
            onClick={() => navigate(PATHS.POSTS.HOME)}
          >
            Explore insightful posts
          </Button>
        </SimpleGrid>
      </Stack>

      <Stack gap="xl">
        <Title ta="center" mb="lg">
          Objects you gave a second life
        </Title>

        {hasObjects ? (
          <Stack gap="md">
            {items.map((obj) => (
              <UserImpactObjectCard
                key={obj.id}
                title={obj.title}
                image={
                  resolveUrl(obj.images?.[0]) ??
                  "/banners/user-banner1-light.png"
                }
                price={obj.price}
                material={obj.material}
                buyerName={obj.buyer_name}
                soldDate={obj.sold_date}
                impact={{
                  co2: obj.co2,
                  water: obj.water,
                  electricity: obj.electricity,
                }}
              />
            ))}

            {totalPages > 1 && (
              <PaginationFooter
                activePage={activePage}
                setPage={setActivePage}
                total_records={impactItemsData?.total_records ?? 0}
                last_page={totalPages}
                limit={ITEMS_PER_PAGE}
                unit="objects"
                loading={isLoadingItems}
                hidden={false}
              />
            )}
          </Stack>
        ) : (
          <Stack align="center" py={40} gap="xl">
            <Text c="dimmed" ta="center">
              You haven't sold any objects yet. Every upcycled object counts!
            </Text>
            <Button
              variant="cta"
              className="button"
              data-variant="primary"
              size="lg"
              onClick={() => navigate(PATHS.MARKETPLACE.NEW)}
            >
              Post a new object
            </Button>
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
