import {
  Container,
  Title,
  Group,
  Badge,
  Stack,
  Text,
  Card,
  Grid,
  Divider,
  Button,
  Modal,
  TextInput,
  type ComboboxItem,
  type OptionsFilter,
  Table,
  NumberInput,
  Select,
  MultiSelect,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import AdminBreadcrumbs from "../../../components/admin/AdminBreadcrumbs";
import { PATHS } from "../../../routes/paths";
import {
  IconCalendarEvent,
  IconCoinEuro,
  IconMapPin,
  IconMapPinFilled,
  IconPlus,
  IconUsers,
} from "@tabler/icons-react";
import AdminTable from "../../../components/admin/AdminTable";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import { TextEditor } from "../../../components/TextEditor";
import {
  useGetAssignedEmployees,
  useGetEventDetails,
} from "../../../hooks/eventHooks";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import FullScreenLoader from "../../../components/FullScreenLoader";

export default function AdminEventDetails() {
  // edit modal and form
  const [openedEdit, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);
  const [titleEdit, setTitleEdit] = useState<string>("");
  const [capacityEdit, setCapacityEdit] = useState<number>(0);
  const [priceEdit, setPriceEdit] = useState<number>(0);
  const [streetEdit, setStreetEdit] = useState<string>("");
  const [cityEdit, setCityEdit] = useState<string>("");
  const [locationDetailEdit, setLocationDetailEdit] = useState<string>("");
  const [dateEdit, setDateEdit] = useState<string | null>(null);
  const [categoryEdit, setCategoryEdit] = useState<string>("");
  const [descriptionEdit, setDescriptionEdit] = useState<string>("");

  // assign employee modal and form
  const [openedAssign, { open: openAssign, close: closeAssign }] =
    useDisclosure(false);
  const [employeeAssign, setEmployeeAssign] = useState<string[]>([]);
  const filterEmployee: OptionsFilter = ({ options, search }) => {
    const splittedSearch = search.toLowerCase().trim().split(" ");
    return (options as ComboboxItem[]).filter((option) => {
      const words = option.label.toLowerCase().trim().split(" ");
      return splittedSearch.every((searchWord) =>
        words.some((word) => word.includes(searchWord)),
      );
    });
  };

  const handleCloseAssign = () => {
    setEmployeeAssign([]);
    closeAssign();
  };

  // GET EVENT DETAILS
  const id_event = Number(useParams().id);
  const { data: eventDetails, isLoading: isLoadingEventDetails } =
    useGetEventDetails(id_event);

  // GET ASSIGNED EMPLOYEES
  const { data: assignedEmployees, isLoading: isLoadingAssignedEmployees } =
    useGetAssignedEmployees(id_event);

  if (isLoadingEventDetails) return <FullScreenLoader />;

  return (
    <Container px="md" size="xl">
      <Title order={2} mt="xs" mb="sm">
        Event's Details
      </Title>
      <AdminBreadcrumbs
        breadcrumbs={[
          { title: "Event Management", href: PATHS.ADMIN.EVENTS.ALL },
          { title: "Event's Details", href: "#" },
        ]}
      />
      <Container p="lg" size="xl">
        {/* The justify="space-between" works best when items have defined widths or flex growth */}
        <Grid gutter="xl" align="flex-start" mb="xl">
          {/* LEFT SECTION: Added flex: 1 to occupy remaining space */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            {/* <Group style={{ flex: 1 }}> */}
            <Stack gap={0} style={{ width: "100%" }}>
              <Group>
                <Badge
                  variant={
                    eventDetails?.category === "other"
                      ? "gray"
                      : eventDetails?.category === "workshop"
                        ? "blue"
                        : eventDetails?.category === "conference"
                          ? "green"
                          : eventDetails?.category === "meetups"
                            ? "yellow"
                            : "red"
                  }
                >
                  {eventDetails?.category}
                </Badge>
                <Badge
                  variant={
                    eventDetails?.status === "pending"
                      ? "yellow"
                      : eventDetails?.status === "approved"
                        ? "green"
                        : eventDetails?.status === "refused"
                          ? "red"
                          : "gray"
                  }
                >
                  {eventDetails?.status}
                </Badge>
              </Group>

              <Title order={2} mt="lg" mb="xs">
                {eventDetails?.title}
              </Title>
              <Text c="dimmed" size="xs" mb="xl">
                Created on{" "}
                {dayjs(eventDetails?.created_at).format("DD/MM/YYYY HH:mm A")}
              </Text>
              <div
                dangerouslySetInnerHTML={{
                  __html: eventDetails?.description ?? "",
                }}
              />
            </Stack>
            <Divider my="xl" />
            <Group gap="sm">
              <IconMapPinFilled color="green" size={32} />
              <Title order={3}>Location</Title>
            </Group>
            <Text mt="md">
              {eventDetails?.street + " · " + eventDetails?.city}
              {eventDetails?.location_detail && <br />}
              {eventDetails?.location_detail}
            </Text>
            <Text>TODO: map api</Text>
          </Grid.Col>

          {/* RIGHT SECTION */}
          <Grid.Col
            span={{ base: 12, md: 4 }}
            style={{ position: "sticky", top: "5px" }}
          >
            <Card withBorder shadow="sm" radius="md" padding="md">
              {/* Header/Date Section */}
              <Group gap="xs">
                <IconCalendarEvent />
                <Text fw={700} size="md">
                  {dayjs(eventDetails?.start_at)
                    ? dayjs(eventDetails?.start_at).format("dddd, MMM DD") +
                      " · " +
                      dayjs(eventDetails?.start_at).format("HH:mm A") +
                      ", UTC" +
                      dayjs(eventDetails?.start_at).format("Z")
                    : "No specified date"}
                </Text>
              </Group>

              <Divider my="sm" />

              {/* Body Content */}
              <Stack gap="lg">
                <Group justify="space-between">
                  <Group gap="xs">
                    <IconCoinEuro color="gold" />
                    <Text
                      c={!eventDetails?.price ? "green" : ""}
                      fw={!eventDetails?.price ? 700 : 500}
                    >
                      {eventDetails?.price
                        ? eventDetails?.price + " €"
                        : "Free"}
                    </Text>
                  </Group>
                </Group>

                <Group justify="space-between">
                  <Group gap="xs">
                    <IconUsers color="#315ff5" />
                    <Text>
                      {eventDetails?.capacity
                        ? eventDetails?.capacity + " max"
                        : "No max capacity specified"}
                    </Text>
                  </Group>
                </Group>

                <Group justify="space-between">
                  <Group gap="xs">
                    <IconMapPin color="green" />
                    <Text>
                      {eventDetails?.street + " · " + eventDetails?.city}
                    </Text>
                  </Group>
                </Group>
                <Group justify="space-between" grow>
                  <Button variant="edit" onClick={openEdit}>
                    Edit event
                  </Button>
                  <Button variant="delete">Cancel event</Button>
                </Group>
                <Modal
                  title="Edit event"
                  opened={openedEdit}
                  onClose={closeEdit}
                  centered
                  size="xl"
                >
                  <Stack>
                    <TextInput
                      data-autofocus
                      withAsterisk
                      label="Tile"
                      value={titleEdit}
                      onChange={(e) => {
                        setTitleEdit(e.target.value);
                      }}
                      // onBlur={() => validateUsernameEdit(usernameEdit)}
                      // error={usernameEditError}
                      // disabled={isAccountDetailsLoading}
                      required
                    />
                    <NumberInput
                      withAsterisk
                      label="Capacity"
                      min={0}
                      value={capacityEdit}
                      onChange={(value) => {
                        setCapacityEdit(Number(value));
                      }}
                      // onBlur={() => validateEmailEdit(emailEdit)}
                      // error={emailEditError}
                      // disabled={isAccountDetailsLoading}
                      required
                    />
                    <NumberInput
                      withAsterisk
                      label="Price"
                      min={0}
                      value={priceEdit}
                      onChange={(value) => {
                        setPriceEdit(Number(value));
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
                          value={streetEdit}
                          onChange={(e) => {
                            setStreetEdit(e.target.value);
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
                          label="City"
                          value={cityEdit}
                          onChange={(e) => {
                            setCityEdit(e.target.value);
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
                      value={locationDetailEdit}
                      onChange={(e) => {
                        setLocationDetailEdit(e.target.value);
                      }}
                      // onBlur={() => validateUsernameEdit(usernameEdit)}
                      // error={usernameEditError}
                      // disabled={isAccountDetailsLoading}
                      required
                    />
                    <DateTimePicker
                      withAsterisk
                      label="Date and time of event"
                      value={dateEdit}
                      onChange={setDateEdit}
                      required
                      // onBlur={() => validateUsernameEdit(usernameEdit)}
                      // error={usernameEditError}
                      // disabled={isAccountDetailsLoading}
                    />
                    <Select
                      withAsterisk
                      clearable
                      label="Category"
                      value={categoryEdit}
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
                        setCategoryEdit(value as string);
                      }}
                    />
                    <TextEditor
                      label="Event's description"
                      value={descriptionEdit}
                      onChange={(value) => {
                        setDescriptionEdit(value);
                      }}
                    />
                  </Stack>
                  <Group mt="lg" justify="center">
                    <Button onClick={closeEdit} variant="grey">
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
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Assigned employee List */}
        <Group justify="space-between">
          <Title order={3} mb="lg">
            Assigned employees
          </Title>
          <Button
            variant="primary"
            onClick={openAssign}
            leftSection={<IconPlus size={16} />}
          >
            Assign employee
          </Button>
          <Modal
            title="Assign employee"
            opened={openedAssign}
            onClose={closeAssign}
            centered
            size="md"
          >
            <Stack>
              <MultiSelect
                withAsterisk
                clearable
                label="Employee"
                value={employeeAssign}
                styles={{
                  pill: {
                    display: "inline-flex",
                    backgroundColor: "var(--component-color-bg)",
                    color: "var(--mantine-color-body)",
                    width: "auto",
                    minWidth: "unset",
                  },
                  label: {
                    display: "block",
                  },
                }}
                maxDropdownHeight={200}
                filter={filterEmployee}
                searchable
                // error={roleNewError}
                // onBlur={() => validateRoleNew(roleNew)}
                data={[
                  { value: "1", label: "Employee 1" },
                  { value: "2", label: "Employee 2" },
                  { value: "3", label: "Employee 3" },
                  { value: "4", label: "Employee 4" },
                  { value: "5", label: "Employee 5" },
                ]}
                onChange={setEmployeeAssign}
                hidePickedOptions
                comboboxProps={{ shadow: "md" }}
                nothingFoundMessage="No employees available"
              />
            </Stack>
            <Group mt="lg" justify="center">
              <Button onClick={handleCloseAssign} variant="grey">
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
        <AdminTable
          loading={false}
          error={null}
          header={["Assigned on", "ID", "Employee", "Actions"]}
        >
          {assignedEmployees?.map((employee) => {
            return (
              <Table.Tr key={employee?.id}>
                <Table.Td ta="center">
                  {dayjs(employee?.assigned_at).format("DD/MM/YYYY")}
                </Table.Td>
                <Table.Td ta="center">{employee?.id}</Table.Td>
                <Table.Td ta="center">{employee?.username}</Table.Td>
                <Table.Td ta="center">
                  <Button
                    variant="delete"
                    // onClick={() => {
                    //   handleUnassignEmployee(employee?.id);
                    // }}
                  >
                    Unassign
                  </Button>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </AdminTable>
      </Container>
    </Container>
  );
}
