import { useState } from "react";
import {
  Container,
  Tabs,
  Text,
  Table,
  Button,
  Title,
  Group,
  Badge,
  Modal,
  Textarea,
  Grid,
  TextInput,
  Select,
  Stack,
  Paper,
  SimpleGrid,
  Divider,
  Loader,
  Pill,
} from "@mantine/core";
import {
  IconCheck,
  IconX,
  IconSearch,
  IconSofa,
  IconTags,
  IconCalendarEvent,
  IconHistory,
  IconChartBar,
  IconClockHour4,
  IconCircleCheck,
  IconCircleX,
} from "@tabler/icons-react";
import { PieChart } from "@mantine/charts";
import { useDisclosure } from "@mantine/hooks";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

import AdminTable from "../../../components/admin/AdminTable";
import { AdminCardInfo } from "../../../components/admin/AdminCardInfo";
import PaginationFooter from "../../../components/common/PaginationFooter";
import { PATHS } from "../../../routes/paths";
import {
  usePendingDeposits,
  usePendingListings,
  useValidationStats,
  useAllItemsHistory,
  useProcessValidation,
} from "../../../hooks/validationHooks";
import {
  useGetAllEvents,
  useApproveRefuseEvent,
} from "../../../hooks/eventHooks";
import { ChartLegend } from "../../../components/common/chart/ChartLegend";

const LIMIT = 10;

// ─── Helpers ────────────────────────────────────────────────────────────────

function getStatusBadge(status: string) {
  switch (status) {
    case "approved":
      return <Badge color="green">Approved</Badge>;
    case "refused":
      return <Badge color="red">Refused</Badge>;
    case "pending":
      return <Badge color="yellow">Pending</Badge>;
    default:
      return <Badge color="gray">{status}</Badge>;
  }
}

interface FiltersState {
  searchValue: string;
  sortValue: string | null;
  statusValue: string | null;
  typeValue: string | null;
}

const defaultFilters: FiltersState = {
  searchValue: "",
  sortValue: null,
  statusValue: null,
  typeValue: null,
};

// ─── Overview Tab ────────────────────────────────────────────────────────────

