import {
  Container,
  Grid,
  Title,
  Text,
  Paper,
  Stack,
  Group,
  ThemeIcon,
  Button,
  Table,
  Badge,
} from "@mantine/core";
import {
  IconLeaf,
  IconCoins,
  IconScale,
  IconReceipt,
  IconBox,
  IconArrowUpRight,
  IconShoppingCart,
  IconTrendingUp,
} from "@tabler/icons-react";
import { BarChart, DonutChart } from "@mantine/charts";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../routes/paths";
import { useAuth } from "../../context/AuthContext";

export default function ProHomePremium() {
  const { t } = useTranslation("home");
  const { user } = useAuth();
  const navigate = useNavigate();

  // Mock data for Inventory Analytics
  const inventoryData = [
    {
      material: t("pro.materials.wood"),
      [t("pro.premium.available")]: 15,
      [t("pro.premium.added")]: 30,
      [t("pro.premium.recycled")]: 25,
    },
    {
      material: t("pro.materials.metal"),
      [t("pro.premium.available")]: 8,
      [t("pro.premium.added")]: 18,
      [t("pro.premium.recycled")]: 14,
    },
    {
      material: t("pro.materials.plastic"),
      [t("pro.premium.available")]: 22,
      [t("pro.premium.added")]: 35,
      [t("pro.premium.recycled")]: 40,
    },
    {
      material: t("pro.materials.glass"),
      [t("pro.premium.available")]: 12,
      [t("pro.premium.added")]: 25,
      [t("pro.premium.recycled")]: 20,
    },
    {
      material: t("pro.materials.textile"),
      [t("pro.premium.available")]: 19,
      [t("pro.premium.added")]: 32,
      [t("pro.premium.recycled")]: 28,
    },
    {
      material: t("pro.materials.cardboard"),
      [t("pro.premium.available")]: 30,
      [t("pro.premium.added")]: 50,
      [t("pro.premium.recycled")]: 45,
    },
  ];

  // Mock data for Donut Chart of materials used (Kg)
  const impactDonutData = [
    {
      name: t("pro.materials.wood"),
      value: 120,
      color: "var(--mantine-color-orange-6)",
    },
    {
      name: t("pro.materials.metal"),
      value: 85,
      color: "var(--mantine-color-gray-6)",
    },
    {
      name: t("pro.materials.plastic"),
      value: 45,
      color: "var(--mantine-color-blue-6)",
    },
    {
      name: t("pro.materials.glass"),
      value: 60,
      color: "var(--mantine-color-teal-6)",
    },
    {
      name: t("pro.materials.textile"),
      value: 75,
      color: "var(--mantine-color-indigo-6)",
    },
    {
      name: t("pro.materials.cardboard"),
      value: 110,
      color: "var(--mantine-color-yellow-6)",
    },
  ];

  // Calculated totals
  const totalUpcycledKg = impactDonutData.reduce(
    (acc, curr) => acc + curr.value,
    0,
  );

  return (
    <Container size="xl" py={40}>
      <Stack gap="xl">
        {/* Header Block */}
        <Paper
          withBorder
          p="xl"
          radius="lg"
          style={{
            background:
              "linear-gradient(135deg, var(--mantine-color-teal-9) 0%, var(--mantine-color-green-8) 100%)",
            color: "var(--mantine-color-white)",
            border: "none",
          }}
        >
          <Group justify="space-between" align="center">
            <Stack gap="xs">
              <Group gap="xs">
                <Badge
                  variant="filled"
                  color="var(--upagain-yellow)"
                  style={{ color: "#2a2a28" }}
                >
                  Premium Partner
                </Badge>
              </Group>
              <Title order={2} size={32} fw={900}>
                {t("pro.premium.title", {
                  username: user?.username || "Artisan",
                })}
              </Title>
              <Text size="lg" style={{ opacity: 0.9 }}>
                {t("pro.premium.subtitle")}
              </Text>
            </Stack>
            <ThemeIcon size={64} radius="xl" color="rgba(255,255,255,0.15)">
              <IconTrendingUp size={36} color="var(--upagain-yellow)" />
            </ThemeIcon>
          </Group>
        </Paper>

        {/* 1. Inventory Analytics */}
        <Paper withBorder p="xl" radius="lg" shadow="sm">
          <Stack gap="md">
            <Group justify="space-between">
              <div>
                <Title order={3}>{t("pro.premium.inventory_title")}</Title>
                <Text size="sm" c="dimmed">
                  {t("pro.premium.inventory_desc")}
                </Text>
              </div>
              <ThemeIcon size={44} radius="md" color="teal.1" c="teal.7">
                <IconBox size={24} />
              </ThemeIcon>
            </Group>

            <Grid gap="xl" align="center">
              <Grid.Col span={{ base: 12, md: 7 }}>
                <BarChart
                  h={320}
                  data={inventoryData}
                  dataKey="material"
                  series={[
                    {
                      name: t("pro.premium.available"),
                      color: "var(--upagain-neutral-green)",
                    },
                    { name: t("pro.premium.added"), color: "blue.6" },
                    { name: t("pro.premium.recycled"), color: "orange.6" },
                  ]}
                  barProps={{ radius: [4, 4, 0, 0] }}
                  gridAxis="xy"
                  tooltipProps={{
                    cursor: { fill: "rgba(0, 0, 0, 0.05)" },
                  }}
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 5 }}>
                <Table highlightOnHover verticalSpacing="sm">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>{t("pro.premium.material")}</Table.Th>
                      <Table.Th ta="right">
                        {t("pro.premium.available")}
                      </Table.Th>
                      <Table.Th ta="right">{t("pro.premium.added")}</Table.Th>
                      <Table.Th ta="right">
                        {t("pro.premium.recycled")}
                      </Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {inventoryData.map((row) => (
                      <Table.Tr
                        key={row.material}
                        style={{
                          transition: "background-color 0.2s ease",
                        }}
                      >
                        <Table.Td fw={600}>{row.material}</Table.Td>
                        <Table.Td ta="right">
                          {row[t("pro.premium.available")]}
                        </Table.Td>
                        <Table.Td ta="right" c="blue.6" fw={600}>
                          +{row[t("pro.premium.added")]}
                        </Table.Td>
                        <Table.Td ta="right" c="orange.6" fw={600}>
                          {row[t("pro.premium.recycled")]}
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Grid.Col>
            </Grid>
          </Stack>
        </Paper>

        {/* 2. Impact Tracking */}
        <Grid gap="xl">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper
              withBorder
              p="xl"
              radius="lg"
              shadow="sm"
              h="100%"
              style={{
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "var(--mantine-shadow-md)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "var(--mantine-shadow-sm)";
              }}
            >
              <Stack gap="lg" h="100%" justify="space-between">
                <Group justify="space-between">
                  <Title order={3}>{t("pro.premium.impact_title")}</Title>
                  <ThemeIcon size={40} radius="md" color="green.1" c="green.7">
                    <IconLeaf size={22} />
                  </ThemeIcon>
                </Group>

                <Group gap="xl" align="center" justify="center" py="md">
                  <DonutChart
                    size={160}
                    thickness={20}
                    data={impactDonutData}
                    withTooltip
                  />
                  <Stack gap="xs">
                    {impactDonutData.map((item) => (
                      <Group gap="xs" key={item.name}>
                        <div
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            backgroundColor: item.color,
                          }}
                        />
                        <Text size="sm" fw={500}>
                          {item.name}: {item.value} kg
                        </Text>
                      </Group>
                    ))}
                  </Stack>
                </Group>

                <Group
                  justify="space-between"
                  style={{
                    borderTop: "1px solid var(--border-color)",
                    paddingTop: 16,
                  }}
                >
                  <Text size="sm" c="dimmed">
                    {t("pro.premium.materials_used")}
                  </Text>
                  <Text size="lg" fw={800} c="green.7">
                    {totalUpcycledKg} Kg
                  </Text>
                </Group>
              </Stack>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper
              withBorder
              p="xl"
              radius="lg"
              shadow="sm"
              h="100%"
              style={{
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "var(--mantine-shadow-md)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "var(--mantine-shadow-sm)";
              }}
            >
              <Stack gap="lg" h="100%" justify="space-between">
                <Group justify="space-between">
                  <Title order={3}>{t("pro.premium.co2_saved")}</Title>
                  <ThemeIcon size={40} radius="md" color="blue.1" c="blue.7">
                    <IconScale size={22} />
                  </ThemeIcon>
                </Group>

                <Stack gap="xs" align="center" justify="center" py="xl">
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                    {t("pro.premium.co2_desc")}
                  </Text>
                  <Title size={48} fw={900} c="blue.7">
                    1,420.5 Kg
                  </Title>
                  <Badge
                    size="lg"
                    color="green"
                    variant="light"
                    leftSection={<IconLeaf size={12} />}
                  >
                    Equivalent to 58 trees planted
                  </Badge>
                </Stack>

                <Text
                  size="xs"
                  c="dimmed"
                  ta="center"
                  style={{
                    borderTop: "1px solid var(--border-color)",
                    paddingTop: 16,
                  }}
                >
                  Upcycling prevents landfill decomposition and carbon-intensive
                  new material creation.
                </Text>
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>

        {/* 3. Financial Dashboard */}
        <Paper withBorder p="xl" radius="lg" shadow="sm">
          <Stack gap="xl">
            <Group justify="space-between">
              <Title order={3}>{t("pro.premium.finance_title")}</Title>
              <ThemeIcon size={44} radius="md" color="yellow.1" c="yellow.7">
                <IconCoins size={24} />
              </ThemeIcon>
            </Group>

            <Grid gap="lg">
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <Paper withBorder p="md" radius="md">
                  <Group justify="space-between" mb="xs">
                    <Text size="sm" c="dimmed" fw={500}>
                      {t("pro.premium.total_purchases")}
                    </Text>
                    <IconShoppingCart
                      size={18}
                      color="var(--mantine-color-gray-5)"
                    />
                  </Group>
                  <Title order={4} size={28} fw={900}>
                    35
                  </Title>
                  <Text size="xs" c="dimmed" mt={4}>
                    Free & Paid materials sourced
                  </Text>
                </Paper>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 4 }}>
                <Paper withBorder p="md" radius="md">
                  <Group justify="space-between" mb="xs">
                    <Text size="sm" c="dimmed" fw={500}>
                      {t("pro.premium.paid_purchases")}
                    </Text>
                    <IconArrowUpRight
                      size={18}
                      color="var(--upagain-primary)"
                    />
                  </Group>
                  <Title
                    order={4}
                    size={28}
                    fw={900}
                    c="var(--upagain-primary)"
                  >
                    18
                  </Title>
                  <Text size="xs" c="dimmed" mt={4}>
                    Transactions processed via Stripe
                  </Text>
                </Paper>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 4 }}>
                <Paper withBorder p="md" radius="md">
                  <Group justify="space-between" mb="xs">
                    <Text size="sm" c="dimmed" fw={500}>
                      {t("pro.premium.total_spent")}
                    </Text>
                    <IconCoins
                      size={18}
                      color="var(--mantine-color-yellow-6)"
                    />
                  </Group>
                  <Title order={4} size={28} fw={900}>
                    1,250.00 €
                  </Title>
                  <Text size="xs" c="dimmed" mt={4}>
                    VAT and commissions included
                  </Text>
                </Paper>
              </Grid.Col>
            </Grid>

            {/* Invoices Redirection Panel */}
            <Paper
              p="md"
              radius="md"
              style={{
                backgroundColor: "var(--mantine-color-gray-0)",
                border: "1px dashed var(--border-color)",
              }}
            >
              <Group justify="space-between" align="center">
                <Group gap="sm">
                  <ThemeIcon size={40} radius="xl" color="gray.2" c="gray.7">
                    <IconReceipt size={20} />
                  </ThemeIcon>
                  <div>
                    <Text fw={600} size="sm">
                      Need official documents?
                    </Text>
                    <Text size="xs" c="dimmed">
                      Access all invoices, download payment receipts, and manage
                      billing methods.
                    </Text>
                  </div>
                </Group>
                <Button
                  variant="primary"
                  onClick={() => navigate(PATHS.USER.PROFILE + "?tab=billings")}
                >
                  {t("pro.premium.view_invoices")}
                </Button>
              </Group>
            </Paper>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
