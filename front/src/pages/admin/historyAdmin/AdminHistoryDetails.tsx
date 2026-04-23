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
  Anchor,
} from "@mantine/core";
import { IconUser, IconBox, IconHash, IconClock } from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetHistoryDetails } from "../../../hooks/historyHooks";
import FullScreenLoader from "../../../components/common/FullScreenLoader";
import dayjs from "dayjs";

export function AdminHistoryDetails() {
  const navigate = useNavigate();
  const params = useParams();

  const formatState = (state: any) => {
    if (!state) return "{}";
    try {
      const parsed = typeof state === "string" ? JSON.parse(state) : state;
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      return String(state);
    }
  };

  // GET DETAILS
  const idStr = params.id;
  const idHistory = Number(idStr);
  const enabled = !!idStr && !isNaN(idHistory);
  const { data: historyData, isLoading } = useGetHistoryDetails(
    idHistory,
    enabled,
  );

  if (isLoading) {
    return <FullScreenLoader />;
  }
  return (
    <Container px="md" size="xl">
      <Title order={2} mt="xs" mb="sm">
        History Details
      </Title>

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
                      <Avatar
                        size="sm"
                        radius="xl"
                        name={historyData?.admin_name}
                        color="initials"
                      />

                      <Anchor
                        size="sm"
                        fw={600}
                        style={{ cursor: "pointer" }}
                        c="var(--component-color-primary)"
                        onClick={() =>
                          navigate(`/admin/users/${historyData?.admin_id}`, {
                            state: {
                              from: "historyDetails",
                              id_history: historyData?.id,
                            },
                          })
                        }
                      >
                        {historyData?.admin_name}
                      </Anchor>
                    </Group>
                  }
                />

                <DetailItem
                  icon={<IconBox size={18} />}
                  label="Module / Section"
                  value={
                    <Badge variant="light" mt={4}>
                      {historyData?.module}
                    </Badge>
                  }
                />

                {/* TODO: Link to subscription + finance settings */}
                <DetailItem
                  icon={<IconHash size={18} />}
                  label="Reference ID"
                  value={
                    <Anchor
                      size="sm"
                      fw={600}
                      style={{
                        cursor:
                          historyData?.action !== "delete"
                            ? "pointer"
                            : "default",
                      }}
                      c="var(--component-color-primary)"
                      onClick={() => {
                        if (historyData?.action !== "delete") {
                          if (
                            historyData?.module === "user" ||
                            historyData?.module === "pro" ||
                            historyData?.module === "employee"
                          ) {
                            navigate(`/admin/users/${historyData?.item_id}`, {
                              state: {
                                from: "historyDetails",
                                id_history: historyData?.id,
                              },
                            });
                          } else if (
                            historyData?.module === "post" ||
                            historyData?.module === "ads"
                          ) {
                            navigate(`/admin/posts/${historyData?.item_id}`, {
                              state: {
                                from: "historyDetails",
                                id_history: historyData?.id,
                              },
                            });
                          } else if (historyData?.module === "event") {
                            navigate(`/admin/events/${historyData?.item_id}`, {
                              state: {
                                from: "historyDetails",
                                id_history: historyData?.id,
                              },
                            });
                          } else if (historyData?.module === "container") {
                            navigate(
                              `/admin/containers/${historyData?.item_id}`,
                              {
                                state: {
                                  from: "historyDetails",
                                  id_history: historyData?.id,
                                },
                              },
                            );
                          } else if (
                            historyData?.module === "finance_setting"
                          ) {
                            navigate(`/admin/finance`, {
                              state: {
                                from: "historyDetails",
                                id_history: historyData?.id,
                              },
                            });
                          } else if (
                            historyData?.module === "listing" ||
                            historyData?.module === "deposit"
                          ) {
                            navigate(
                              `/admin/listings/${historyData?.item_id}`,
                              {
                                state: {
                                  from: "historyDetails",
                                  id_history: historyData?.id,
                                },
                              },
                            );
                          }
                        }
                      }}
                    >
                      {(historyData?.module === "user" ||
                      historyData?.module === "pro" ||
                      historyData?.module === "employee"
                        ? "Account #"
                        : historyData?.module === "container"
                          ? "Container #"
                          : historyData?.module === "post" ||
                              historyData?.module === "ads"
                            ? "Post #"
                            : historyData?.module === "event"
                              ? "Event #"
                              : historyData?.module === "comment"
                                ? "Comment #"
                                : historyData?.module === "listing"
                                  ? "Listing #"
                                  : historyData?.module === "deposit"
                                    ? "Deposit #"
                                    : "") + historyData?.item_id}
                    </Anchor>
                  }
                />

                <DetailItem
                  icon={<IconClock size={18} />}
                  label="Date & Time"
                  value={
                    <Text size="sm" mt={4} fw={500}>
                      {dayjs(historyData?.created_at).format(
                        "DD/MM/YYYY - HH:mm:ss",
                      )}
                    </Text>
                  }
                />
              </Stack>
            </Paper>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 8, lg: 9 }}>
          <Paper withBorder radius="md" p={0} style={{ overflow: "hidden" }}>
            <Box p="md" bg="var(--paper-color)">
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
                  <Paper withBorder p="sm" bg="var(--paper-color)" radius="sm">
                    <Code block style={{ background: "transparent" }}>
                      {formatState(historyData?.old_state)}
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
                  <Paper withBorder p="sm" bg="var(--paper-color)" radius="sm">
                    <Code block style={{ background: "transparent" }}>
                      {formatState(historyData?.new_state)}
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
