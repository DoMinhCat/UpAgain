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
} from "@mantine/core";
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
} from "../../../components/admin/AdminCardInfo";
import { useState } from "react";
import AdminTable from "../../../components/admin/AdminTable";
import { useDisclosure } from "@mantine/hooks";
import { DateTimePicker } from "@mantine/dates";
import { useGetAllEvents, useGetEventStats } from "../../../hooks/eventHooks";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../../routes/paths";
import { TextEditor } from "../../../components/common/input/TextEditor";
import ImageDropzone from "../../../components/common/input/ImageDropzone";
import dayjs from "dayjs";
import { useCreateEvent } from "../../../hooks/eventHooks";
import PaginationFooter from "../../../components/common/PaginationFooter";

export default function AdminEventsModule() {
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
            {event.employee_name ?? "Not assigned"}
          </Table.Td>
          <Table.Td ta="center">
            <Pill
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
              {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
            </Pill>
          </Table.Td>
          <Table.Td ta="center">
            {event.start_at
              ? dayjs(event.start_at).format("DD/MM/YYYY")
              : "Not set"}
          </Table.Td>
          <Table.Td ta="center">
            {event.end_at
              ? dayjs(event.end_at).format("DD/MM/YYYY")
              : "Not set"}
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
              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
            </Pill>
          </Table.Td>
        </Table.Tr>
      ))
    ) : (
      <Table.Tr>
        <Table.Td colSpan={8} ta="center">
          No events found
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
      setErrorTitle("Title is required");
      return false;
    }
    setErrorTitle("");
    return true;
  };
  const validateCapacity = () => {
    if (capacity && capacity <= 0) {
      setErrorCapacity("Capacity must be greater than 0");
      return false;
    }
    setErrorCapacity("");
    return true;
  };
  const validatePrice = () => {
    if (price < 0) {
      setErrorPrice("Price must be greater than or equal to 0");
      return false;
    }
    setErrorPrice("");
    return true;
  };
  const validateStreet = () => {
    if (!street || street.trim() === "") {
      setErrorStreet("Street is required");
      return false;
    }
    setErrorStreet("");
    return true;
  };
  const validateCity = () => {
    if (!city || city.trim() === "") {
      setErrorCity("City is required");
      return false;
    }
    setErrorCity("");
    return true;
  };
  const validateCategory = () => {
    if (!category || category.trim() === "") {
      setErrorCategory("Category is required");
      return false;
    }
    setErrorCategory("");
    return true;
  };
  const validateDescription = () => {
    if (!description || description.trim() === "") {
      setErrorDescription("A description is required");
      return false;
    }
    setErrorDescription("");
    return true;
  };
  const validateStartDate = () => {
    if (!date || date.trim() === "") {
      setErrorDate("Start date is required");
      return false;
    }
    setErrorDate("");
    return true;
  };
  const validateEndDate = () => {
    if (!endDate || endDate.trim() === "") {
      setErrorEndDate("End date is required");
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
    all: "all time",
    today: "today",
    last_3_days: "the last 3 days",
    last_week: "the last 7 days",
    last_month: "the last 30 days",
    last_year: "the last 365 days",
  };
  const timeLabel = timeframeLabel[chartTime ?? "all"] ?? "all time";

  const {
    data: eventStats,
    isLoading: isLoadingEventStats,
    isError: errorEventStats,
  } = useGetEventStats(chartTime || undefined);

  return (
    <Container px="md" size="xl">
      <Group justify="space-between" mb="xl">
        <Title order={2} mt="lg">
          Event Management
        </Title>
        <Select
          label="Timeframe"
          placeholder="All time"
          value={chartTime}
          disabled={isLoadingEventStats}
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
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg" mb="sm">
        <AdminCardInfo
          icon={IconCalendarEventFilled}
          title="Total active events"
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
                  ? ` new event in ${timeLabel}`
                  : ` new events in ${timeLabel}`
              }
            />
          }
        />
        <AdminCardInfo
          icon={IconCalendarTime}
          title="Upcoming events *"
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
                  ? " upcoming event in the next 30 days"
                  : " upcoming events in the next 30 days"
              }
            />
          }
        />
        <AdminCardInfo
          icon={IconCalendarCheck}
          title="Registrations"
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
                  ? ` registration in ${timeLabel}`
                  : ` registrations in ${timeLabel}`
              }
            />
          }
        />
        <AdminCardInfo
          icon={IconClockPause}
          title="Pending approval *"
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
                  ? " event requires validation"
                  : " events require validation"
              }
            />
          }
        />
      </SimpleGrid>
      <Text size="sm" c="dimmed">
        * Timeframe not applicable for these metrics
      </Text>

      <Stack gap="md" my="xl">
        <Group justify="space-between" align="flex-end">
          <Title c="dimmed" order={3}>
            Manage events and assign employees
          </Title>

          <Group gap="xs" align="flex-end">
            <Button
              variant="primary"
              leftSection={<IconPlus size={16} />}
              onClick={openCreate}
            >
              New Event
            </Button>
            <Modal
              opened={openedCreate}
              onClose={handleCloseCreate}
              title="Create Event"
              size="xl"
            >
              <Stack>
                <TextInput
                  data-autofocus
                  withAsterisk
                  placeholder="Give the event a catchy title"
                  label="Title"
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
                  label="Capacity"
                  placeholder="Maximum number of attendees"
                  min={0}
                  disabled={createEventMutation.isPending}
                  value={capacity}
                  suffix=" people"
                  onChange={(value) => {
                    setCapacity(Number(value));
                  }}
                  onBlur={() => validateCapacity()}
                  error={errorCapacity}
                  // disabled={isAccountDetailsLoading}
                />
                <NumberInput
                  withAsterisk
                  label="Price"
                  placeholder="Entry fee - (0 if free)"
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
                      label="Street"
                      disabled={createEventMutation.isPending}
                      value={street}
                      placeholder="21 Erard street"
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
                      placeholder="Paris"
                      label="City"
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
                  label="Additional location details"
                  placeholder="Room 12, 2nd floor"
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
                      label="Start date"
                      placeholder="When does it start?"
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
                      label="End date"
                      placeholder="When does it end?"
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
                  label="Category"
                  value={category}
                  disabled={createEventMutation.isPending}
                  placeholder="Select a category"
                  error={errorCategory}
                  onBlur={() => validateCategory()}
                  data={[
                    { value: "workshop", label: "Workshop" },
                    { value: "conference", label: "Conference" },
                    { value: "meetups", label: "Meetups" },
                    { value: "exposition", label: "Exposition" },
                    { value: "other", label: "Other" },
                  ]}
                  onChange={(value) => {
                    setCategory(value as string);
                  }}
                />
                <TextEditor
                  label="Event's description"
                  value={description}
                  placeholder="Write your event's description here..."
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
                  Cancel
                </Button>
                <Button
                  onClick={(e) => {
                    handleSubmitCreate(e);
                  }}
                  variant="primary"
                  loading={createEventMutation.isPending}
                >
                  Confirm
                </Button>
              </Group>
            </Modal>
          </Group>
        </Group>
        {/* filter options */}
        <Grid align="flex-end">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <TextInput
              label="Search"
              placeholder="Search by employee's name, event's ID or title..."
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
                {
                  value: "earliest_start_date",
                  label: "Earliest start date",
                },
                {
                  value: "latest_start_date",
                  label: "Latest start date",
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
              label="Status"
              placeholder="All status"
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
        loading={isLoadingEvents}
        error={errorEvents}
        header={[
          "Created on",
          "ID",
          "Title",
          "Creator",
          "Category",
          "Start Date",
          "End Date",
          "Status",
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
