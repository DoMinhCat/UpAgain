import {
  Center,
  Text,
  Title,
  Stack,
  Group,
  Box,
  Container,
} from "@mantine/core";
import { HeroBanner } from "../../components/common/hero/HeroBanner";
import { useComputedColorScheme } from "@mantine/core";
import HeroBadge from "../../components/common/hero/HeroBadge";

export default function GuestHome() {
  const scheme = useComputedColorScheme("light");

  return (
    <>
      <HeroBanner src={`/banners/guest-banner1-${scheme}.png`} height="85vh">
        <Center p="md">
          <Stack align="center">
            <Title size={48}>Nothing is waste until you give up on it.</Title>
            <Title size={24}>
              One platform to share objects, create value, and reduce waste
              together.
            </Title>
          </Stack>
        </Center>
      </HeroBanner>

      <HeroBanner src={`/banners/guest-banner2-${scheme}.png`} height="100vh">
        <Center p="xl">
          <Stack align="center" gap="xs">
            <Title ta="center" order={1} mb="sm">
              The sad reality: waste is <strong>everywhere</strong>
            </Title>
            <Text ta="center" size="lg" maw={600} mb="xl">
              Every minute, tons of usable objects are thrown away while
              resources become scarcer.
            </Text>
            <Group gap="xl" mt={0}>
              <HeroBadge text="More waste" height={32} />
              <HeroBadge text="Less resources" height={32} />
              <HeroBadge text="Climate change" height={32} />
            </Group>
          </Stack>
        </Center>
      </HeroBanner>

      <HeroBanner src={`/banners/guest-banner3-${scheme}.png`} height="100vh">
        <Center p="md">
          <Stack align="center">
            <Title size={48} mb="xl">
              Meet UpAgain
            </Title>
            <Title size={24} mb={0}>
              <strong>Reuse</strong> and <strong>upcycling</strong> made simple,
              local, and measurable.
            </Title>
            <Text>
              A common space where we connect to give materials a second life.
            </Text>
            <Group gap="lg" mt="lg"></Group>
          </Stack>
        </Center>
      </HeroBanner>

      <Container px="md" pt="xl" size="xl">
        <Box
          style={{
            border: "20px",
            backgroundColor: scheme === "dark" ? "#2d6e4d" : "#bee2c7",
          }}
        >
          <Center p="md">
            <Stack align="center">
              <Title size={48} mb="xl">
                Meet UpAgain
              </Title>
              <Title size={24} mb={0}>
                <strong>Reuse</strong> and <strong>upcycling</strong> made
                simple, local, and measurable.
              </Title>
              <Text>
                A common space where we connect to give materials a second life.
              </Text>
              <Group gap="lg" mt="lg"></Group>
            </Stack>
          </Center>
        </Box>
      </Container>
    </>
  );
}
