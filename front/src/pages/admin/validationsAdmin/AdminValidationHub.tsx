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
  Pagination,
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
import { PATHS } from "../../../routes/paths";
import {
  usePendingDeposits,
  usePendingListings,
  usePendingEvents,
  useValidationStats,
  useAllItemsHistory,
  useProcessValidation,
} from "../../../hooks/validationHooks";

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
}

const defaultFilters: FiltersState = { searchValue: "", sortValue: null };

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
                mx="auto"
              />
            )}
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
}

function FilterBar({
  filters,
  onFilterChange,
  onApply,
  onReset,
}: FilterBarProps) {
  return (
    <Grid align="flex-end" mb="md">
      <Grid.Col span={{ base: 12, md: 5 }}>
        <TextInput
          label="Search"
          variant="filled"
          placeholder="Search by title, username or ID..."
          rightSection={<IconSearch size={14} />}
          value={filters.searchValue}
          onChange={(e) => onFilterChange("searchValue", e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onApply()}
        />
      </Grid.Col>
      <Grid.Col span={{ base: 6, md: 3 }}>
        <Select
          label="Sort by"
          placeholder="Default (oldest first)"
          data={[
            { value: "oldest", label: "Oldest first" },
            { value: "most_recent", label: "Most recent first" },
          ]}
          value={filters.sortValue}
          onChange={(val) => onFilterChange("sortValue", val)}
          clearable
        />
      </Grid.Col>
      <Grid.Col span={{ base: 6, md: 4 }}>
        <Group gap="xs" grow>
          <Button variant="primary" onClick={onApply}>
            Apply filters
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
          !hasFilters && data && data.total_records > 0 ? (
            <Group justify="space-between" mt="md">
              <Text size="sm" c="dimmed">
                Showing {(activePage - 1) * LIMIT + 1}–
                {Math.min(activePage * LIMIT, data.total_records)} of{" "}
                {data.total_records} results
              </Text>
              <Pagination
                total={data.last_page}
                value={activePage}
                onChange={setPage}
                disabled={isLoading}
              />
            </Group>
          ) : null
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
          !hasFilters && data && data.total_records > 0 ? (
            <Group justify="space-between" mt="md">
              <Text size="sm" c="dimmed">
                Showing {(activePage - 1) * LIMIT + 1}–
                {Math.min(activePage * LIMIT, data.total_records)} of{" "}
                {data.total_records} results
              </Text>
              <Pagination
                total={data.last_page}
                value={activePage}
                onChange={setPage}
                disabled={isLoading}
              />
            </Group>
          ) : null
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

function EventsTab({ onApprove, onOpenRefuse, navigate }: ActionHandlers) {
  const [activePage, setPage] = useState(1);
  const [filters, setFilters] = useState<FiltersState>(defaultFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<FiltersState>(defaultFilters);

  const hasFilters = !!(appliedFilters.searchValue || appliedFilters.sortValue);

  const { data, isLoading, isError } = usePendingEvents(
    hasFilters ? -1 : activePage,
    hasFilters ? -1 : LIMIT,
    {
      search: appliedFilters.searchValue || undefined,
      sort: appliedFilters.sortValue || undefined,
    },
  );

  const events = data?.events ?? [];

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
          "Employee",
          "Category",
          "Start date",
          "Actions",
        ]}
        footer={
          !hasFilters && data && data.total_records > 0 ? (
            <Group justify="space-between" mt="md">
              <Text size="sm" c="dimmed">
                Showing {(activePage - 1) * LIMIT + 1}–
                {Math.min(activePage * LIMIT, data.total_records)} of{" "}
                {data.total_records} results
              </Text>
              <Pagination
                total={data.last_page}
                value={activePage}
                onChange={setPage}
                disabled={isLoading}
              />
            </Group>
          ) : null
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
                navigate(`${PATHS.ADMIN.VALIDATIONS.ALL}/events/${ev.id}`, {
                  state: { item: ev },
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
              <Table.Td ta="center">
                {ev.employee_name ?? "Not assigned"}
              </Table.Td>
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
                    onClick={() => onApprove(ev.id, "events")}
                  >
                    Approve
                  </Button>
                  <Button
                    size="xs"
                    variant="delete"
                    leftSection={<IconX size={14} />}
                    onClick={() => onOpenRefuse(ev.id, "events")}
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

// ─── History Tab ─────────────────────────────────────────────────────────────

function HistoryTab() {
  const { data: historyData, isLoading, isError } = useAllItemsHistory();
  const items = historyData ?? [];

  return (
    <Stack gap="sm" mt="md">
      <AdminTable
        loading={isLoading}
        error={isError ? new Error("Could not load history.") : null}
        header={["Date", "ID", "Title", "Type", "User", "Status"]}
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
            <Table.Tr key={`${item.item_type}-${item.id}`}>
              <Table.Td ta="center">
                {dayjs(item.created_at).format("DD/MM/YYYY")}
              </Table.Td>
              <Table.Td ta="center">
                <strong>{item.id}</strong>
              </Table.Td>
              <Table.Td ta="center">{item.title}</Table.Td>
              <Table.Td ta="center">
                <Badge variant="light" color="blue">
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
          <EventsTab {...handlers} />
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
              variant="primary"
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
