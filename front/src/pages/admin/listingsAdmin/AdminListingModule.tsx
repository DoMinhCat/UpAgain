import {
  Container,
  Title,
  Group,
  Grid,
  TextInput,
  SimpleGrid,
  Select,
  Table,
  Badge,
  Button,
  Stack,
  Pill,
  Loader,
  Modal,
} from "@mantine/core";
import { AdminCardInfo } from "../../../components/dashboard/AdminCardInfo";
import { StatsCardDesc } from "../../../components/dashboard/AdminCardInfo";
import {
  IconCalendarEvent,
  IconClockPause,
  IconChecklist,
  IconArrowUpRight,
  IconSearch,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { PieChart } from "@mantine/charts";
import { Paper, Text } from "@mantine/core";
import AdminTable from "../../../components/admin/AdminTable";
import PaginationFooter from "../../../components/common/PaginationFooter";
import {
  useDeleteItem,
  useGetAllItems,
  useGetItemStats,
} from "../../../hooks/itemHooks";
import { useState } from "react";
import { PATHS } from "../../../routes/paths";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import type { Item } from "../../../api/interfaces/item";
import { useDisclosure } from "@mantine/hooks";
import { ChartLegend } from "../../../components/chart/ChartLegend";
import { useTranslation } from "react-i18next";

export function AdminListingModule() {
  const { t } = useTranslation("admin");
  const navigate = useNavigate();

  // Get table data
  const [filters, setFilters] = useState<{
    searchValue: string | undefined;
    sortValue: string | null;
    categoryValue: string | null;
    statusValue: string | null;
    materialValue: string | null;
  }>({
    searchValue: "",
    sortValue: null,
    categoryValue: null,
    statusValue: null,
    materialValue: null,
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [activePage, setPage] = useState(1);
  const LIMIT = 10;

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };
  const hasFilters = Boolean(
    appliedFilters.searchValue ||
    appliedFilters.categoryValue ||
    appliedFilters.sortValue ||
    appliedFilters.statusValue ||
    appliedFilters.materialValue,
  );

  const handleSearchClick = () => {
    setAppliedFilters(filters);
    setPage(1);
  };
  const handleResetFilters = () => {
    const defaultFilters = {
      searchValue: "",
      sortValue: null,
      categoryValue: null,
      statusValue: null,
      materialValue: null,
    };
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setPage(1);
  };
  const {
    data: items,
    isLoading: isItemsLoading,
    error: itemsError,
  } = useGetAllItems(
    hasFilters ? -1 : activePage,
    hasFilters ? -1 : LIMIT,
    appliedFilters.searchValue,
    appliedFilters.sortValue || undefined,
    appliedFilters.statusValue || undefined,
    appliedFilters.materialValue || undefined,
    appliedFilters.categoryValue || undefined,
  );
  const allItems = items?.items || [];

  // STATS
  const [chartTime, setChartTime] = useState<string | null>("all");
  const { data: itemStats, isLoading: isItemStatsLoading } = useGetItemStats(
    chartTime || undefined,
  );

  // DELETE MODAL
  const [openedDelete, { open: openDelete, close: closeDelete }] =
    useDisclosure(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const handleModalDelete = (item: Item) => {
    setSelectedItem(item);
    openDelete();
  };

  const deleteItemMutation = useDeleteItem();

  const handleDeleteItem = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedItem) {
      deleteItemMutation.mutate(selectedItem.id, {
        onSuccess: () => {
          closeDelete();
        },
      });
    }
  };

  return (
    <Container px="md" size="xl">
      <Group justify="space-between" mb="xl">
        <Title order={2} mt="lg">
          {t("listings.title")}
        </Title>
        <Select
          label={t("common:timeframe.title", { defaultValue: "Timeframe" })}
          placeholder={t("users.status.all")}
          value={chartTime}
          disabled={isItemStatsLoading}
          onChange={(value) => setChartTime(value)}
          data={[
            { value: "all", label: t("users.status.all") },
            {
              value: "today",
              label: t("common:timeframe_options.today", {
                defaultValue: "Today",
              }),
            },
            {
              value: "last_3_days",
              label: t("common:timeframe_options.last_3_days", {
                defaultValue: "Last 3 days",
              }),
            },
            {
              value: "last_week",
              label: t("common:timeframe_options.last_week", {
                defaultValue: "Last 7 days",
              }),
            },
            {
              value: "last_month",
              label: t("common:timeframe_options.last_month", {
                defaultValue: "Last 30 days",
              }),
            },
            {
              value: "last_year",
              label: t("common:timeframe_options.last_year", {
                defaultValue: "Last 365 days",
              }),
            },
          ]}
        />
      </Group>

      {/* stats cards */}
      <SimpleGrid cols={{ base: 1, sm: 3 }} mb="sm">
        <AdminCardInfo
          icon={IconCalendarEvent}
          title={t("listings.stats.active_objects")}
          value={itemStats?.active || 0}
          loading={isItemStatsLoading}
          description={
            <StatsCardDesc
              stats={itemStats?.new_since || 0}
              icon={
                <IconArrowUpRight
                  size={24}
                  color="var(--upagain-neutral-green)"
                />
              }
              description={
                itemStats?.new_since != 1
                  ? t("listings.stats.new_objects_desc")
                  : t("listings.stats.new_objects_desc_single")
              }
            />
          }
        />
        <AdminCardInfo
          icon={IconClockPause}
          title={t("listings.stats.pending_approval")}
          value={itemStats?.pending || 0}
          loading={isItemStatsLoading}
          description={
            <StatsCardDesc
              stats={itemStats?.pending || 0}
              icon={
                <IconAlertTriangle size={24} color="var(--upagain-yellow)" />
              }
              description={
                itemStats?.pending != 1
                  ? t("listings.stats.require_validation")
                  : t("listings.stats.require_validation_single")
              }
            />
          }
        />
        <AdminCardInfo
          icon={IconChecklist}
          title={t("listings.stats.completed_transactions")}
          value={itemStats?.total_transactions || 0}
          loading={isItemStatsLoading}
          description={
            <StatsCardDesc
              stats={itemStats?.new_transactions_since || 0}
              icon={
                <IconArrowUpRight
                  size={24}
                  color="var(--upagain-neutral-green)"
                />
              }
              description={
                itemStats?.new_transactions_since != 1
                  ? t("listings.stats.new_transactions_desc")
                  : t("listings.stats.new_transactions_desc_single")
              }
            />
          }
        />
      </SimpleGrid>
      <Text size="sm" c="dimmed" mb="xl">
        {t("listings.stats.timeframe_note")}
      </Text>

      {/* 2. Bottom Row: Distribution Analysis */}
      <Grid align="stretch">
        <Grid.Col span={12}>
          <Paper withBorder p="lg" radius="md" shadow="sm" variant="primary">
            <Group justify="space-between" mb="xl">
              <Stack gap={0}>
                <Title order={4}>{t("listings.analytics.title")}</Title>
                <Text size="sm" c="dimmed">
                  {t("listings.analytics.desc")}
                </Text>
              </Stack>
            </Group>

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
              {/* Material Chart */}
              <Stack align="center">
                <Text fw={700} size="sm" c="dimmed" tt="uppercase">
                  {t("listings.analytics.by_material")}
                </Text>
                {isItemStatsLoading ? (
                  <Loader size="xl" />
                ) : (itemStats?.total_wood || 0) +
                    (itemStats?.total_metal || 0) +
                    (itemStats?.total_textile || 0) +
                    (itemStats?.total_glass || 0) +
                    (itemStats?.total_plastic || 0) +
                    (itemStats?.total_other || 0) +
                    (itemStats?.total_mixed || 0) ===
                  0 ? (
                  <Text c="dimmed">{t("listings.analytics.no_data")}</Text>
                ) : (
                  <PieChart
                    withLabelsLine
                    labelsPosition="outside"
                    labelsType="value"
                    withLabels
                    withTooltip
                    tooltipDataSource="segment"
                    h={280}
                    w={280}
                    data={[
                      {
                        name: t("common:materials.wood", {
                          defaultValue: "Wood",
                        }),
                        value: itemStats?.total_wood || 0,
                        color: "blue.6",
                      },
                      {
                        name: t("common:materials.metal", {
                          defaultValue: "Metal",
                        }),
                        value: itemStats?.total_metal || 0,
                        color: "green.6",
                      },
                      {
                        name: t("common:materials.textile", {
                          defaultValue: "Textile",
                        }),
                        value: itemStats?.total_textile || 0,
                        color: "yellow.6",
                      },
                      {
                        name: t("common:materials.glass", {
                          defaultValue: "Glass",
                        }),
                        value: itemStats?.total_glass || 0,
                        color: "red.6",
                      },
                      {
                        name: t("common:materials.plastic", {
                          defaultValue: "Plastic",
                        }),
                        value: itemStats?.total_plastic || 0,
                        color: "violet.6",
                      },
                      {
                        name: t("common:materials.other", {
                          defaultValue: "Other",
                        }),
                        value: itemStats?.total_other || 0,
                        color: "gray.6",
                      },
                      {
                        name: t("common:materials.mixed", {
                          defaultValue: "Mixed",
                        }),
                        value: itemStats?.total_mixed || 0,
                        color: "cyan.6",
                      },
                    ]}
                  />
                )}
                <ChartLegend
                  data={[
                    {
                      label: t("common:materials.wood", {
                        defaultValue: "Wood",
                      }),
                      color: "blue.6",
                    },
                    {
                      label: t("common:materials.metal", {
                        defaultValue: "Metal",
                      }),
                      color: "green.6",
                    },
                    {
                      label: t("common:materials.textile", {
                        defaultValue: "Textile",
                      }),
                      color: "yellow.6",
                    },
                    {
                      label: t("common:materials.glass", {
                        defaultValue: "Glass",
                      }),
                      color: "red.6",
                    },
                    {
                      label: t("common:materials.plastic", {
                        defaultValue: "Plastic",
                      }),
                      color: "violet.6",
                    },
                    {
                      label: t("common:materials.other", {
                        defaultValue: "Other",
                      }),
                      color: "gray.6",
                    },
                    {
                      label: t("common:materials.mixed", {
                        defaultValue: "Mixed",
                      }),
                      color: "cyan.6",
                    },
                  ]}
                />
              </Stack>

              {/* Category Chart */}
              <Stack align="center">
                <Text fw={700} size="sm" c="dimmed" tt="uppercase">
                  {t("listings.analytics.by_type")}
                </Text>
                {isItemStatsLoading ? (
                  <Loader size="xl" />
                ) : (itemStats?.total_listings || 0) +
                    (itemStats?.total_deposits || 0) ===
                  0 ? (
                  <Text c="dimmed">{t("listings.analytics.no_data")}</Text>
                ) : (
                  <PieChart
                    withTooltip
                    strokeWidth={2}
                    tooltipDataSource="segment"
                    labelsPosition="inside"
                    labelsType="percent"
                    withLabels
                    h={280}
                    w={280}
                    data={[
                      {
                        name: t("validations.overview.types.listing"),
                        value: itemStats?.total_listings || 0,
                        color: "indigo.6",
                      },
                      {
                        name: t("validations.overview.types.deposit"),
                        value: itemStats?.total_deposits || 0,
                        color: "cyan.6",
                      },
                    ]}
                  />
                )}
                <ChartLegend
                  data={[
                    {
                      label: t("validations.overview.types.listing"),
                      color: "indigo.6",
                    },
                    {
                      label: t("validations.overview.types.deposit"),
                      color: "cyan.6",
                    },
                  ]}
                />
              </Stack>
            </SimpleGrid>
          </Paper>
        </Grid.Col>
      </Grid>

      {/* Search and filters */}
      <Stack gap="md" my="xl">
        <Title c="dimmed" order={3}>
          {t("listings.filters.title")}
        </Title>

        {/* filter options */}
        <Grid align="flex-end">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <TextInput
              label={t("history.filters.search")}
              placeholder={t("listings.filters.search_placeholder")}
              rightSection={<IconSearch size={14} />}
              disabled={isItemsLoading}
              value={filters.searchValue}
              onChange={(e) =>
                handleFilterChange("searchValue", e.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSearchClick();
                }
              }}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 6, sm: 4, md: 2 }}>
            <Select
              label={t("history.filters.sort")}
              placeholder={t("history.filters.sort_placeholder")}
              data={[
                {
                  value: "most_recent_creation",
                  label: t("listings.filters.sort.most_recent"),
                },
                {
                  value: "oldest_creation",
                  label: t("listings.filters.sort.oldest"),
                },
                {
                  value: "highest_price",
                  label: t("listings.filters.sort.highest_price"),
                },
                {
                  value: "lowest_price",
                  label: t("listings.filters.sort.lowest_price"),
                },
              ]}
              clearable
              value={filters.sortValue}
              disabled={isItemsLoading}
              onChange={(val) => handleFilterChange("sortValue", val)}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 6, sm: 4, md: 2 }}>
            <Select
              label={t("history.filters.status")}
              placeholder={t("users.status.all")}
              data={[
                { value: "pending", label: t("status.pending") },
                { value: "approved", label: t("status.approved") },
                { value: "refused", label: t("status.refused") },
                {
                  value: "completed",
                  label: t("status.completed", { defaultValue: "Completed" }),
                },
              ]}
              value={filters.statusValue}
              disabled={isItemsLoading}
              onChange={(val) => handleFilterChange("statusValue", val)}
              clearable
            />
          </Grid.Col>

          <Grid.Col span={{ base: 6, sm: 4, md: 2 }}>
            <Select
              label={t("history.filters.material", {
                defaultValue: "Material",
              })}
              placeholder={t("common:materials.all", {
                defaultValue: "All materials",
              })}
              data={[
                { value: "wood", label: t("common:materials.wood") },
                { value: "metal", label: t("common:materials.metal") },
                { value: "textile", label: t("common:materials.textile") },
                { value: "glass", label: t("common:materials.glass") },
                { value: "plastic", label: t("common:materials.plastic") },
                { value: "other", label: t("common:materials.other") },
                { value: "mixed", label: t("common:materials.mixed") },
              ]}
              value={filters.materialValue}
              disabled={isItemsLoading}
              onChange={(val) => handleFilterChange("materialValue", val)}
              clearable
            />
          </Grid.Col>

          <Grid.Col span={{ base: 6, sm: 4, md: 2 }}>
            <Select
              label={t("history.table.module")}
              placeholder={t("history.filters.module_placeholder")}
              data={[
                {
                  value: "listing",
                  label: t("validations.overview.types.listing"),
                },
                {
                  value: "deposit",
                  label: t("validations.overview.types.deposit"),
                },
              ]}
              value={filters.categoryValue}
              disabled={isItemsLoading}
              onChange={(val) => handleFilterChange("categoryValue", val)}
              clearable
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 12 }}>
            <Group gap="xs" grow>
              <Button variant="primary" onClick={handleSearchClick}>
                {t("history.filters.apply")}
              </Button>
              <Button variant="secondary" onClick={handleResetFilters}>
                {t("history.filters.reset")}
              </Button>
            </Group>
          </Grid.Col>
        </Grid>
      </Stack>

      <AdminTable
        loading={isItemsLoading}
        error={itemsError}
        header={[
          t("validations.table.submitted_on"),
          t("users.table.id"),
          t("validations.table.title"),
          t("listings.table.creator"),
          t("history.table.module"),
          t("history.filters.material", { defaultValue: "Material" }),
          t("validations.table.price"),
          t("users.table.status"),
          t("users.table.actions"),
        ]}
        footer={
          <PaginationFooter
            activePage={activePage}
            setPage={setPage}
            total_records={items?.total_records || 0}
            last_page={items?.last_page || 1}
            limit={LIMIT}
            loading={isItemsLoading}
            hidden={hasFilters}
          />
        }
      >
        {/* mapping here */}
        {allItems.length > 0 ? (
          allItems.map((item) => (
            <Table.Tr
              key={item.id}
              style={{ cursor: "pointer" }}
              onClick={() =>
                navigate(PATHS.ADMIN.LISTINGS + "/" + item.id, {
                  state: { from: "allItems", category: item.category },
                })
              }
            >
              <Table.Td ta="center">
                {dayjs(item.created_at).format("DD/MM/YYYY")}
              </Table.Td>
              <Table.Td ta="center">{item.id}</Table.Td>
              <Table.Td ta="center">{item.title}</Table.Td>
              <Table.Td ta="center">{item.username}</Table.Td>
              <Table.Td ta="center">
                <Pill variant={item.category === "listing" ? "green" : "blue"}>
                  {item.category.toUpperCase()}
                </Pill>
              </Table.Td>
              <Table.Td ta="center">
                {t(`common:materials.${item.material}` as any, {
                  defaultValue:
                    item.material.charAt(0).toUpperCase() +
                    item.material.slice(1),
                })}
              </Table.Td>
              <Table.Td ta="center">{item.price}</Table.Td>
              <Table.Td ta="center">
                {item.status === "pending" ? (
                  <Badge variant="blue">{t("status.pending")}</Badge>
                ) : item.status === "approved" ? (
                  <Badge variant="green">{t("status.approved")}</Badge>
                ) : item.status === "refused" ? (
                  <Badge variant="red">{t("status.refused")}</Badge>
                ) : (
                  <Badge variant="gray">
                    {t("status.completed", { defaultValue: "Completed" })}
                  </Badge>
                )}
              </Table.Td>
              <Table.Td ta="center">
                <Button
                  variant="delete"
                  size="xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleModalDelete(item);
                  }}
                >
                  {t("actions.delete")}
                </Button>
              </Table.Td>
            </Table.Tr>
          ))
        ) : (
          <Table.Tr>
            <Table.Td colSpan={9} ta="center">
              {t("listings.table.no_items")}
            </Table.Td>
          </Table.Tr>
        )}
      </AdminTable>
      <Modal
        title={t("listings.delete_modal.title")}
        opened={openedDelete}
        onClose={closeDelete}
      >
        {t("listings.delete_modal.text")}
        <Group mt="lg" justify="flex-end">
          <Button onClick={closeDelete} variant="grey">
            {t("users.delete_modal.cancel")}
          </Button>
          <Button
            onClick={(e) => {
              handleDeleteItem(e);
            }}
            variant="delete"
            loading={deleteItemMutation.isPending}
          >
            {t("actions.delete")}
          </Button>
        </Group>
      </Modal>
    </Container>
  );
}
