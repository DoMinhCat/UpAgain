import {
  Container,
  Group,
  SimpleGrid,
  Title,
  Grid,
  TextInput,
  Select,
  Button,
  Stack,
  Table,
  Modal,
  NumberInput,
  Pill,
  Text,
  Badge,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import {
  IconCalendarEventFilled,
  IconArrowUpRight,
  IconSearch,
  IconPlus,
  IconCalendarTime,
  IconCalendarCheck,
  IconClockPause,
  IconAlertTriangle,
} from "@tabler/icons-react";
import {
  AdminCardInfo,
  StatsCardDesc,
} from "../../../components/dashboard/AdminCardInfo";
import { useState } from "react";
import AdminTable from "../../../components/admin/AdminTable";
import { useDisclosure } from "@mantine/hooks";
import { DateTimePicker } from "@mantine/dates";
import { useGetAllEvents, useGetEventStats } from "../../../hooks/eventHooks";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../../routes/paths";
import { TextEditor } from "../../../components/input/TextEditor";
import ImageDropzone from "../../../components/input/ImageDropzone";
import dayjs from "dayjs";
import { useCreateEvent } from "../../../hooks/eventHooks";
import PaginationFooter from "../../../components/common/PaginationFooter";

export default function AdminEventsModule() {
  const { t } = useTranslation("admin");
  const navigate = useNavigate();

  // get all events
  const [filters, setFilters] = useState<{
    searchValue: string | undefined;
    sortValue: string | null;
    statusValue: string | null;
  }>({ searchValue: "", sortValue: null, statusValue: null });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [activePage, setPage] = useState(1);
  const LIMIT = 10;

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };
  const hasFilters = Boolean(
    appliedFilters.searchValue ||
    appliedFilters.statusValue ||
    appliedFilters.sortValue,
  );

  const handleSearchClick = () => {
    setAppliedFilters(filters);
    setPage(1);
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      searchValue: "",
      sortValue: null,
      statusValue: null,
    };
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setPage(1);
  };

  const {
    data: events,
    isLoading: isLoadingEvents,
    error: errorEvents,
  } = useGetAllEvents(
    hasFilters ? -1 : activePage,
    hasFilters ? -1 : LIMIT,
    appliedFilters.searchValue,
    appliedFilters.statusValue || undefined,
    appliedFilters.sortValue || undefined,
  );
  const filteredEvents = events?.events || [];
  const listEvents =
    filteredEvents.length > 0 ? (
      filteredEvents.map((event) => (
        <Table.Tr
          style={{
            cursor: "pointer",
          }}
          key={event.id}
          onClick={() => {
            navigate(PATHS.ADMIN.EVENTS.ALL + "/" + event.id);
          }}
        >
          <Table.Td ta="center">
            {dayjs(event.created_at).format("DD/MM/YYYY")}
          </Table.Td>
          <Table.Td ta="center">{event.id}</Table.Td>
          <Table.Td ta="center">{event.title}</Table.Td>
          <Table.Td ta="center">
            {event.employee_name ??
              t("common:not_assigned", { defaultValue: "Not assigned" })}
          </Table.Td>
          <Table.Td ta="center">
            <Badge
              variant={
                event.category === "other"
                  ? "gray"
                  : event.category === "workshop"
                    ? "blue"
                    : event.category === "conference"
                      ? "green"
                      : event.category === "meetups"
                        ? "yellow"
                        : "red"
              }
            >
              {t(`common:event_categories.${event.category}` as any, {
                defaultValue:
                  event.category.charAt(0).toUpperCase() +
                  event.category.slice(1),
              })}
            </Badge>
          </Table.Td>
          <Table.Td ta="center">
            {event.start_at
              ? dayjs(event.start_at).format("DD/MM/YYYY")
              : t("common:not_set", { defaultValue: "Not set" })}
          </Table.Td>
          <Table.Td ta="center">
            {event.end_at
              ? dayjs(event.end_at).format("DD/MM/YYYY")
              : t("common:not_set", { defaultValue: "Not set" })}
          </Table.Td>
          <Table.Td ta="center">
            <Pill
              variant={
                event.status === "pending"
                  ? "yellow"
                  : event.status === "approved"
                    ? "green"
                    : event.status === "refused"
                      ? "red"
                      : "gray"
              }
            >
              {t(`status.${event.status}` as any, {
                defaultValue:
                  event.status.charAt(0).toUpperCase() + event.status.slice(1),
              })}
            </Pill>
          </Table.Td>
        </Table.Tr>
      ))
    ) : (
      <Table.Tr>
        <Table.Td colSpan={8} ta="center">
          {t("events.table.no_events")}
        </Table.Td>
      </Table.Tr>
    );

  // create modal
  const [openedCreate, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);
  const [title, setTitle] = useState<string>("");
  const [capacity, setCapacity] = useState<number>();
  const [price, setPrice] = useState<number>(0);
  const [street, setStreet] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [locationDetail, setLocationDetail] = useState<string>("");
  const [date, setDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [errorDescription, setErrorDescription] = useState<string>("");
  const [errorTitle, setErrorTitle] = useState<string>("");
  const [errorCapacity, setErrorCapacity] = useState<string>("");
  const [errorPrice, setErrorPrice] = useState<string>("");
  const [errorStreet, setErrorStreet] = useState<string>("");
  const [errorCity, setErrorCity] = useState<string>("");
  const [errorDate, setErrorDate] = useState<string>("");
  const [errorEndDate, setErrorEndDate] = useState<string>("");
  const [errorCategory, setErrorCategory] = useState<string>("");
  const [files, setFiles] = useState<any[]>([]);

  const handleCloseCreate = () => {
    setTitle("");
    setCapacity(undefined);
    setPrice(0);
    setStreet("");
    setCity("");
    setLocationDetail("");
    setDate(null);
    setCategory("");
    setDescription("");
    setErrorTitle("");
    setErrorCapacity("");
    setErrorPrice("");
    setErrorStreet("");
    setErrorCity("");
    setErrorDate("");
    setErrorEndDate("");
    setErrorCategory("");
    setErrorDescription("");
    setFiles([]);
    closeCreate();
  };

  // create validations
  const validateTitle = () => {
    if (!title || title.trim() === "") {
      setErrorTitle(t("events.create_modal.errors.title"));
      return false;
    }
    setErrorTitle("");
    return true;
  };
  const validateCapacity = () => {
    if (capacity && capacity <= 0) {
      setErrorCapacity(t("events.create_modal.errors.capacity"));
      return false;
    }
    setErrorCapacity("");
    return true;
  };
  const validatePrice = () => {
    if (price < 0) {
      setErrorPrice(t("events.create_modal.errors.price"));
      return false;
    }
    setErrorPrice("");
    return true;
  };
  const validateStreet = () => {
    if (!street || street.trim() === "") {
      setErrorStreet(t("events.create_modal.errors.street"));
      return false;
    }
    setErrorStreet("");
    return true;
  };
  const validateCity = () => {
    if (!city || city.trim() === "") {
      setErrorCity(t("events.create_modal.errors.city"));
      return false;
    }
    setErrorCity("");
    return true;
  };
  const validateCategory = () => {
    if (!category || category.trim() === "") {
      setErrorCategory(t("events.create_modal.errors.category"));
      return false;
    }
    setErrorCategory("");
    return true;
  };
  const validateDescription = () => {
    if (!description || description.trim() === "") {
      setErrorDescription(t("events.create_modal.errors.description"));
      return false;
    }
    setErrorDescription("");
    return true;
  };
  const validateStartDate = () => {
    if (!date || date.trim() === "") {
      setErrorDate(t("events.create_modal.errors.start_date"));
      return false;
    }
    setErrorDate("");
    return true;
  };
  const validateEndDate = () => {
    if (!endDate || endDate.trim() === "") {
      setErrorEndDate(t("events.create_modal.errors.end_date"));
      return false;
    }
    setErrorEndDate("");
    return true;
  };

  const createEventMutation = useCreateEvent();

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !validateTitle() ||
      !validateCapacity() ||
      !validatePrice() ||
      !validateStreet() ||
      !validateCity() ||
      !validateStartDate() ||
      !validateEndDate() ||
      !validateCategory() ||
      !validateDescription()
    )
      return;

    const filesToSend = new FormData();
    files.forEach((file) => {
      filesToSend.append("images", file);
    });
    createEventMutation.mutate(
      {
        title,
        capacity: capacity ?? undefined,
        price,
        street,
        city,
        location_detail: locationDetail,
        start_at: date ? dayjs(date).toISOString() : "",
        end_at: endDate ? dayjs(endDate).toISOString() : "",
        category,
        description,
        status: "pending",
        images: filesToSend,
      },
      {
        onSuccess: () => {
          handleCloseCreate();
        },
      },
    );
  };

  // event stats
  const [chartTime, setChartTime] = useState<string | null>("all");

  const timeframeLabel: Record<string, string> = {
    all: t("common:timeframe.all"),
    today: t("common:timeframe.today"),
    last_3_days: t("common:timeframe.last_3_days"),
    last_week: t("common:timeframe.last_week"),
    last_month: t("common:timeframe.last_month"),
    last_year: t("common:timeframe.last_year"),
  };
  const timeLabel =
    timeframeLabel[chartTime ?? "all"] ?? t("common:timeframe.all");

  const {
    data: eventStats,
    isLoading: isLoadingEventStats,
    isError: errorEventStats,
  } = useGetEventStats(chartTime || undefined);

  return (
    <Container px="md" size="xl">
      <Group justify="space-between" mb="xl">
        <Title order={2} mt="lg">
          {t("events.title")}
        </Title>
        <Select
          label={t("common:timeframe.title")}
          placeholder={t("common:timeframe.all")}
          value={chartTime}
          disabled={isLoadingEventStats}
          onChange={(value) => setChartTime(value)}
          data={[
            { value: "all", label: t("common:timeframe.all") },
            { value: "today", label: t("common:timeframe.today") },
            { value: "last_3_days", label: t("common:timeframe.last_3_days") },
            { value: "last_week", label: t("common:timeframe.last_week") },
            { value: "last_month", label: t("common:timeframe.last_month") },
            { value: "last_year", label: t("common:timeframe.last_year") },
          ]}
        />
      </Group>

      {/* stats cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg" mb="sm">
        <AdminCardInfo
          icon={IconCalendarEventFilled}
          title={t("events.stats.total_active")}
          value={eventStats?.total ?? 0}
          error={errorEventStats}
          loading={isLoadingEventStats}
          description={
            <StatsCardDesc
              stats={eventStats?.increase ?? 0}
              icon={
                <IconArrowUpRight
                  size={24}
                  color="var(--upagain-neutral-green)"
                />
              }
              description={
                eventStats?.increase === 1
                  ? t("events.stats.new_event", { time: timeLabel })
                  : t("events.stats.new_events", { time: timeLabel })
              }
            />
          }
        />
        <AdminCardInfo
          icon={IconCalendarTime}
          title={t("events.stats.upcoming_title")}
          value={eventStats?.upcoming ?? 0}
          error={errorEventStats}
          loading={isLoadingEventStats}
          description={
            <StatsCardDesc
              stats={eventStats?.upcoming ?? 0}
              icon={
                <IconArrowUpRight
                  size={24}
                  color="var(--upagain-neutral-green)"
                />
              }
              description={
                eventStats?.upcoming === 1
                  ? t("events.stats.upcoming_desc")
                  : t("events.stats.upcoming_desc_plural")
              }
            />
          }
        />
        <AdminCardInfo
          icon={IconCalendarCheck}
          title={t("events.stats.registrations")}
          value={eventStats?.registrations ?? 0}
          error={errorEventStats}
          loading={isLoadingEventStats}
          description={
            <StatsCardDesc
              stats={eventStats?.registrations ?? 0}
              icon={
                <IconArrowUpRight
                  size={24}
                  color="var(--upagain-neutral-green)"
                />
              }
              description={
                eventStats?.registrations === 1
                  ? t("events.stats.registration", { time: timeLabel })
                  : t("events.stats.registrations_in", { time: timeLabel })
              }
            />
          }
        />
        <AdminCardInfo
          icon={IconClockPause}
          title={t("events.stats.pending_title")}
          value={eventStats?.pending ?? 0}
          error={errorEventStats}
          loading={isLoadingEventStats}
          description={
            <StatsCardDesc
              stats={eventStats?.pending ?? 0}
              icon={
                <IconAlertTriangle size={24} color="var(--upagain-yellow)" />
              }
              description={
                eventStats?.pending === 1
                  ? t("events.stats.pending_desc")
                  : t("events.stats.pending_desc_plural")
              }
            />
          }
        />
      </SimpleGrid>
      <Text size="sm" c="dimmed">
        {t("events.stats.timeframe_note")}
      </Text>

      <Stack gap="md" my="xl">
        <Group justify="space-between" align="flex-end">
          <Title c="dimmed" order={3}>
            {t("events.manage_subtitle")}
          </Title>

          <Group gap="xs" align="flex-end">
            <Button
              variant="primary"
              leftSection={<IconPlus size={16} />}
              onClick={openCreate}
            >
              {t("events.new_event")}
            </Button>
            <Modal
              opened={openedCreate}
              onClose={handleCloseCreate}
              title={t("events.create_modal.title")}
              size="xl"
            >
              <Stack>
                <TextInput
                  data-autofocus
                  withAsterisk
                  placeholder={t("events.create_modal.title_placeholder")}
                  label={t("events.create_modal.title_label")}
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                  }}
                  onBlur={() => validateTitle()}
                  error={errorTitle}
                  disabled={createEventMutation.isPending}
                  required
                />
                <NumberInput
                  label={t("events.create_modal.capacity_label")}
                  placeholder={t("events.create_modal.capacity_placeholder")}
                  min={0}
                  disabled={createEventMutation.isPending}
                  value={capacity}
                  suffix={t("events.create_modal.capacity_suffix")}
                  onChange={(value) => {
                    setCapacity(Number(value));
                  }}
                  onBlur={() => validateCapacity()}
                  error={errorCapacity}
                  // disabled={isAccountDetailsLoading}
                />
                <NumberInput
                  withAsterisk
                  label={t("events.create_modal.price_label")}
                  placeholder={t("events.create_modal.price_placeholder")}
                  min={0}
                  prefix="€"
                  value={price}
                  disabled={createEventMutation.isPending}
                  onChange={(value) => {
                    setPrice(Number(value));
                  }}
                  onBlur={() => validatePrice()}
                  error={errorPrice}
                  // disabled={isAccountDetailsLoading}
                  required
                />
                <Grid>
                  <Grid.Col span={{ base: 12, md: 9 }}>
                    <TextInput
                      withAsterisk
                      label={t("events.create_modal.street_label")}
                      disabled={createEventMutation.isPending}
                      value={street}
                      placeholder={t("events.create_modal.street_placeholder")}
                      onChange={(e) => {
                        setStreet(e.target.value);
                      }}
                      onBlur={() => validateStreet()}
                      error={errorStreet}
                      // disabled={isAccountDetailsLoading}
                      required
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 3 }}>
                    <TextInput
                      withAsterisk
                      placeholder={t("events.create_modal.city_placeholder")}
                      label={t("events.create_modal.city_label")}
                      value={city}
                      disabled={createEventMutation.isPending}
                      onChange={(e) => {
                        setCity(e.target.value);
                      }}
                      onBlur={() => validateCity()}
                      error={errorCity}
                      // disabled={isAccountDetailsLoading}
                      required
                    />
                  </Grid.Col>
                </Grid>
                <TextInput
                  label={t("events.create_modal.location_detail_label")}
                  placeholder={t(
                    "events.create_modal.location_detail_placeholder",
                  )}
                  disabled={createEventMutation.isPending}
                  value={locationDetail}
                  onChange={(e) => {
                    setLocationDetail(e.target.value);
                  }}
                  // disabled={isAccountDetailsLoading}
                />
                <Grid>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <DateTimePicker
                      clearable
                      withAsterisk
                      label={t("events.create_modal.start_date_label")}
                      placeholder={t(
                        "events.create_modal.start_date_placeholder",
                      )}
                      value={date ? new Date(date) : null}
                      disabled={createEventMutation.isPending}
                      onChange={(val) =>
                        setDate(val ? dayjs(val).toISOString() : null)
                      }
                      required
                      onBlur={() => validateStartDate()}
                      error={errorDate}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <DateTimePicker
                      withAsterisk
                      clearable
                      label={t("events.create_modal.end_date_label")}
                      placeholder={t(
                        "events.create_modal.end_date_placeholder",
                      )}
                      onBlur={() => validateEndDate()}
                      error={errorEndDate}
                      value={endDate ? new Date(endDate) : null}
                      disabled={createEventMutation.isPending}
                      onChange={(val) =>
                        setEndDate(val ? dayjs(val).toISOString() : null)
                      }
                      required
                    />
                  </Grid.Col>
                </Grid>
                <Select
                  withAsterisk
                  clearable
                  label={t("events.create_modal.category_label")}
                  value={category}
                  disabled={createEventMutation.isPending}
                  placeholder={t("events.create_modal.category_placeholder")}
                  error={errorCategory}
                  onBlur={() => validateCategory()}
                  data={[
                    {
                      value: "workshop",
                      label: t("common:event_categories.workshop"),
                    },
                    {
                      value: "conference",
                      label: t("common:event_categories.conference"),
                    },
                    {
                      value: "meetups",
                      label: t("common:event_categories.meetups"),
                    },
                    {
                      value: "exposition",
                      label: t("common:event_categories.exposition"),
                    },
                    {
                      value: "other",
                      label: t("common:event_categories.other"),
                    },
                  ]}
                  onChange={(value) => {
                    setCategory(value as string);
                  }}
                />
                <TextEditor
                  label={t("events.create_modal.description_label")}
                  value={description}
                  placeholder={t("events.create_modal.description_placeholder")}
                  error={errorDescription}
                  onChange={(value) => {
                    setDescription(value);
                  }}
                />
                <ImageDropzone
                  loading={createEventMutation.isPending}
                  files={files}
                  setFiles={setFiles}
                />
              </Stack>
              <Group mt="lg" justify="center">
                <Button onClick={handleCloseCreate} variant="grey">
                  {t("users.delete_modal.cancel")}
                </Button>
                <Button
                  onClick={(e) => {
                    handleSubmitCreate(e);
                  }}
                  variant="primary"
                  loading={createEventMutation.isPending}
                >
                  {t("common:confirm", { defaultValue: "Confirm" })}
                </Button>
              </Group>
            </Modal>
          </Group>
        </Group>
        {/* filter options */}
        <Grid align="flex-end">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <TextInput
              label={t("common:search")}
              placeholder={t("events.filters.search_placeholder")}
              disabled={isLoadingEvents}
              rightSection={<IconSearch size={14} />}
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

          <Grid.Col span={{ base: 6, sm: 4, md: 3 }}>
            <Select
              label={t("common:sort_by")}
              placeholder={t("events.filters.sort_placeholder")}
              data={[
                {
                  value: "most_recent_creation",
                  label: t("events.filters.sort_options.most_recent_creation"),
                },
                {
                  value: "oldest_creation",
                  label: t("events.filters.sort_options.oldest_creation"),
                },
                {
                  value: "highest_price",
                  label: t("events.filters.sort_options.highest_price"),
                },
                {
                  value: "lowest_price",
                  label: t("events.filters.sort_options.lowest_price"),
                },
                {
                  value: "earliest_start_date",
                  label: t("events.filters.sort_options.earliest_start_date"),
                },
                {
                  value: "latest_start_date",
                  label: t("events.filters.sort_options.latest_start_date"),
                },
              ]}
              value={filters.sortValue}
              clearable
              disabled={isLoadingEvents}
              onChange={(val) => handleFilterChange("sortValue", val)}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 6, sm: 4, md: 2 }}>
            <Select
              label={t("users.table.status")}
              placeholder={t("common:all_status", {
                defaultValue: "All status",
              })}
              data={[
                { value: "active", label: "Active" },
                { value: "banned", label: "Banned" },
              ]}
              value={filters.statusValue}
              disabled={isLoadingEvents}
              onChange={(val) => handleFilterChange("statusValue", val)}
              clearable
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 4, md: 3 }}>
            <Group gap="xs" grow>
              <Button onClick={handleSearchClick} variant="primary">
                {t("common:actions.apply_filters", {
                  defaultValue: "Apply filters",
                })}
              </Button>
              <Button variant="secondary" onClick={handleResetFilters}>
                {t("common:actions.reset", { defaultValue: "Reset" })}
              </Button>
            </Group>
          </Grid.Col>
        </Grid>
      </Stack>

      <AdminTable
        loading={isLoadingEvents}
        error={errorEvents}
        header={[
          t("validations.table.executed_on"),
          t("history.table.transaction_id"),
          t("validations.table.title"),
          t("events.table.creator"),
          t("history.filters.category"),
          t("events.table.start_date"),
          t("events.table.end_date"),
          t("users.table.status"),
        ]}
        footer={
          <PaginationFooter
            activePage={activePage}
            setPage={setPage}
            total_records={events?.total_records || 0}
            last_page={events?.last_page || 1}
            limit={LIMIT}
            unit="records"
            loading={isLoadingEvents}
            hidden={hasFilters}
          />
        }
      >
        {listEvents}
      </AdminTable>
    </Container>
  );
}
