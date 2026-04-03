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
import { AdminCardInfo } from "../../../components/admin/AdminCardInfo";
import { StatsCardDesc } from "../../../components/admin/AdminCardInfo";
import {
  IconCalendarEvent,
  IconClockPause,
  IconChecklist,
  IconArrowUpRight,
  IconSearch,
} from "@tabler/icons-react";
import { PieChart } from "@mantine/charts";
import { Paper, Text } from "@mantine/core";
import AdminTable from "../../../components/admin/AdminTable";
import PaginationFooter from "../../../components/PaginationFooter";
import {
  useDeleteItem,
  useGetAllItems,
  useGetItemStats,
} from "../../../hooks/itemHooks";
import FullScreenLoader from "../../../components/FullScreenLoader";
import { useState } from "react";
import { PATHS } from "../../../routes/paths";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import type { Item } from "../../../api/interfaces/item";
import { useDisclosure } from "@mantine/hooks";
import { showSuccessNotification } from "../../../components/NotificationToast";

export function AdminListingModule() {
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
          showSuccessNotification("Item deleted", "Item deleted successfully");
          closeDelete();
        },
      });
    }
  };

  if (isItemsLoading) {
    return <FullScreenLoader />;
  }
  return (
    <Container px="md" size="xl">
      <Group justify="space-between" mb="xl">
        <Title order={2} mt="lg">
          Listing Management
        </Title>
        <Select
          label="Timeframe"
          placeholder="All time"
          value={chartTime}
          disabled={isItemStatsLoading}
          onChange={(value) => setChartTime(value)}
          data={[
            { value: "all", label: "All Time" },
            { value: "today", label: "Today" },
            { value: "last_3_days", label: "Last 3 days" },
            { value: "last_week", label: "Last 7 days" },
            { value: "last_month", label: "Last 30 days" },
            { value: "last_year", label: "Last 365 days" },
          ]}
        />
      </Group>

      {/* stats cards */}
      <SimpleGrid cols={{ base: 1, sm: 3 }} mb="sm">
        <AdminCardInfo
          icon={IconCalendarEvent}
          title="Total Active Objects *"
          value={itemStats?.active || 0}
          loading={isItemStatsLoading}
          description={
            <StatsCardDesc
              stats={itemStats?.new_since || 0}
              icon={IconArrowUpRight}
              description={
                itemStats?.new_since != 1
                  ? " new objects posted since last month"
                  : " new object posted since last month"
              }
            />
          }
        />
        <AdminCardInfo
          icon={IconClockPause}
          title="Pending Approval *"
          value={itemStats?.pending || 0}
          loading={isItemStatsLoading}
          description={
            <StatsCardDesc
              stats={itemStats?.pending || 0}
              description={
                itemStats?.pending != 1
                  ? " objects require validation"
                  : " object require validation"
              }
            />
          }
        />
        <AdminCardInfo
          icon={IconChecklist}
          title="Completed Transactions"
          value={itemStats?.total_transactions || 0}
          loading={isItemStatsLoading}
          description={
            <StatsCardDesc
              stats={itemStats?.new_transactions_since || 0}
              icon={IconArrowUpRight}
              description={
                itemStats?.new_transactions_since != 1
                  ? " new transactions since last month"
                  : " new transaction since last month"
              }
            />
          }
        />
      </SimpleGrid>

      {/* 2. Bottom Row: Distribution Analysis */}
      <Text size="sm" c="dimmed" mb="xl">
        * Timeframe not applicable for these metrics
      </Text>
      <Grid align="stretch">
        <Grid.Col span={12}>
          <Paper withBorder p="lg" radius="md" shadow="sm" variant="primary">
            <Group justify="space-between" mb="xl">
              <Stack gap={0}>
                <Title order={4}>Objects Analytics</Title>
                <Text size="sm" c="dimmed">
                  Distribution by material and category
                </Text>
              </Stack>
            </Group>

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
              {/* Material Chart */}
              <Stack align="center">
                <Text fw={700} size="sm" c="dimmed" tt="uppercase">
                  By Material
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
                  <Text c="dimmed">
                    No data available during the selected timeframe
                  </Text>
                ) : (
                  <PieChart
                    withLabelsLine
                    labelsPosition="outside"
                    labelsType="value"
                    withLabels
                    withTooltip
                    tooltipDataSource="segment"
                    h={280}
                    data={[
                      {
                        name: "Wood",
                        value: itemStats?.total_wood || 0,
                        color: "blue.6",
                      },
                      {
                        name: "Metal",
                        value: itemStats?.total_metal || 0,
                        color: "green.6",
                      },
                      {
                        name: "Textile",
                        value: itemStats?.total_textile || 0,
                        color: "yellow.6",
                      },
                      {
                        name: "Glass",
                        value: itemStats?.total_glass || 0,
                        color: "red.6",
                      },
                      {
                        name: "Plastic",
                        value: itemStats?.total_plastic || 0,
                        color: "violet.6",
                      },
                      {
                        name: "Other",
                        value: itemStats?.total_other || 0,
                        color: "gray.6",
                      },
                      {
                        name: "Mixed",
                        value: itemStats?.total_mixed || 0,
                        color: "cyan.6",
                      },
                    ]}
                  />
                )}
              </Stack>

              {/* Category Chart */}
              <Stack align="center">
                <Text fw={700} size="sm" c="dimmed" tt="uppercase">
                  By Type
                </Text>
                {(itemStats?.total_listings || 0) +
                  (itemStats?.total_deposits || 0) ===
                0 ? (
                  <Text c="dimmed">
                    No data available during the selected timeframe
                  </Text>
                ) : isItemStatsLoading ? (
                  <Loader size="xl" />
                ) : (
                  <PieChart
                    withTooltip
                    strokeWidth={2}
                    tooltipDataSource="segment"
                    labelsPosition="inside"
                    labelsType="percent"
                    withLabels
                    h={280}
                    data={[
                      {
                        name: "Listing",
                        value: itemStats?.total_listings || 0,
                        color: "indigo.6",
                      },
                      {
                        name: "Deposit",
                        value: itemStats?.total_deposits || 0,
                        color: "cyan.6",
                      },
                    ]}
                  />
                )}
              </Stack>
            </SimpleGrid>
          </Paper>
        </Grid.Col>
      </Grid>

      {/* Search and filters */}
      <Stack gap="md" my="xl">
        <Title c="dimmed" order={3}>
          Manage listings and deposits
        </Title>

        {/* filter options */}
        <Grid align="flex-end">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <TextInput
              label="Search"
              variant="filled"
              placeholder="Search by owner's name, item's ID or title..."
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
              label="Sort by"
              placeholder="Pick one sort method"
              data={[
                {
                  value: "most_recent_creation",
                  label: "Most recent creation",
                },
                { value: "oldest_creation", label: "Oldest creation" },
                {
                  value: "highest_price",
                  label: "Highest price",
                },
                {
                  value: "lowest_price",
                  label: "Lowest price",
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
              label="Status"
              placeholder="All status"
              data={[
                { value: "pending", label: "Pending" },
                { value: "approved", label: "Approved" },
                { value: "refused", label: "Refused" },
                { value: "completed", label: "Completed" },
              ]}
              value={filters.statusValue}
              disabled={isItemsLoading}
              onChange={(val) => handleFilterChange("statusValue", val)}
              clearable
            />
          </Grid.Col>

          <Grid.Col span={{ base: 6, sm: 4, md: 2 }}>
            <Select
              label="Material"
              placeholder="All materials"
              data={[
                { value: "wood", label: "Wood" },
                { value: "metal", label: "Metal" },
                { value: "textile", label: "Textile" },
                { value: "glass", label: "Glass" },
                { value: "plastic", label: "Plastic" },
                { value: "other", label: "Other" },
                { value: "mixed", label: "Mixed" },
              ]}
              value={filters.materialValue}
              disabled={isItemsLoading}
              onChange={(val) => handleFilterChange("materialValue", val)}
              clearable
            />
          </Grid.Col>

          <Grid.Col span={{ base: 6, sm: 4, md: 2 }}>
            <Select
              label="Category"
              placeholder="All categories"
              data={[
                { value: "listing", label: "Listing" },
                { value: "deposit", label: "Deposit" },
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
                Apply filters
              </Button>
              <Button variant="secondary" onClick={handleResetFilters}>
                Reset
              </Button>
            </Group>
          </Grid.Col>
        </Grid>
      </Stack>

      <AdminTable
        loading={isItemsLoading}
        error={itemsError}
        header={[
          "Created on",
          "ID",
          "Title",
          "Creator",
          "Category",
          "Material",
          "Price",
          "Status",
          "Actions",
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
              // onClick={() =>
              //   navigate(PATHS.ADMIN.POSTS + "/" + post.id, {
              //     state: { from: "allPosts" },
              //   })
              // }
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
                {item.material.charAt(0).toUpperCase() + item.material.slice(1)}
              </Table.Td>
              <Table.Td ta="center">{item.price}</Table.Td>
              <Table.Td ta="center">
                {item.status === "pending" ? (
                  <Badge variant="blue">Pending</Badge>
                ) : item.status === "approved" ? (
                  <Badge variant="green">Approved</Badge>
                ) : item.status === "refused" ? (
                  <Badge variant="red">Refused</Badge>
                ) : (
                  <Badge variant="gray">Completed</Badge>
                )}
              </Table.Td>
              <Table.Td ta="center">
                <Button
                  variant="delete"
                  size="xs"
                  onClick={() => handleModalDelete(item)}
                >
                  Delete
                </Button>
              </Table.Td>
            </Table.Tr>
          ))
        ) : (
          <Table.Tr>
            <Table.Td colSpan={9} ta="center">
              No items found
            </Table.Td>
          </Table.Tr>
        )}
      </AdminTable>
      <Modal
        title="Delete this object?"
        opened={openedDelete}
        onClose={closeDelete}
      >
        Are you sure you want to delete this object? This object will be soft
        deleted.
        <Group mt="lg" justify="flex-end">
          <Button onClick={closeDelete} variant="grey">
            Cancel
          </Button>
          <Button
            onClick={(e) => {
              handleDeleteItem(e);
            }}
            variant="delete"
            loading={deleteItemMutation.isPending}
          >
            Delete
          </Button>
        </Group>
      </Modal>
    </Container>
  );
}
