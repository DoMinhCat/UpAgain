import { Container, Grid, Skeleton, Stack, Group } from "@mantine/core";

export default function FullScreenLoader() {
  return (
    <Container size="xl" py={80} style={{ width: "100%", minHeight: "100vh" }}>
      <Stack gap="xl">
        {/* Top Header Section */}
        <Group justify="space-between" align="center">
          <Stack gap="xs" style={{ flex: 1 }}>
            <Skeleton height={28} width="35%" radius="sm" />
            <Skeleton height={16} width="60%" radius="sm" />
          </Stack>
          <Skeleton height={40} width={120} radius="xl" />
        </Group>

        {/* Hero or Banner Section */}
        <Skeleton height={160} radius="lg" />

        {/* Main Content Layout */}
        <Grid gap="xl">
          {/* Left / Sidebar Column */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="md">
              <Skeleton height={240} radius="md" />
              <Skeleton height={180} radius="md" />
            </Stack>
          </Grid.Col>

          {/* Right / Content Cards Column */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Grid gap="md">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Skeleton height={200} radius="md" />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Skeleton height={200} radius="md" />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Skeleton height={200} radius="md" />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Skeleton height={200} radius="md" />
              </Grid.Col>
            </Grid>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}