function OverviewTab() {
  const { data: stats, isLoading, isError } = useValidationStats();

  const totalPending =
    (stats?.pending_deposits ?? 0) +
    (stats?.pending_listings ?? 0) +
    (stats?.pending_events ?? 0);

  const totalApproved =
    (stats?.approved_deposits ?? 0) +
    (stats?.approved_listings ?? 0) +
    (stats?.approved_events ?? 0);

  const totalRefused =
    (stats?.refused_deposits ?? 0) +
    (stats?.refused_listings ?? 0) +
    (stats?.refused_events ?? 0);

  const totalProcessed = totalApproved + totalRefused;
  const approvalRate =
    totalProcessed > 0 ? Math.round((totalApproved / totalProcessed) * 100) : 0;

  const chartData = [
    { name: "Pending", value: totalPending, color: "orange.5" },
    { name: "Approved", value: totalApproved, color: "green.6" },
    { name: "Refused", value: totalRefused, color: "red.6" },
  ].filter((d) => d.value > 0);

  return (
    <Stack gap="xl" mt="md">
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        <AdminCardInfo
          title="Total Pending"
          icon={IconClockHour4}
          value={totalPending}
          loading={isLoading}
          error={isError}
        />
        <AdminCardInfo
          title="Total Approved"
          icon={IconCircleCheck}
          value={totalApproved}
          loading={isLoading}
          error={isError}
        />
        <AdminCardInfo
          title="Total Refused"
          icon={IconCircleX}
          value={totalRefused}
          loading={isLoading}
          error={isError}
        />
        <AdminCardInfo
          title="Approval Rate"
          icon={IconChartBar}
          value={`${approvalRate}%`}
          loading={isLoading}
          error={isError}
        />
      </SimpleGrid>

      <Grid>
        {/* Pie chart — global status distribution */}
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Paper withBorder p="lg" radius="md" shadow="sm" h="100%">
            <Text fw={600} mb="md">
              Overall Status Distribution
            </Text>
            {isLoading ? (
              <Group justify="center" py="xl">
                <Loader />
              </Group>
            ) : (
              <PieChart
                data={chartData}
                withLabelsLine
                withLabels
                withTooltip
                tooltipDataSource="segment"
                h={280}
                w={280}
                mx="auto"
              />
            )}
            <ChartLegend
              data={[
                { label: "Approved", color: "green.6" },
                { label: "Pending", color: "orange.5" },
                { label: "Refused", color: "red.6" },
              ]}
            />
          </Paper>
        </Grid.Col>

        {/* Per-type breakdown */}
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Paper withBorder p="lg" radius="md" shadow="sm" h="100%">
            <Text fw={600} mb="md">
              Breakdown by Type
            </Text>
            {isLoading ? (
              <Group justify="center" py="xl">
                <Loader />
              </Group>
            ) : (
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Type</Table.Th>
                    <Table.Th ta="center">Pending</Table.Th>
                    <Table.Th ta="center">Approved</Table.Th>
                    <Table.Th ta="center">Refused</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  <Table.Tr>
                    <Table.Td fw={500}>Deposits</Table.Td>
                    <Table.Td ta="center">
                      <Badge color="orange" variant="light">
                        {stats?.pending_deposits ?? 0}
                      </Badge>
                    </Table.Td>
                    <Table.Td ta="center">
                      <Badge color="green" variant="light">
                        {stats?.approved_deposits ?? 0}
                      </Badge>
                    </Table.Td>
                    <Table.Td ta="center">
                      <Badge color="red" variant="light">
                        {stats?.refused_deposits ?? 0}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td fw={500}>Listings</Table.Td>
                    <Table.Td ta="center">
                      <Badge color="orange" variant="light">
                        {stats?.pending_listings ?? 0}
                      </Badge>
                    </Table.Td>
                    <Table.Td ta="center">
                      <Badge color="green" variant="light">
                        {stats?.approved_listings ?? 0}
                      </Badge>
                    </Table.Td>
                    <Table.Td ta="center">
                      <Badge color="red" variant="light">
                        {stats?.refused_listings ?? 0}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td fw={500}>Events</Table.Td>
                    <Table.Td ta="center">
                      <Badge color="orange" variant="light">
                        {stats?.pending_events ?? 0}
                      </Badge>
                    </Table.Td>
                    <Table.Td ta="center">
                      <Badge color="green" variant="light">
                        {stats?.approved_events ?? 0}
                      </Badge>
                    </Table.Td>
                    <Table.Td ta="center">
                      <Badge color="red" variant="light">
                        {stats?.refused_events ?? 0}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                </Table.Tbody>
              </Table>
            )}
          </Paper>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}

// ─── Shared filter bar ───────────────────────────────────────────────────────

interface FilterBarProps {
  filters: FiltersState;
  onFilterChange: (key: keyof FiltersState, value: string | null) => void;
  onApply: () => void;
  onReset: () => void;
  showStatus?: boolean;
  showType?: boolean;
}

function FilterBar({
  filters,
  onFilterChange,
  onApply,
  onReset,
  showStatus = false,
  showType = false,
}: FilterBarProps) {
  // Always total to 12 columns to ensure consistent length across all tabs
  const searchSpan = 12 - (showStatus ? 2 : 0) - (showType ? 2 : 0) - 2 - 3;

  return (
    <Grid align="flex-end" mb="md">
      <Grid.Col span={{ base: 12, md: searchSpan }}>
        <TextInput
          label="Search"
          variant="filled"
          placeholder="Search items by title, username or ID..."
          rightSection={<IconSearch size={14} />}
          value={filters.searchValue}
          onChange={(e) => onFilterChange("searchValue", e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onApply()}
        />
      </Grid.Col>

      {showStatus && (
        <Grid.Col span={{ base: 6, md: 2 }}>
          <Select
            label="Status"
            placeholder="All status"
            data={[
              { value: "pending", label: "Pending" },
              { value: "approved", label: "Approved" },
              { value: "refused", label: "Refused" },
            ]}
            value={filters.statusValue}
            onChange={(val) => onFilterChange("statusValue", val)}
            clearable
          />
        </Grid.Col>
      )}

      {showType && (
        <Grid.Col span={{ base: 6, md: 2 }}>
          <Select
            label="Type"
            placeholder="All types"
            data={[
              { value: "Deposit", label: "Deposit" },
              { value: "Listing", label: "Listing" },
              { value: "Event", label: "Event" },
            ]}
            value={filters.typeValue}
            onChange={(val) => onFilterChange("typeValue", val)}
            clearable
          />
        </Grid.Col>
      )}

      <Grid.Col span={{ base: 6, md: 2 }}>
        <Select
          label="Sort by"
          placeholder="Default"
          data={[
            { value: "oldest", label: "Oldest first" },
            { value: "most_recent", label: "Most recent first" },
          ]}
          value={filters.sortValue}
          onChange={(val) => onFilterChange("sortValue", val)}
          clearable
        />
      </Grid.Col>

      <Grid.Col span={{ base: 12, md: 3 }}>
        <Group gap="xs" grow>
          <Button variant="primary" onClick={onApply}>
            Search
          </Button>
          <Button variant="secondary" onClick={onReset}>
            Reset
          </Button>
        </Group>
      </Grid.Col>
    </Grid>
  );
}

// ─── Deposits Tab ────────────────────────────────────────────────────────────

interface ActionHandlers {
  onApprove: (id: number, type: "listings" | "deposits" | "events") => void;
  onOpenRefuse: (id: number, type: "listings" | "deposits" | "events") => void;
  navigate: ReturnType<typeof useNavigate>;
}

function DepositsTab({ onApprove, onOpenRefuse, navigate }: ActionHandlers) {
  const [activePage, setPage] = useState(1);
  const [filters, setFilters] = useState<FiltersState>(defaultFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<FiltersState>(defaultFilters);

  const hasFilters = !!(appliedFilters.searchValue || appliedFilters.sortValue);

  const { data, isLoading, isError } = usePendingDeposits(
    hasFilters ? -1 : activePage,
    hasFilters ? -1 : LIMIT,
    {
      search: appliedFilters.searchValue || undefined,
      sort: appliedFilters.sortValue || undefined,
    },
  );

  const deposits = data?.deposits ?? [];

  const handleApply = () => {
    setPage(1);
    setAppliedFilters({ ...filters });
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setPage(1);
  };

  return (
    <Stack gap="sm" mt="md">
      <FilterBar
        filters={filters}
        onFilterChange={(key, val) =>
          setFilters((prev) => ({ ...prev, [key]: val }))
        }
        onApply={handleApply}
        onReset={handleReset}
      />
      <AdminTable
        loading={isLoading}
        error={isError ? new Error("Could not load pending deposits.") : null}
        header={[
          "Submitted on",
          "ID",
          "Title",
          "User",
          "Container",
          "Material",
          "Actions",
        ]}
        footer={
          <PaginationFooter
            activePage={activePage}
            setPage={setPage}
            total_records={data?.total_records || 0}
            last_page={data?.last_page || 1}
            limit={LIMIT}
            loading={isLoading}
            hidden={hasFilters}
          />
        }
      >
        {deposits.length === 0 && !isLoading ? (
          <Table.Tr>
            <Table.Td colSpan={7} ta="center">
              <Text c="dimmed" py="md">
                No pending deposits found.
              </Text>
            </Table.Td>
          </Table.Tr>
        ) : (
          deposits.map((d) => (
            <Table.Tr
              key={d.id_item}
              style={{ cursor: "pointer" }}
              onClick={() =>
                navigate(
                  `${PATHS.ADMIN.VALIDATIONS.ALL}/deposits/${d.id_item}`,
                  {
                    state: { item: d },
                  },
                )
              }
            >
              <Table.Td ta="center">
                {dayjs(d.created_at).format("DD/MM/YYYY")}
              </Table.Td>
              <Table.Td ta="center">
                <strong>{d.id_item}</strong>
              </Table.Td>
              <Table.Td ta="center">{d.title}</Table.Td>
              <Table.Td ta="center">{d.username}</Table.Td>
              <Table.Td ta="center">
                {d.city_name} ({d.postal_code})
              </Table.Td>
              <Table.Td ta="center">{d.material}</Table.Td>
              <Table.Td ta="center">
                <Group
                  gap="xs"
                  justify="center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    size="xs"
                    variant="primary"
                    leftSection={<IconCheck size={14} />}
                    onClick={() => onApprove(d.id_item, "deposits")}
                  >
                    Approve
                  </Button>
                  <Button
                    size="xs"
                    variant="delete"
                    leftSection={<IconX size={14} />}
                    onClick={() => onOpenRefuse(d.id_item, "deposits")}
                  >
                    Refuse
                  </Button>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))
        )}
      </AdminTable>
    </Stack>
  );
}

// ─── Listings Tab ────────────────────────────────────────────────────────────

function ListingsTab({ onApprove, onOpenRefuse, navigate }: ActionHandlers) {
  const [activePage, setPage] = useState(1);
  const [filters, setFilters] = useState<FiltersState>(defaultFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<FiltersState>(defaultFilters);

  const hasFilters = !!(appliedFilters.searchValue || appliedFilters.sortValue);

  const { data, isLoading, isError } = usePendingListings(
    hasFilters ? -1 : activePage,
    hasFilters ? -1 : LIMIT,
    {
      search: appliedFilters.searchValue || undefined,
      sort: appliedFilters.sortValue || undefined,
    },
  );

  const listings = data?.listings ?? [];

  const handleApply = () => {
    setPage(1);
    setAppliedFilters({ ...filters });
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setPage(1);
  };

  return (
    <Stack gap="sm" mt="md">
      <FilterBar
        filters={filters}
        onFilterChange={(key, val) =>
          setFilters((prev) => ({ ...prev, [key]: val }))
        }
        onApply={handleApply}
        onReset={handleReset}
      />
      <AdminTable
        loading={isLoading}
        error={isError ? new Error("Could not load pending listings.") : null}
        header={[
          "Submitted on",
          "ID",
          "Title",
          "User",
          "City",
          "Price",
          "Actions",
        ]}
        footer={
          !hasFilters &&
          data &&
          data.total_records > 0 && (
            <PaginationFooter
              activePage={activePage}
              setPage={setPage}
              total_records={data?.total_records || 0}
              last_page={data?.last_page || 1}
              limit={LIMIT}
              loading={isLoading}
              hidden={hasFilters}
            />
          )
        }
      >
        {listings.length === 0 && !isLoading ? (
          <Table.Tr>
            <Table.Td colSpan={7} ta="center">
              <Text c="dimmed" py="md">
                No pending listings found.
              </Text>
            </Table.Td>
          </Table.Tr>
        ) : (
          listings.map((l) => (
            <Table.Tr
              key={l.id_item}
              style={{ cursor: "pointer" }}
              onClick={() =>
                navigate(
                  `${PATHS.ADMIN.VALIDATIONS.ALL}/listings/${l.id_item}`,
                  {
                    state: { item: l },
                  },
                )
              }
            >
              <Table.Td ta="center">
                {dayjs(l.created_at).format("DD/MM/YYYY")}
              </Table.Td>
              <Table.Td ta="center">
                <strong>{l.id_item}</strong>
              </Table.Td>
              <Table.Td ta="center">{l.title}</Table.Td>
              <Table.Td ta="center">{l.username}</Table.Td>
              <Table.Td ta="center">
                {l.city_name} ({l.postal_code})
              </Table.Td>
              <Table.Td ta="center">
                {l.price != null ? `${l.price} €` : "—"}
              </Table.Td>
              <Table.Td ta="center">
                <Group
                  gap="xs"
                  justify="center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    size="xs"
                    variant="primary"
                    leftSection={<IconCheck size={14} />}
                    onClick={() => onApprove(l.id_item, "listings")}
                  >
                    Approve
                  </Button>
                  <Button
                    size="xs"
                    variant="delete"
                    leftSection={<IconX size={14} />}
                    onClick={() => onOpenRefuse(l.id_item, "listings")}
                  >
                    Refuse
                  </Button>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))
        )}
      </AdminTable>
    </Stack>
  );
}

// ─── Events Tab ──────────────────────────────────────────────────────────────

function EventsTab({ navigate }: Pick<ActionHandlers, "navigate">) {
  const [activePage, setPage] = useState(1);
  const [filters, setFilters] = useState<FiltersState>(defaultFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<FiltersState>(defaultFilters);

  // refuse modal state
  const [refuseOpened, { open: openRefuse, close: closeRefuse }] =
    useDisclosure(false);
  const [pendingRefuseId, setPendingRefuseId] = useState<number | null>(null);
  const [refuseReason, setRefuseReason] = useState("");

  const hasFilters = !!(appliedFilters.searchValue || appliedFilters.sortValue);

  const { data, isLoading, isError } = useGetAllEvents(
    hasFilters ? undefined : activePage,
    hasFilters ? undefined : LIMIT,
    appliedFilters.searchValue || undefined,
    "pending",
    appliedFilters.sortValue || undefined,
    true,
  );

  const events = data?.events ?? [];

  const statusMutation = useApproveRefuseEvent();

  const handleApprove = (id: number) => {
    statusMutation.mutate({ id, status: "approved" });
  };

  const handleOpenRefuse = (id: number) => {
    setPendingRefuseId(id);
    setRefuseReason("");
    openRefuse();
  };

  const handleConfirmRefuse = () => {
    if (pendingRefuseId !== null && refuseReason.trim().length > 0) {
      statusMutation.mutate(
        { id: pendingRefuseId, status: "refused" },
        {
          onSuccess: () => {
            closeRefuse();
            setRefuseReason("");
          },
        },
      );
    }
  };

  const handleApply = () => {
    setPage(1);
    setAppliedFilters({ ...filters });
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setPage(1);
  };

  return (
    <Stack gap="sm" mt="md">
      <FilterBar
        filters={filters}
        onFilterChange={(key, val) =>
          setFilters((prev) => ({ ...prev, [key]: val }))
        }
        onApply={handleApply}
        onReset={handleReset}
      />
      <AdminTable
        loading={isLoading}
        error={isError ? new Error("Could not load pending events.") : null}
        header={[
          "Submitted on",
          "ID",
          "Title",
          "Creator",
          "Category",
          "Start date",
          "Actions",
        ]}
        footer={
          !hasFilters &&
          data &&
          data.total_records > 0 && (
            <PaginationFooter
              activePage={activePage}
              setPage={setPage}
              total_records={data?.total_records || 0}
              last_page={data?.last_page || 1}
              limit={LIMIT}
              loading={isLoading}
              hidden={hasFilters}
            />
          )
        }
      >
        {events.length === 0 && !isLoading ? (
          <Table.Tr>
            <Table.Td colSpan={7} ta="center">
              <Text c="dimmed" py="md">
                No pending events found.
              </Text>
            </Table.Td>
          </Table.Tr>
        ) : (
          events.map((ev) => (
            <Table.Tr
              key={ev.id}
              style={{ cursor: "pointer" }}
              onClick={() =>
                navigate(`${PATHS.ADMIN.EVENTS.ALL}/${ev.id}`, {
                  state: "validationHub",
                })
              }
            >
              <Table.Td ta="center">
                {dayjs(ev.created_at).format("DD/MM/YYYY")}
              </Table.Td>
              <Table.Td ta="center">
                <strong>{ev.id}</strong>
              </Table.Td>
              <Table.Td ta="center">{ev.title}</Table.Td>
              <Table.Td ta="center">{ev.employee_name ?? "Unknown"}</Table.Td>
              <Table.Td ta="center">
                <Pill
                  variant={
                    ev.category === "other"
                      ? "gray"
                      : ev.category === "workshop"
                        ? "blue"
                        : ev.category === "conference"
                          ? "green"
                          : ev.category === "meetups"
                            ? "yellow"
                            : "red"
                  }
                >
                  {ev.category.charAt(0).toUpperCase() + ev.category.slice(1)}
                </Pill>
              </Table.Td>
              <Table.Td ta="center">
                {ev.start_at
                  ? dayjs(ev.start_at).format("DD/MM/YYYY")
                  : "Not set"}
              </Table.Td>
              <Table.Td ta="center">
                <Group
                  gap="xs"
                  justify="center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    size="xs"
                    variant="primary"
                    leftSection={<IconCheck size={14} />}
                    onClick={() => handleApprove(ev.id)}
                    loading={
                      statusMutation.isPending &&
                      statusMutation.variables?.id === ev.id &&
                      statusMutation.variables?.status === "approved"
                    }
                  >
                    Approve
                  </Button>
                  <Button
                    size="xs"
                    variant="delete"
                    leftSection={<IconX size={14} />}
                    onClick={() => handleOpenRefuse(ev.id)}
                  >
                    Refuse
                  </Button>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))
        )}
      </AdminTable>

      {/* Refuse modal — scoped to events tab */}
      <Modal
        opened={refuseOpened}
        onClose={closeRefuse}
        title="Refuse this event"
        centered
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Please provide a reason for the refusal. This will be logged.
          </Text>
          <Textarea
            label="Reason"
            placeholder="Enter refusal reason..."
            value={refuseReason}
            onChange={(e) => setRefuseReason(e.currentTarget.value)}
            minRows={3}
            required
          />
          <Group justify="flex-end">
            <Button variant="grey" onClick={closeRefuse}>
              Cancel
            </Button>
            <Button
              variant="delete"
              onClick={handleConfirmRefuse}
              disabled={refuseReason.trim().length === 0}
              loading={statusMutation.isPending}
            >
              Confirm Refusal
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

// ─── History Tab ─────────────────────────────────────────────────────────────

function HistoryTab() {
  const navigate = useNavigate();
  const [activePage, setPage] = useState(1);
  const [filters, setFilters] = useState<FiltersState>(defaultFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<FiltersState>(defaultFilters);

  const hasFilters = !!(
    appliedFilters.searchValue ||
    appliedFilters.sortValue ||
    appliedFilters.statusValue ||
    appliedFilters.typeValue
  );

  const {
    data: historyData,
    isLoading,
    isError,
  } = useAllItemsHistory(
    hasFilters ? -1 : activePage,
    hasFilters ? -1 : LIMIT,
    {
      search: appliedFilters.searchValue || undefined,
      sort: appliedFilters.sortValue || undefined,
      status: appliedFilters.statusValue || undefined,
      type: appliedFilters.typeValue || undefined,
    },
  );

  const items = historyData?.items ?? [];

  const handleApply = () => {
    setPage(1);
    setAppliedFilters({ ...filters });
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setPage(1);
  };

  return (
    <Stack gap="sm" mt="md">
      <FilterBar
        filters={filters}
        onFilterChange={(key, val) =>
          setFilters((prev) => ({ ...prev, [key]: val }))
        }
        onApply={handleApply}
        onReset={handleReset}
        showStatus
        showType
      />
      <AdminTable
        loading={isLoading}
        error={isError ? new Error("Could not load history.") : null}
        header={["Created on", "ID", "Title", "Type", "User", "Status"]}
        footer={
          <PaginationFooter
            activePage={activePage}
            setPage={setPage}
            total_records={historyData?.total_records || 0}
            last_page={historyData?.last_page || 1}
            limit={LIMIT}
            loading={isLoading}
            hidden={hasFilters}
          />
        }
      >
        {items.length === 0 && !isLoading ? (
          <Table.Tr>
            <Table.Td colSpan={6} ta="center">
              <Text c="dimmed" py="md">
                No history records found.
              </Text>
            </Table.Td>
          </Table.Tr>
        ) : (
          items.map((item: any) => (
            <Table.Tr
              key={`${item.item_type}-${item.id}`}
              style={{
                cursor: "pointer",
              }}
              onClick={() => {
                if (item.item_type === "Event") {
                  navigate(`${PATHS.ADMIN.EVENTS.ALL}/${item.id}`, {
                    state: "validationHub",
                  });
                } else if (item.item_type === "Deposit") {
                  navigate(
                    `${PATHS.ADMIN.VALIDATIONS.ALL}/deposits/${item.id}`,
                    {
                      state: { item },
                    },
                  );
                } else if (item.item_type === "Listing") {
                  navigate(
                    `${PATHS.ADMIN.VALIDATIONS.ALL}/listings/${item.id}`,
                    {
                      state: { item },
                    },
                  );
                }
              }}
            >
              <Table.Td ta="center">
                {dayjs(item.created_at).format("DD/MM/YYYY")}
              </Table.Td>
              <Table.Td ta="center">
                <strong>{item.id}</strong>
              </Table.Td>
              <Table.Td ta="center">{item.title}</Table.Td>
              <Table.Td ta="center">
                <Badge
                  variant="light"
                  color={
                    item.item_type === "Event"
                      ? "blue"
                      : item.item_type === "Deposit"
                        ? "orange"
                        : "green"
                  }
                >
                  {item.item_type}
                </Badge>
              </Table.Td>
              <Table.Td ta="center">{item.username}</Table.Td>
              <Table.Td ta="center">{getStatusBadge(item.status)}</Table.Td>
            </Table.Tr>
          ))
        )}
      </AdminTable>
    </Stack>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AdminValidationHub() {
  const navigate = useNavigate();
  const processMutation = useProcessValidation();

  const [opened, { open, close }] = useDisclosure(false);
  const [selectedEntity, setSelectedEntity] = useState<{
    id: number;
    type: "listings" | "deposits" | "events";
  } | null>(null);
  const [refuseReason, setRefuseReason] = useState("");

  const handleApprove = (
    id: number,
    type: "listings" | "deposits" | "events",
  ) => {
    processMutation.mutate({ entityType: type, id, action: "approve" });
  };

  const handleOpenRefuse = (
    id: number,
    type: "listings" | "deposits" | "events",
  ) => {
    setSelectedEntity({ id, type });
    setRefuseReason("");
    open();
  };

  const handleConfirmRefuse = () => {
    if (selectedEntity && refuseReason.trim().length > 0) {
      processMutation.mutate(
        {
          entityType: selectedEntity.type,
          id: selectedEntity.id,
          action: "refuse",
          reason: refuseReason,
        },
        {
          onSuccess: () => {
            close();
            setRefuseReason("");
          },
        },
      );
    }
  };

  const handlers: ActionHandlers = {
    onApprove: handleApprove,
    onOpenRefuse: handleOpenRefuse,
    navigate,
  };

  return (
    <Container px="md" size="xl">
      <Title order={2} mt="xs" mb="sm">
        Validation Hub
      </Title>

      <Divider mb="md" />

      <Tabs defaultValue="overview" keepMounted={false}>
        <Tabs.List>
          <Tabs.Tab value="overview" leftSection={<IconChartBar size={16} />}>
            Overview
          </Tabs.Tab>
          <Tabs.Tab value="deposits" leftSection={<IconSofa size={16} />}>
            Deposits
          </Tabs.Tab>
          <Tabs.Tab value="listings" leftSection={<IconTags size={16} />}>
            Listings
          </Tabs.Tab>
          <Tabs.Tab
            value="events"
            leftSection={<IconCalendarEvent size={16} />}
          >
            Events
          </Tabs.Tab>
          <Tabs.Tab value="history" leftSection={<IconHistory size={16} />}>
            History
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview">
          <OverviewTab />
        </Tabs.Panel>

        <Tabs.Panel value="deposits">
          <DepositsTab {...handlers} />
        </Tabs.Panel>

        <Tabs.Panel value="listings">
          <ListingsTab {...handlers} />
        </Tabs.Panel>

        <Tabs.Panel value="events">
          <EventsTab navigate={navigate} />
        </Tabs.Panel>

        <Tabs.Panel value="history">
          <HistoryTab />
        </Tabs.Panel>
      </Tabs>

      {/* Shared Refuse Modal */}
      <Modal
        opened={opened}
        onClose={close}
        title="Refuse this submission"
        centered
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Please provide a reason for the refusal. This will be sent to the
            user.
          </Text>
          <Textarea
            label="Reason"
            placeholder="Enter refusal reason..."
            value={refuseReason}
            onChange={(e) => setRefuseReason(e.currentTarget.value)}
            minRows={3}
            required
          />
          <Group justify="flex-end">
            <Button variant="grey" onClick={close}>
              Cancel
            </Button>
            <Button
              variant="delete"
              onClick={handleConfirmRefuse}
              disabled={refuseReason.trim().length === 0}
              loading={processMutation.isPending}
            >
              Confirm Refusal
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
