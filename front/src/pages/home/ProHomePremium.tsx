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
  Skeleton,
  SegmentedControl,
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
  IconBell,
} from "@tabler/icons-react";
import { BarChart, DonutChart } from "@mantine/charts";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../routes/paths";
import { useAuth } from "../../context/AuthContext";
import {
  useGetProAnalytics,
  useGetProAlertMaterials,
  useUpdateProAlertMaterials,
} from "../../hooks/proHooks";
import { useState } from "react";
import MaterialAlertModal from "../../components/common/MaterialAlertModal";

export default function ProHomePremium() {
  const { t } = useTranslation("home");
  const { user } = useAuth();
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);

  const { data: alertMaterialsData } = useGetProAlertMaterials(
    user?.id,
    user?.role || "",
  );
  const updateAlertMaterials = useUpdateProAlertMaterials(user?.id);
  const alertMaterials = alertMaterialsData || [];

  const handleSaveAlerts = (materials: string[]) => {
    updateAlertMaterials.mutate(materials);
  };

  const [timeframe, setTimeframe] = useState("7d");
  const { data, isLoading } = useGetProAnalytics(user?.id, timeframe);

  if (isLoading) {
    return (
      <Container size="xl" py={40}>
        <Stack gap="xl">
          <Skeleton height={140} radius="lg" />
          <Paper withBorder p="xl" radius="lg" variant="primary">
            <Stack gap="md">
              <Group justify="space-between">
                <Skeleton height={30} width={250} />
                <Skeleton height={40} width={40} radius="md" />
              </Group>
              <Grid gap="xl">
                <Grid.Col span={{ base: 12, md: 7 }}>
                  <Skeleton height={320} />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 5 }}>
                  <Skeleton height={320} />
                </Grid.Col>
              </Grid>
            </Stack>
          </Paper>
          <Grid gap="xl">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Skeleton height={300} radius="lg" />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Skeleton height={300} radius="lg" />
            </Grid.Col>
          </Grid>
          <Paper withBorder p="xl" radius="lg" variant="primary">
            <Skeleton height={200} />
          </Paper>
        </Stack>
      </Container>
    );
  }

  const MATERIAL_COLORS: Record<string, string> = {
    wood: "var(--mantine-color-orange-6)",
    metal: "var(--mantine-color-gray-6)",
    plastic: "var(--mantine-color-blue-6)",
    glass: "var(--mantine-color-teal-6)",
    textile: "var(--mantine-color-indigo-6)",
    mixed: "var(--mantine-color-yellow-6)",
    other: "var(--mantine-color-grape-6)",
  };

  const inventoryData = (data?.inventory || []).map((item) => ({
    material: t(
      `pro.materials.${item.material}`,
      item.material.charAt(0).toUpperCase() + item.material.slice(1),
    ),
    [t("pro.premium.available")]: item.available,
    [t("pro.premium.added")]: item.added,
    [t("pro.premium.recycled")]: item.recycled,
  }));

  const impactDonutData = (data?.impact?.material_usage || []).map((item) => ({
    name: t(
      `pro.materials.${item.material}`,
      item.material.charAt(0).toUpperCase() + item.material.slice(1),
    ),
    value: item.weight,
    color: MATERIAL_COLORS[item.material] || "var(--mantine-color-gray-6)",
  }));

  const totalUpcycledKg =
    data?.impact?.material_usage?.reduce((acc, item) => acc + item.weight, 0) ??
    0;
  const totalCO2 = data?.impact?.total_co2 ?? 0;
  const equivalentTrees = Math.round(totalCO2 / 24) || 0;

  return (
    <Container size="xl" py={40}>
      <Stack gap="xl">
        <Group
          justify="flex-end"
          style={{
            position: "sticky",
            top: 90,
            zIndex: 100,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              pointerEvents: "auto",
              background: "var(--mantine-color-dark-6, #1e1e1c)",
              backdropFilter: "blur(8px)",
              padding: "4px",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <SegmentedControl
              value={timeframe}
              onChange={setTimeframe}
              data={[
                { label: t("pro.premium.time_24h", "24h"), value: "24h" },
                { label: t("pro.premium.time_7d", "7d"), value: "7d" },
                { label: t("pro.premium.time_30d", "30d"), value: "30d" },
                { label: t("pro.premium.time_year", "Year"), value: "year" },
              ]}
            />
          </div>
        </Group>

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
                <Button
                  size="xs"
                  variant="white"
                  color="teal"
                  onClick={() => setModalOpen(true)}
                  leftSection={<IconBell size={14} />}
                  style={{
                    color: "var(--upagain-neutral-green)",
                    fontWeight: 700,
                  }}
                >
                  {t("preferences.configure_alerts", "Configure Alerts")}
                </Button>
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
        <Paper withBorder p="xl" radius="lg" shadow="sm" variant="primary">
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
              variant="primary"
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
                    tooltipDataSource="segment"
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
              variant="primary"
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
                    {totalCO2.toLocaleString(undefined, {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    })}{" "}
                    Kg
                  </Title>
                  <Badge
                    size="lg"
                    color="green"
                    variant="light"
                    leftSection={<IconLeaf size={12} />}
                  >
                    {t(
                      "pro.premium.trees_equivalent",
                      "Equivalent to {{count}} trees planted",
                      { count: equivalentTrees },
                    )}
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
        <Paper withBorder p="xl" radius="lg" shadow="sm" variant="primary">
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
                    {data?.finance?.total_purchases ?? 0}
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
                    {data?.finance?.paid_purchases ?? 0}
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
                    {(data?.finance?.total_spent ?? 0).toLocaleString(
                      undefined,
                      { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                    )}{" "}
                    €
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
              variant="primary"
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
      <MaterialAlertModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        selectedMaterials={alertMaterials}
        onSave={handleSaveAlerts}
      />
    </Container>
  );
}
