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
  Loader,
  Tooltip,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import AdminBreadcrumbs from "../../../components/admin/AdminBreadcrumbs";
import { PATHS } from "../../../routes/paths";
import {
  IconCoinEuro,
  IconMapPin,
  IconMapPinFilled,
  IconPlus,
  IconUsers,
} from "@tabler/icons-react";
import AdminTable from "../../../components/admin/AdminTable";
import { useDisclosure } from "@mantine/hooks";
import { useState, useEffect } from "react";
import { TextEditor } from "../../../components/TextEditor";
import {
  useAssignEmployeeToEvent,
  useUpdateEventStatus,
  useGetAssignedEmployees,
  useGetEventDetails,
  useUnAssignEmployee,
  useUpdateEvent,
} from "../../../hooks/eventHooks";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import FullScreenLoader from "../../../components/FullScreenLoader";
import { useGetAvailableEmployees } from "../../../hooks/employeeHooks";
import type { AssignedEmployee } from "../../../api/interfaces/event";
import { useLocation } from "react-router-dom";
export default function AdminEventDetails() {
  const location = useLocation();
  const origin = location.state;
  const navigate = useNavigate();

  // edit modal and form
  const [openedEdit, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);
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
    setAssignError("");
    closeAssign();
  };

  // GET EVENT DETAILS
  const id_event = Number(useParams().id);
  const { data: eventDetails, isLoading: isLoadingEventDetails } =
    useGetEventDetails(id_event);

  const [titleEdit, setTitleEdit] = useState<string>("");
  const [capacityEdit, setCapacityEdit] = useState<number | null>(null);
  const [priceEdit, setPriceEdit] = useState<number>(0);
  const [streetEdit, setStreetEdit] = useState<string>("");
  const [cityEdit, setCityEdit] = useState<string>("");
  const [locationDetailEdit, setLocationDetailEdit] = useState<string>("");
  const [dateEdit, setDateEdit] = useState<string>("");
  const [endDateEdit, setEndDateEdit] = useState<string>("");
  const [categoryEdit, setCategoryEdit] = useState<string>("");
  const [descriptionEdit, setDescriptionEdit] = useState<string>("");
  const [errorTitle, setErrorTitle] = useState<string | null>(null);
  const [errorCapacity, setErrorCapacity] = useState<string | null>(null);
  const [errorPrice, setErrorPrice] = useState<string | null>(null);
  const [errorStreet, setErrorStreet] = useState<string | null>(null);
  const [errorCity, setErrorCity] = useState<string | null>(null);
  const [errorDate, setErrorDate] = useState<string | null>(null);
  const [errorEndDate, setErrorEndDate] = useState<string | null>(null);
  const [errorCategory, setErrorCategory] = useState<string | null>(null);
  const [errorDescription, setErrorDescription] = useState<string | null>(null);

  const handleOpenEdit = () => {
    if (eventDetails) {
      setTitleEdit(eventDetails.title || "");
      setCapacityEdit(eventDetails.capacity || 0);
      setPriceEdit(eventDetails.price || 0);
      setStreetEdit(eventDetails.street || "");
      setCityEdit(eventDetails.city || "");
      setLocationDetailEdit(eventDetails.location_detail || "");
      setDateEdit(eventDetails.start_at || "");
      setEndDateEdit(eventDetails.end_at || "");
      setCategoryEdit(eventDetails.category || "");
      setDescriptionEdit(eventDetails.description || "");
    }
    openEdit();
  };

  // validations
  const validateTitle = () => {
    if (!titleEdit || titleEdit.trim() === "") {
      setErrorTitle("Title is required");
      return false;
    }
    setErrorTitle("");
    return true;
  };
  const validateCapacity = () => {
    if (capacityEdit && capacityEdit <= 0) {
      setErrorCapacity("Capacity must be greater than 0");
      return false;
    }
    setErrorCapacity("");
    return true;
  };
  const validatePrice = () => {
    if (priceEdit < 0) {
      setErrorPrice("Price must be greater than or equal to 0");
      return false;
    }
    setErrorPrice("");
    return true;
  };
  const validateStreet = () => {
    if (!streetEdit || streetEdit.trim() === "") {
      setErrorStreet("Street is required");
      return false;
    }
    setErrorStreet("");
    return true;
  };
  const validateCity = () => {
    if (!cityEdit || cityEdit.trim() === "") {
      setErrorCity("City is required");
      return false;
    }
    setErrorCity("");
    return true;
  };
  const validateDate = () => {
    if (!dateEdit || dateEdit.trim() === "") {
      setErrorDate("Start date is required");
      return false;
    }
    setErrorDate("");
    return true;
  };
  const validateCategory = () => {
    if (!categoryEdit || categoryEdit.trim() === "") {
      setErrorCategory("Category is required");
      return false;
    }
    setErrorCategory("");
    return true;
  };
  const validateDescription = () => {
    if (!descriptionEdit || descriptionEdit.trim() === "") {
      setErrorDescription("A description is required");
      return false;
    }
    setErrorDescription("");
    return true;
  };
  const validateStartDate = (date: string | null) => {
    if (!date || date.trim() === "") {
      setErrorDate("Start date is required");
      return false;
    }
    setErrorDate("");
    return true;
  };
  const validateEndDate = (date: string | null) => {
    if (!date || date.trim() === "") {
      setErrorEndDate("End date is required");
      return false;
    }
    setErrorEndDate("");
    return true;
  };

  const updateEvent = useUpdateEvent(id_event);
  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !validateTitle() ||
      !validateCapacity() ||
      !validatePrice() ||
      !validateStreet() ||
      !validateCity() ||
      !validateDate() ||
      !validateCategory() ||
      !validateDescription() ||
      !validateStartDate(dateEdit) ||
      !validateEndDate(endDateEdit)
    )
      return;
    updateEvent.mutate(
      {
        title: titleEdit,
        capacity: capacityEdit || undefined,
        price: priceEdit,
        street: streetEdit,
        city: cityEdit,
        location_detail: locationDetailEdit,
        start_at: dateEdit,
        end_at: endDateEdit,
        category: categoryEdit,
        description: descriptionEdit,
      },
      {
        onSuccess: () => {
          handleCloseEdit();
        },
      },
    );
  };
  const handleCloseEdit = () => {
    if (eventDetails) {
      setTitleEdit(eventDetails.title || "");
      setCapacityEdit(eventDetails.capacity || 0);
      setPriceEdit(eventDetails.price || 0);
      setStreetEdit(eventDetails.street || "");
      setCityEdit(eventDetails.city || "");
      setLocationDetailEdit(eventDetails.location_detail || "");
      setDateEdit(eventDetails.start_at || "");
      setEndDateEdit(eventDetails.end_at || "");
      setCategoryEdit(eventDetails.category || "");
      setDescriptionEdit(eventDetails.description || "");
      setErrorTitle("");
      setErrorCapacity("");
      setErrorPrice("");
      setErrorStreet("");
      setErrorCity("");
      setErrorDate("");
      setErrorEndDate("");
      setErrorCategory("");
      setErrorDescription("");
    }
    closeEdit();
  };

  // GET ASSIGNED EMPLOYEES
  const {
    data: assignedEmployees,
    isLoading: isLoadingAssignedEmployees,
    error: errorAssignedEmployees,
  } = useGetAssignedEmployees(id_event);

  // GET AVAILABLE EMPLOYEES
  const { data: availableEmployees, isLoading: isLoadingAvailableEmployees } =
    useGetAvailableEmployees(
      {
        start_at: eventDetails?.start_at || "",
        end_at: eventDetails?.end_at || "",
      },
      !!eventDetails?.start_at && !!eventDetails?.end_at,
    );

  // ASSIGN EMPLOYEES
  const [assignError, setAssignError] = useState<string>("");
  const validateAssign = () => {
    if (employeeAssign.length === 0) {
      setAssignError("Please select at least one employee");
      return false;
    }
    return true;
  };
  const assignEmployees = useAssignEmployeeToEvent();
  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAssign()) return;
    const assignIds = employeeAssign.map((id) => Number(id));
    assignEmployees.mutate(
      {
        id_event,
        employee_ids: assignIds,
        start_at: eventDetails?.start_at || "",
        end_at: eventDetails?.end_at || "",
      },
      {
        onSuccess: () => {
          handleCloseAssign();
        },
      },
    );
  };

  // UNASSIGN MODAL
  const [openedUnassign, { open: openUnassign, close: closeUnassign }] =
    useDisclosure(false);
  const [employeeUnassign, setEmployeeUnassign] =
    useState<AssignedEmployee | null>(null);
  const handleUnassignModal = (employee: AssignedEmployee) => {
    setEmployeeUnassign(employee);
    openUnassign();
  };
  const handleCloseUnassign = () => {
    setEmployeeUnassign(null);
    closeUnassign();
  };

  const unassignEmployee = useUnAssignEmployee(id_event);
  const handleUnassignEmployee = () => {
    if (!employeeUnassign) return;
    unassignEmployee.mutate(
      {
        id_employee: employeeUnassign.id,
      },
      {
        onSuccess: () => {
          handleCloseUnassign();
        },
      },
    );
  };

  // CANCEL EVENT
  const [
    openedCancelEvent,
    { open: openCancelEvent, close: closeCancelEvent },
  ] = useDisclosure(false);
  const cancelEvent = useUpdateEventStatus(
    id_event,
    eventDetails?.status === "cancelled"
      ? "approved"
      : eventDetails?.status === "pending"
        ? "approved"
        : "cancelled",
  );
  const handleCancelEvent = () => {
    cancelEvent.mutate(undefined, {
      onSuccess: () => {
        closeCancelEvent();
      },
    });
  };
  if (isLoadingEventDetails) return <FullScreenLoader />;
  return (
    <Container px="md" size="xl">
      <Title order={2} mt="xs" mb="sm">
        Event's Details
      </Title>
      <AdminBreadcrumbs
        breadcrumbs={[
          ...(origin === "validationHub"
            ? [
                { title: "Validation Hub", href: PATHS.ADMIN.VALIDATIONS.ALL },
                { title: "Event's Details", href: "#" },
              ]
            : [
                { title: "Event Management", href: PATHS.ADMIN.EVENTS.ALL },
                { title: "Event's Details", href: "#" },
              ]),
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
          </Grid.Col>

          {/* RIGHT SECTION */}
          <Grid.Col
            span={{ base: 12, md: 4 }}
            style={{ position: "sticky", top: "5px" }}
          >
            <Card withBorder shadow="sm" radius="md" padding="md">
              {/* Header/Date Section */}
              <Group gap="xs">
                <Text fw={700} size="md">
                  {eventDetails?.start_at
                    ? dayjs(eventDetails?.start_at).format("dddd, MMM DD") +
                      " · " +
                      dayjs(eventDetails?.start_at).format("HH:mm") +
                      (eventDetails?.end_at
                        ? " - " + dayjs(eventDetails?.end_at).format("HH:mm")
                        : "") +
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
                        ? eventDetails?.capacity + " people max"
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
                  <Button variant="edit" onClick={handleOpenEdit}>
                    Edit event
                  </Button>
                  <Button
                    variant={
                      eventDetails?.status === "cancelled" ||
                      eventDetails?.status === "pending"
                        ? "primary"
                        : "delete"
                    }
                    onClick={openCancelEvent}
                  >
                    {eventDetails?.status === "cancelled"
                      ? "Reopen event"
                      : eventDetails?.status === "pending"
                        ? "Approve event"
                        : "Cancel event"}
                  </Button>
                </Group>
                <Modal
                  title="Edit event"
                  opened={openedEdit}
                  onClose={handleCloseEdit}
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
                      onBlur={() => validateTitle()}
                      error={errorTitle}
                      // disabled={isAccountDetailsLoading}
                      required
                    />
                    <NumberInput
                      withAsterisk
                      label="Capacity"
                      min={0}
                      value={capacityEdit || undefined}
                      onChange={(value) => {
                        setCapacityEdit(Number(value));
                      }}
                      onBlur={() => validateCapacity()}
                      error={errorCapacity}
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
                          value={streetEdit}
                          onChange={(e) => {
                            setStreetEdit(e.target.value);
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
                          label="City"
                          value={cityEdit}
                          onChange={(e) => {
                            setCityEdit(e.target.value);
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
                      value={locationDetailEdit}
                      onChange={(e) => {
                        setLocationDetailEdit(e.target.value);
                      }}
                      // disabled={isAccountDetailsLoading}
                    />
                    <Grid>
                      <Grid.Col span={{ base: 12, md: 6 }}>
                        <DateTimePicker
                          withAsterisk
                          clearable
                          label="Start date"
                          value={dateEdit ? new Date(dateEdit) : null}
                          onChange={(val) => {
                            setDateEdit(val ? dayjs(val).toISOString() : "");
                            validateStartDate(dateEdit);
                          }}
                          onBlur={() => validateStartDate(dateEdit)}
                          error={errorDate}
                          required
                        />
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, md: 6 }}>
                        <DateTimePicker
                          clearable
                          withAsterisk
                          label="End date"
                          value={endDateEdit ? new Date(endDateEdit) : null}
                          onChange={(val) => {
                            setEndDateEdit(val ? dayjs(val).toISOString() : "");
                            validateEndDate(endDateEdit);
                          }}
                          onBlur={() => validateEndDate(endDateEdit)}
                          error={errorEndDate}
                          required
                        />
                      </Grid.Col>
                    </Grid>
                    <Select
                      withAsterisk
                      clearable
                      label="Category"
                      value={categoryEdit}
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
                        setCategoryEdit(value as string);
                      }}
                    />
                    <TextEditor
                      label="Event's description"
                      value={descriptionEdit}
                      onChange={(value) => {
                        setDescriptionEdit(value);
                      }}
                      error={errorDescription ?? ""}
                    />
                  </Stack>
                  <Group mt="lg" justify="center">
                    <Button onClick={handleCloseEdit} variant="grey">
                      Cancel
                    </Button>
                    <Button
                      onClick={(e: React.FormEvent) => {
                        handleEdit(e);
                      }}
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
        <Divider my="xl" />
        <Group justify="space-between">
          <Title order={3} mb="lg">
            Assigned employees
          </Title>
          <Tooltip
            label="Event must be approved to assign employees"
            /* Only enable the tooltip if the button is disabled */
            disabled={eventDetails?.status === "aproved"}
            closeDelay={200}
            transitionProps={{ transition: "pop", duration: 300 }}
          >
            {/* Wrap in a div to capture hover events when the button is disabled */}
            <div style={{ width: "fit-content" }}>
              <Button
                variant="primary"
                onClick={openAssign}
                leftSection={<IconPlus size={16} />}
                disabled={eventDetails?.status !== "aproved"}
              >
                Assign employee
              </Button>
            </div>
          </Tooltip>
          <Modal
            title="Assign employee"
            opened={openedAssign}
            onClose={handleCloseAssign}
            centered
            size="md"
          >
            {isLoadingAvailableEmployees ? (
              <Loader />
            ) : (
              <>
                <Stack>
                  <MultiSelect
                    withAsterisk
                    clearable
                    label="Employee"
                    value={employeeAssign}
                    error={assignError}
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
                    onBlur={() => validateAssign()}
                    data={availableEmployees?.employees.map((employee) => ({
                      value: employee.id?.toString(),
                      label: `${employee.username} - ${employee.email}`,
                    }))}
                    onChange={(value) => {
                      setEmployeeAssign(value);
                      setAssignError("");
                    }}
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
                    onClick={(e) => {
                      handleAssign(e);
                    }}
                    variant="primary"
                    loading={assignEmployees.isPending}
                  >
                    Confirm
                  </Button>
                </Group>
              </>
            )}
          </Modal>
        </Group>
        <AdminTable
          loading={isLoadingAssignedEmployees}
          error={errorAssignedEmployees}
          header={["Assigned on", "ID", "Employee", "Email", "Actions"]}
        >
          {(assignedEmployees?.length ?? 0) > 0 ? (
            assignedEmployees?.map((employee) => {
              return (
                <Table.Tr
                  key={employee?.id}
                  style={{
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    navigate(PATHS.ADMIN.USERS.ALL + "/" + employee?.id, {
                      state: {
                        from: "eventDetails",
                        id_event: id_event,
                      },
                    });
                  }}
                >
                  <Table.Td ta="center">
                    {dayjs(employee?.assigned_at).format("DD/MM/YYYY")}
                  </Table.Td>
                  <Table.Td ta="center">{employee?.id}</Table.Td>
                  <Table.Td ta="center">{employee?.username}</Table.Td>
                  <Table.Td ta="center">{employee?.email}</Table.Td>
                  <Table.Td ta="center">
                    <Tooltip
                      label="Event must be approved to unassign employees"
                      /* Only enable the tooltip if the button is disabled */
                      disabled={eventDetails?.status === "aproved"}
                      closeDelay={200}
                      transitionProps={{ transition: "pop", duration: 300 }}
                    >
                      {/* Wrap in a div to capture hover events when the button is disabled */}
                      <div style={{ width: "fit-content", margin: "auto" }}>
                        <Button
                          variant="delete"
                          disabled={eventDetails?.status !== "aproved"}
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            handleUnassignModal(employee);
                          }}
                        >
                          Unassign
                        </Button>
                      </div>
                    </Tooltip>
                  </Table.Td>
                </Table.Tr>
              );
            })
          ) : (
            <Table.Tr>
              <Table.Td ta="center" colSpan={5}>
                No employees assigned
              </Table.Td>
            </Table.Tr>
          )}
        </AdminTable>
      </Container>
      <Modal
        opened={openedUnassign}
        onClose={handleCloseUnassign}
        title="Unassign Employee"
      >
        <Text>
          Are you sure you want to unassign this employee from this event?
        </Text>
        <Group mt="lg" justify="end">
          <Button onClick={handleCloseUnassign} variant="grey">
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleUnassignEmployee();
            }}
            variant="delete"
            loading={unassignEmployee.isPending}
          >
            Confirm
          </Button>
        </Group>
      </Modal>
      <Modal
        opened={openedCancelEvent}
        onClose={closeCancelEvent}
        title={
          eventDetails?.status === "cancelled"
            ? "Reopen Event"
            : eventDetails?.status === "pending"
              ? "Approve Event"
              : "Cancel Event"
        }
      >
        <Text>
          Are you sure you want to{" "}
          {eventDetails?.status === "cancelled"
            ? "reopen"
            : eventDetails?.status === "pending"
              ? "approve"
              : "cancel"}{" "}
          this event?
        </Text>
        <Group mt="lg" justify="end">
          <Button onClick={closeCancelEvent} variant="grey">
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleCancelEvent();
            }}
            variant={
              eventDetails?.status === "cancelled" ||
              eventDetails?.status === "pending"
                ? "primary"
                : "delete"
            }
            loading={cancelEvent.isPending}
          >
            Confirm
          </Button>
        </Group>
      </Modal>
    </Container>
  );
}
