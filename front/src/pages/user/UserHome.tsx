import { HeroBanner } from "../../components/common/hero/HeroBanner";
import { Container, Image, useComputedColorScheme } from "@mantine/core";
import { Stack, Title, Text, SimpleGrid, Paper } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useAccountDetails } from "../../hooks/accountHooks";
import FullScreenLoader from "../../components/common/FullScreenLoader";
import { useAuth } from "../../context/AuthContext";

export default function UserHome() {
  const navigate = useNavigate();
  const scheme = useComputedColorScheme("light");
  const { user } = useAuth();

  // GET ACCOUNT INFO
  const { data: accountDetails, isLoading: isLoadingAccountDetails } =
    useAccountDetails(user?.id || 0);

  if (isLoadingAccountDetails) {
    return <FullScreenLoader />;
  }
  return (
    <>
      <HeroBanner
        src={`/banners/user-banner1-${scheme}.png`}
        height="80vh"
        style={{
          // We start the fade much later (at 85%) so it's only at the very edge
          maskImage:
            "linear-gradient(to bottom, black 0%, black 85%, rgba(0, 0, 0, 0.5) 92%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, black 85%, rgba(0, 0, 0, 0.5) 92%, transparent 100%)",
        }}
      >
        <Stack
          align="center"
          gap="xs"
          style={{
            animation: "fadeIn 1s ease-out",
            // Moves content up by shifting the flex alignment or adding a bottom "spacer"
            marginTop: "-10vh",
          }}
        >
          <Title size={56} ta="center" style={{ lineHeight: 1.1 }}>
            Hi {accountDetails?.username}, let's <br /> Save the Planet, One
            Piece at a Time.
          </Title>
          <Text size="xl" fw={500} ta="center" maw={700} c="dimmed">
            One platform to share objects, create value, and reduce waste
            together.
          </Text>
        </Stack>
      </HeroBanner>
    md" py={100} size="xl">
        <Paper>
          <Title>Your impact so far</Title>
          <SimpleGrid cols={3}>
            <Stack>
              <Title order={4}>Total CO² saved</Title>
              <Text>kg</Text>
              <Image
                src="/banners/user-banner1-light.png"
                height={100}
                width={100}
              />
            </Stack>
          </SimpleGrid>
        </Paper>
      </Container>
    </>
  );
}
