import {
  Container,
  Title,
  Grid,
  Stack,
  Text,
  Badge,
  Group,
  Box,
  Paper,
  Divider,
  Avatar,
  Code,
  ThemeIcon,
} from "@mantine/core";
import { PATHS } from "../../../routes/paths";
import { IconUser, IconBox, IconHash, IconClock } from "@tabler/icons-react";
import AdminBreadcrumbs from "../../../components/admin/AdminBreadcrumbs";

export function AdminHistoryDetails() {
  //placeholder
  const historyData = {
    adminName: "Alex Rivera",
    module: "Event Management",
    itemId: "EVT-2026-XYZ",
    timestamp: "March 30, 2026 · 14:32",
    oldState: { status: "pending", price: 20, capacity: 100 },
    newState: { status: "published", price: 25, capacity: 150 },
  };
  return (
    <Container px="md" size="xl">
      <Title order={2} mt="xs" mb="sm">
        History Details
      </Title>

      <AdminBreadcrumbs
        breadcrumbs={[
          { title: "Home", href: PATHS.ADMIN.HOME },
          { title: "History's Details", href: "/admin/history/:id" },
        ]}
      />

      <Grid mt="xl" gutter="lg">
        {/* Left Column: Metadata Summary */}
        <Grid.Col span={{ base: 12, md: 4, lg: 3 }}>
          <Stack gap="md">
            <Paper
              withBorder
              p="md"
              radius="md"
              style={{ border: "1px solid var(--border-color)" }}
            >
              <Text fw={700} size="xs" c="dimmed" tt="uppercase" mb="lg">
                Log Information
              </Text>

              <Stack gap="xl">
                <DetailItem
                  icon={<IconUser size={18} />}
                  label="Performed By"
                  value={
                    <Group gap="xs" mt={4}>
                      <Avatar size="sm" radius="xl" color="blue">
                        AR
                      </Avatar>
                      <Text size="sm" fw={600}>
                        {historyData.adminName}
                      </Text>
                    </Group>
                  }
                />

                <DetailItem
                  icon={<IconBox size={18} />}
                  label="Module / Section"
                  value={
                    <Badge variant="light" mt={4}>
                      {historyData.module}
                    </Badge>
                  }
                />

                <DetailItem
                  icon={<IconHash size={18} />}
                  label="Reference ID"
                  value={
                    <Code mt={4} fw={700}>
                      {historyData.itemId}
                    </Code>
                  }
                />

                <DetailItem
                  icon={<IconClock size={18} />}
                  label="Date & Time"
                  value={
                    <Text size="sm" mt={4} fw={500}>
                      {historyData.timestamp}
                    </Text>
                  }
                />
              </Stack>
            </Paper>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 8, lg: 9 }}>
          <Paper withBorder radius="md" p={0} style={{ overflow: "hidden" }}>
            <Box p="md" bg="var(--paper-border-color)">
              <Text fw={700} size="sm">
                Modification Comparison
              </Text>
            </Box>

            <Divider />

            <Grid gutter={0}>
              {/* Old State */}
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Box p="md" style={{ border: "1px solid var(--border-color)" }}>
                  <Badge color="red" variant="dot" mb="sm">
                    Previous State
                  </Badge>
                  <Paper
                    withBorder
                    p="sm"
                    bg="var(--paper-border-color)"
                    radius="sm"
                  >
                    <Code block style={{ background: "transparent" }}>
                      {JSON.stringify(historyData.oldState, null, 2)}
                    </Code>
                  </Paper>
                </Box>
              </Grid.Col>

              {/* New State */}
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Box p="md" style={{ border: "1px solid var(--border-color)" }}>
                  <Badge color="green" variant="dot" mb="sm">
                    Updated State
                  </Badge>
                  <Paper
                    withBorder
                    p="sm"
                    bg="var(--paper-border-color)"
                    radius="sm"
                  >
                    <Code block style={{ background: "transparent" }}>
                      {JSON.stringify(historyData.newState, null, 2)}
                    </Code>
                  </Paper>
                </Box>
              </Grid.Col>
            </Grid>
          </Paper>

          <Text c="dimmed" size="xs" mt="sm" ta="right">
            * This is a permanent audit record and cannot be modified.
          </Text>
        </Grid.Col>
      </Grid>
    </Container>
  );
}

/**
 * Clean Helper for Metadata Rows
 */
function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Box>
      <Group gap="xs" mb={4}>
        <ThemeIcon variant="subtle" color="gray" size="sm">
          {icon}
        </ThemeIcon>
        <Text size="xs" fw={700} c="dimmed" tt="uppercase">
          {label}
        </Text>
      </Group>
      <Box pl={32}>{value}</Box>
    </Box>
  );
}
