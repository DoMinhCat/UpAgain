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
} from "@mantine/core";
import {
  IconCalendarEventFilled,
  IconArrowUp,
  IconSearch,
  IconPlus,
  IconCalendarTime,
  IconCalendarCheck,
  IconClockCheck,
} from "@tabler/icons-react";
import {
  AdminCardInfo,
  StatsCardDesc,
} from "../../components/admin/AdminCardInfo";
import { useState } from "react";
import AdminTable from "../../components/admin/AdminTable";
import { useDisclosure } from "@mantine/hooks";
import { DateTimePicker } from "@mantine/dates";
import { TextEditor } from "../../components/TextEditor";
import ImageDropzone from "../../components/ImageDropzone";
import { useGetAllEvents, useGetEventStats } from "../../hooks/eventHooks";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../routes/paths";

export default function AdminEventsModule() {
  const navigate = useNavigate();

  // get all accounts
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
    activePage,
    LIMIT,
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
          <Table.Td>{event.created_at}</Table.Td>
          <Table.Td>{event.id}</Table.Td>
          <Table.Td>{event.title}</Table.Td>
          <Table.Td>{event.employee_name}</Table.Td>
          <Table.Td>{event.category}</Table.Td>
          <Table.Td>{event.start_at}</Table.Td>
          <Table.Td>{event.status}</Table.Td>
          <Table.Td>{"Buttons"}</Table.Td>
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
  const [category, setCategory] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [errorDescription, setErrorDescription] = useState<string>("");

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
    setErrorDescription("");
    closeCreate();
  };

  return (
    <Container px="md" size="xl">
      <Title order={2} mt="lg" mb="xl">
        Event Management
      </Title>

      {/* stats cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
        <AdminCardInfo
          icon={IconCalendarEventFilled}
          title="Total active events"
          value={99999}
          description={
            <StatsCardDesc
              stats={67}
              icon={IconArrowUp}
              description=" events created since last month"
            />
          }
        />
        <AdminCardInfo
          icon={IconCalendarTime}
          title="Upcoming events"
          value={15}
          description={
            <StatsCardDesc
              stats={67}
              icon={IconArrowUp}
              description=" events happening in the next 30 days"
            />
          }
        />
        <AdminCardInfo
          icon={IconCalendarCheck}
          title="Registrations (last 30 days)"
          value={626}
          description={
            <StatsCardDesc
              stats={67}
              icon={IconArrowUp}
              description=" registrations during the last month"
            />
          }
        />
        <AdminCardInfo
          icon={IconClockCheck}
          title="Pending approval"
          value={45}
          description={
            <StatsCardDesc
              stats={67}
              icon={IconArrowUp}
              description=" requires review and validation"
            />
          }
        />
      </SimpleGrid>

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
                  label="Tile"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                  }}
                  // onBlur={() => validateUsernameEdit(usernameEdit)}
                  // error={usernameEditError}
                  // disabled={isAccountDetailsLoading}
                  required
                />
                <NumberInput
                  label="Capacity"
                  placeholder="Maximum number of attendees"
                  min={0}
                  value={capacity}
                  suffix=" people"
                  onChange={(value) => {
                    setCapacity(Number(value));
                  }}
                  // onBlur={() => validateEmailEdit(emailEdit)}
                  // error={emailEditError}
                  // disabled={isAccountDetailsLoading}
                />
                <NumberInput
                  withAsterisk
                  label="Price"
                  placeholder="Entry fee - (0 if free)"
                  min={0}
                  prefix="€"
                  value={price}
                  onChange={(value) => {
                    setPrice(Number(value));
                  }}
                  // onBlur={() => validateEmailEdit(emailEdit)}
                  // error={emailEditError}
                  // disabled={isAccountDetailsLoading}
                  required
                />
                <Grid>
                  <Grid.Col span={{ base: 12, md: 9 }}>
                    <TextInput
                      withAsterisk
                      label="Street"
                      value={street}
                      placeholder="21 Erard street"
                      onChange={(e) => {
                        setStreet(e.target.value);
                      }}
                      // onBlur={() => validateUsernameEdit(usernameEdit)}
                      // error={usernameEditError}
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
                      onChange={(e) => {
                        setCity(e.target.value);
                      }}
                      // onBlur={() => validateUsernameEdit(usernameEdit)}
                      // error={usernameEditError}
                      // disabled={isAccountDetailsLoading}
                      required
                    />
                  </Grid.Col>
                </Grid>
                <TextInput
                  label="Additional location details"
                  placeholder="Room 12, 2nd floor"
                  value={locationDetail}
                  onChange={(e) => {
                    setLocationDetail(e.target.value);
                  }}
                  // onBlur={() => validateUsernameEdit(usernameEdit)}
                  // error={usernameEditError}
                  // disabled={isAccountDetailsLoading}
                />
                <DateTimePicker
                  withAsterisk
                  label="Date and time of event"
                  placeholder="When does the event take place?"
                  value={date}
                  onChange={setDate}
                  required
                  // onBlur={() => validateUsernameEdit(usernameEdit)}
                  // error={usernameEditError}
                  // disabled={isAccountDetailsLoading}
                />
                <Select
                  withAsterisk
                  clearable
                  label="Category"
                  value={category}
                  placeholder="Select a category"
                  // error={roleNewError}
                  // onBlur={() => validateRoleNew(roleNew)}
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
                  error={errorDescription}
                  onChange={(value) => {
                    setDescription(value);
                  }}
                />
                <ImageDropzone loading={false} disabled={false} />
              </Stack>
              <Group mt="lg" justify="center">
                <Button onClick={handleCloseCreate} variant="grey">
                  Cancel
                </Button>
                <Button
                  // onClick={(e) => {
                  //   handleEditAccount(e);
                  // }}
                  variant="primary"
                  // loading={editMutation.isPending}
                  // disabled={editMutation.isPending || isAccountDetailsLoading}
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
              variant="filled"
              placeholder="Search by employee's name, event's ID or title..."
              rightSection={<IconSearch size={14} />}
              value={filters.searchValue}
              onChange={(e) =>
                handleFilterChange("searchValue", e.target.value)
              }
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
              onChange={(val) => handleFilterChange("statusValue", val)}
              clearable
            />
          </Grid.Col>

          <Grid.Col span={{ base: 6, sm: 4, md: 3 }}>
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
          "Employee",
          "Location",
          "Start Date",
          "Status",
          "Actions",
        ]}
      >
        {listEvents}
      </AdminTable>
    </Container>
  );
}
