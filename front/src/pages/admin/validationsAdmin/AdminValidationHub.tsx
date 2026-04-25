import { useState } from "react";
import { useTranslation } from "react-i18next";
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
import { AdminCardInfo } from "../../../components/dashboard/AdminCardInfo";
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
import { ChartLegend } from "../../../components/chart/ChartLegend";

const LIMIT = 10;

// ─── Helpers ────────────────────────────────────────────────────────────────

function getStatusBadge(status: string, t: any) {
  switch (status) {
    case "approved":
      return <Badge color="green">{t("status.approved")}</Badge>;
    case "refused":
      return <Badge color="red">{t("status.refused")}</Badge>;
    case "pending":
      return <Badge color="yellow">{t("status.pending")}</Badge>;
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
  const { t } = useTranslation("admin");
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
    { name: t("status.pending"), value: totalPending, color: "orange.5" },
    { name: t("status.approved"), value: totalApproved, color: "green.6" },
    { name: t("status.refused"), value: totalRefused, color: "red.6" },
  ].filter((d) => d.value > 0);

  return (
    <Stack gap="xl" mt="md">
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        <AdminCardInfo
          title={t("validations.overview.pending")}
          icon={IconClockHour4}
          value={totalPending}
          loading={isLoading}
          error={isError}
        />
        <AdminCardInfo
          title={t("validations.overview.approved")}
          icon={IconCircleCheck}
          value={totalApproved}
          loading={isLoading}
          error={isError}
        />
        <AdminCardInfo
          title={t("validations.overview.refused")}
          icon={IconCircleX}
          value={totalRefused}
          loading={isLoading}
          error={isError}
        />
        <AdminCardInfo
          title={t("validations.overview.rate")}
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
              {t("validations.overview.distribution")}
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
                { label: t("status.approved"), color: "green.6" },
                { label: t("status.pending"), color: "orange.5" },
                { label: t("status.refused"), color: "red.6" },
              ]}
            />
          </Paper>
        </Grid.Col>

        {/* Per-type breakdown */}
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Paper withBorder p="lg" radius="md" shadow="sm" h="100%">
            <Text fw={600} mb="md">
              {t("validations.overview.breakdown")}
            </Text>
            {isLoading ? (
              <Group justify="center" py="xl">
                <Loader />
              </Group>
            ) : (
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{t("history.table.module")}</Table.Th>
                    <Table.Th ta="center">{t("status.pending")}</Table.Th>
                    <Table.Th ta="center">{t("status.approved")}</Table.Th>
                    <Table.Th ta="center">{t("status.refused")}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  <Table.Tr>
                    <Table.Td fw={500}>{t("validations.overview.types.deposit")}</Table.Td>
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
                    <Table.Td fw={500}>{t("validations.overview.types.listing")}</Table.Td>
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
                    <Table.Td fw={500}>{t("validations.overview.types.event")}</Table.Td>
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
  const { t } = useTranslation("admin");
  // Always total to 12 columns to ensure consistent length across all tabs
  const searchSpan = 12 - (showStatus ? 2 : 0) - (showType ? 2 : 0) - 2 - 3;

  return (
    <Grid align="flex-end" mb="md">
      <Grid.Col span={{ base: 12, md: searchSpan }}>
        <TextInput
          label={t("history.filters.search")}
          placeholder={t("validations.table.search_placeholder", {
            defaultValue: "Search items by title, username or ID...",
          })}
          rightSection={<IconSearch size={14} />}
          value={filters.searchValue}
          onChange={(e) => onFilterChange("searchValue", e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onApply()}
        />
      </Grid.Col>

      {showStatus && (
        <Grid.Col span={{ base: 6, md: 2 }}>
          <Select
            label={t("history.filters.status")}
            placeholder={t("users.status.all")}
            data={[
              { value: "pending", label: t("status.pending") },
              { value: "approved", label: t("status.approved") },
              { value: "refused", label: t("status.refused") },
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
            label={t("history.table.module")}
            placeholder={t("history.filters.module_placeholder")}
            data={[
              { value: "Deposit", label: t("validations.overview.types.deposit") },
              { value: "Listing", label: t("validations.overview.types.listing") },
              { value: "Event", label: t("validations.overview.types.event") },
            ]}
            value={filters.typeValue}
            onChange={(val) => onFilterChange("typeValue", val)}
            clearable
          />
        </Grid.Col>
      )}

      <Grid.Col span={{ base: 12, md: 2 }}>
        <Select
          label={t("history.filters.sort")}
          placeholder={t("history.filters.sort_placeholder")}
          data={[
            { value: "oldest", label: t("history.filters.sort_oldest") },
            { value: "most_recent", label: t("history.filters.sort_recent") },
          ]}
          value={filters.sortValue}
          onChange={(val) => onFilterChange("sortValue", val)}
          clearable
        />
      </Grid.Col>

      <Grid.Col span={{ base: 12, md: 3 }}>
        <Group gap="xs" grow>
          <Button variant="primary" onClick={onApply}>
            {t("history.filters.apply")}
          </Button>
          <Button variant="secondary" onClick={onReset}>
            {t("history.filters.reset")}
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
  const { t } = useTranslation("admin");
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
          t("validations.table.submitted_on"),
          t("users.table.id"),
          t("validations.table.title"),
          t("validations.table.user"),
          t("validations.table.container"),
          t("validations.table.material"),
          t("users.table.actions"),
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
                {t("validations.table.no_pending.deposits")}
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
                    {t("validations.table.actions.approve")}
                  </Button>
                  <Button
                    size="xs"
                    variant="delete"
                    leftSection={<IconX size={14} />}
                    onClick={() => onOpenRefuse(d.id_item, "deposits")}
                  >
                    {t("validations.table.actions.refuse")}
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
  const { t } = useTranslation("admin");
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
          t("validations.table.submitted_on"),
          t("users.table.id"),
          t("validations.table.title"),
          t("validations.table.user"),
          t("validations.table.city"),
          t("validations.table.price"),
          t("users.table.actions"),
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
                {t("validations.table.no_pending.listings")}
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
                    {t("validations.table.actions.approve")}
                  </Button>
                  <Button
                    size="xs"
                    variant="delete"
                    leftSection={<IconX size={14} />}
                    onClick={() => onOpenRefuse(l.id_item, "listings")}
                  >
                    {t("validations.table.actions.refuse")}
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
  const { t } = useTranslation("admin");
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
    undefined,
    undefined,
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
          t("validations.table.submitted_on"),
          t("users.table.id"),
          t("validations.table.title"),
          t("validations.table.creator"),
          t("validations.table.category"),
          t("validations.table.start_date"),
          t("users.table.actions"),
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
                {t("validations.table.no_pending.events")}
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
                  {t(`events:categories.${ev.category}` as any, {
                    defaultValue:
                      ev.category.charAt(0).toUpperCase() + ev.category.slice(1),
                  })}
                </Pill>
              </Table.Td>
              <Table.Td ta="center">
                {ev.start_at
                  ? dayjs(ev.start_at).format("DD/MM/YYYY")
                  : t("common:not_set", { defaultValue: "Not set" })}
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
                    {t("validations.table.actions.approve")}
                  </Button>
                  <Button
                    size="xs"
                    variant="delete"
                    leftSection={<IconX size={14} />}
                    onClick={() => handleOpenRefuse(ev.id)}
                  >
                    {t("validations.table.actions.refuse")}
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
        title={t("validations.refuse_modal.title")}
        centered
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            {t("validations.refuse_modal.text")}
          </Text>
          <Textarea
            label={t("validations.refuse_modal.label")}
            placeholder={t("validations.refuse_modal.placeholder")}
            value={refuseReason}
            onChange={(e) => setRefuseReason(e.currentTarget.value)}
            minRows={3}
            required
          />
          <Group justify="flex-end">
            <Button variant="grey" onClick={closeRefuse}>
              {t("validations.refuse_modal.cancel")}
            </Button>
            <Button
              variant="delete"
              onClick={handleConfirmRefuse}
              disabled={refuseReason.trim().length === 0}
              loading={statusMutation.isPending}
            >
              {t("validations.refuse_modal.confirm")}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

// ─── History Tab ─────────────────────────────────────────────────────────────

function HistoryTab() {
  const { t } = useTranslation("admin");
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
        error={isError ? new Error(t("validations.history.error", { defaultValue: "Could not load history." })) : null}
        header={[
          t("validations.table.submitted_on"),
          t("users.table.id"),
          t("validations.table.title"),
          t("history.table.module"),
          t("validations.table.user"),
          t("users.table.status"),
        ]}
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
                {t("validations.history.no_history")}
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
              <Table.Td ta="center">{getStatusBadge(item.status, t)}</Table.Td>
            </Table.Tr>
          ))
        )}
      </AdminTable>
    </Stack>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AdminValidationHub() {
  const { t } = useTranslation("admin");
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
      <Title order={2} mt="lg" mb="xl">
        {t("validations.title")}
      </Title>

      <Tabs defaultValue="overview" keepMounted={false}>
        <Tabs.List>
          <Tabs.Tab
            color="var(--upagain-neutral-green)"
            value="overview"
            leftSection={<IconChartBar size={16} />}
          >
            {t("validations.tabs.overview")}
          </Tabs.Tab>
          <Tabs.Tab
            color="var(--upagain-neutral-green)"
            value="deposits"
            leftSection={<IconSofa size={16} />}
          >
            {t("validations.tabs.deposits")}
          </Tabs.Tab>
          <Tabs.Tab
            color="var(--upagain-neutral-green)"
            value="listings"
            leftSection={<IconTags size={16} />}
          >
            {t("validations.tabs.listings")}
          </Tabs.Tab>
          <Tabs.Tab
            color="var(--upagain-neutral-green)"
            value="events"
            leftSection={<IconCalendarEvent size={16} />}
          >
            {t("validations.tabs.events")}
          </Tabs.Tab>
          <Tabs.Tab
            color="var(--upagain-neutral-green)"
            value="history"
            leftSection={<IconHistory size={16} />}
          >
            {t("validations.tabs.history")}
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
        title={t("validations.refuse_modal.title")}
        centered
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            {t("validations.refuse_modal.text_shared")}
          </Text>
          <Textarea
            label={t("validations.refuse_modal.label")}
            placeholder={t("validations.refuse_modal.placeholder")}
            value={refuseReason}
            onChange={(e) => setRefuseReason(e.currentTarget.value)}
            minRows={3}
            required
          />
          <Group justify="flex-end">
            <Button variant="grey" onClick={close}>
              {t("validations.refuse_modal.cancel")}
            </Button>
            <Button
              variant="delete"
              onClick={handleConfirmRefuse}
              disabled={refuseReason.trim().length === 0}
              loading={processMutation.isPending}
            >
              {t("validations.refuse_modal.confirm")}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
