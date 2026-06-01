import { Container, Title, Text, Group, Stack, Skeleton } from "@mantine/core";
import { FreemiumCard } from "../../components/guest/FreemiumCard";
import { PremiumCard } from "../../components/guest/PremiumCard";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../routes/paths";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { useAccountDetails } from "../../hooks/accountHooks";

export default function PricingPage() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const { user } = useAuth();

  const isPro = user?.role === "pro";
  const { data: accountDetails, isLoading: isLoadingAccountDetails } =
    useAccountDetails(user?.id || 0, isPro);

  if (isPro && isLoadingAccountDetails) {
    return (
      <Container size="xl" py={80}>
        <Stack align="center" gap="xl" mb={50}>
          <Skeleton height={40} width={300} radius="sm" />
          <Skeleton height={20} width={500} radius="sm" />
        </Stack>

        <Group justify="center" align="flex-start" gap="xl">
          <Skeleton height={450} width={360} radius="lg" />
          <Skeleton height={450} width={360} radius="lg" />
        </Group>
      </Container>
    );
  }

  return (
    <Container size="xl" py={80}>
      <Stack align="center" gap="xl" mb={50}>
        <Title ta="center" size={42} fw={900}>
          {t("pricing.title")}
        </Title>
        <Text c="dimmed" size="lg" ta="center" maw={600}>
          {t("pricing.description")}
        </Text>
      </Stack>

      <Group justify="center" align="flex-start" gap="xl">
        {isPro ? (
          <>
            <FreemiumCard showButton={false} />
            <PremiumCard
              showTrialButton={!accountDetails?.is_trial}
              onClick={() => {}}
              onTrialClick={() => {}}
            />
          </>
        ) : (
          <>
            <div
              onClick={() =>
                navigate(PATHS.GUEST.REGISTER, { state: { role: "pro" } })
              }
            >
              <FreemiumCard />
            </div>
            <div
              onClick={() =>
                navigate(PATHS.GUEST.REGISTER, { state: { role: "pro" } })
              }
            >
              <PremiumCard />
            </div>
          </>
        )}
      </Group>
    </Container>
  );
}
