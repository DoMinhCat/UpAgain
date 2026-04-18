import { Container, Title, Text, Group, Stack } from "@mantine/core";
import { FreemiumCard } from "../../components/guest/FreemiumCard";
import { PremiumCard } from "../../components/guest/PremiumCard";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../routes/paths";

export default function PricingPage() {
  const navigate = useNavigate();
  return (
    <Container size="xl" py={80}>
      <Stack align="center" gap="xl" mb={50}>
        <Title ta="center" size={42} fw={900}>
          Simple, transparent pricing
        </Title>
        <Text c="dimmed" size="lg" ta="center" maw={600}>
          Choose the plan that best fits your needs. Whether you're just
          starting out or a professional upcycler, we have you covered.
        </Text>
      </Stack>

      <Group justify="center" align="flex-start" gap="xl">
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
      </Group>
    </Container>
  );
}
