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
  type ComboboxItem,
  type OptionsFilter,
  Table,
  MultiSelect,
  Loader,
  Tooltip,
  SimpleGrid,
} from "@mantine/core";

import MyBreadcrumbs from "../../../components/nav/MyBreadcrumbs";
import "@mantine/carousel/styles.css";
import { PATHS } from "../../../routes/paths";
import {
  IconCoinEuro,
  IconMapPin,
  IconMapPinFilled,
  IconPlus,
  IconUsers,
  IconPhoto,
} from "@tabler/icons-react";
import AdminTable from "../../../components/admin/AdminTable";
import PaginationFooter from "../../../components/common/PaginationFooter";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";

import {
  useAssignEmployeeToEvent,
  useUpdateEventStatus,
  useGetAssignedEmployees,
  useGetEventDetails,
  useUnAssignEmployee,
} from "../../../hooks/eventHooks";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import FullScreenLoader from "../../../components/common/FullScreenLoader";
import { useGetAvailableEmployees } from "../../../hooks/employeeHooks";
import type { AssignedEmployee } from "../../../api/interfaces/event";
import { useLocation } from "react-router-dom";
import { CardStatsItem } from "../../../components/dashboard/CardStatsItem";
import { PhotosCarousel } from "../../../components/photo/PhotosCarousel";
import { EditEventModal } from "../../../components/event/EditEventModal";
import { CancelEventModal } from "../../../components/event/CancelEventModal";
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
    openedUpdateStatusModal,
    { open: openUpdateStatusModal, close: closeUpdateStatusModal },
  ] = useDisclosure(false);
  const cancelEvent = useUpdateEventStatus(
    id_event,
    eventDetails?.status === "cancelled"
      ? "approved"
      : eventDetails?.status === "pending" || eventDetails?.status === "refused"
        ? "approved"
        : "cancelled",
  );
  const handleUpdateEventStatus = () => {
    cancelEvent.mutate(undefined, {
      onSuccess: () => {
        closeUpdateStatusModal();
      },
    });
  };
  if (isLoadingEventDetails) return <FullScreenLoader />;
  return (
    <Container px="md" size="xl">
      <Title order={2} mt="xs" mb="sm">
        Event's Details
      </Title>
      <MyBreadcrumbs
        breadcrumbs={[
          ...(origin === "validationHub"
            ? [
                { title: "Validation Hub", href: PATHS.ADMIN.VALIDATIONS.ALL },
                { title: "Event's Details", href: "#" },
              ]
            : origin?.from === "historyDetails"
              ? [
                  {
                    title: "History Details",
                    href: "/admin/history/" + origin.id_history,
                  },
                  { title: "Event's Details", href: "#" },
                ]
              : origin?.from === "userDetails"
                ? [
                    {
                      title: "User Management",
                      href: "/admin/users/",
                    },
                    {
                      title: "User's Details",
                      href: "/admin/users/" + origin.id_user,
                    },
                    { title: "Event's Details", href: "#" },
                  ]
                : [
                    { title: "Event Management", href: PATHS.ADMIN.EVENTS.ALL },
                    { title: "Event's Details", href: "#" },
                  ]),
        ]}
      />
      <Container p="lg" size="xl">
        <Grid gap="xl" align="flex-start" mb="xl">
          {/* LEFT SECTION */}
          <Grid.Col span={{ base: 12, md: 8 }}>
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
            {eventDetails?.images && eventDetails.images.length > 0 && (
              <>
                <Divider my="xl" />
                <Group gap="sm">
                  <IconPhoto color="var(--mantine-color-blue-6)" size={32} />
                  <Title order={3}>Photos</Title>
                </Group>
                <div style={{ marginTop: "16px" }}>
                  <PhotosCarousel
                    photos={eventDetails?.images || []}
                    initialSlide={0}
                  />
                </div>
              </>
            )}
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
            <Card withBorder shadow="sm" radius="md" padding="lg">
              {/* Header/Date Section */}
              <Card.Section withBorder inheritPadding py="xs">
                <Group justify="space-between">
                  <Text fw={700} size="sm">
                    {eventDetails?.start_at
                      ? `${dayjs(eventDetails.start_at).format("dddd, MMM DD · HH:mm")}${
                          eventDetails.end_at
                            ? " - " +
                              dayjs(eventDetails.end_at).format(
                                "dddd, MMM DD · HH:mm",
                              )
                            : ""
                        }`
                      : "No specified date"}
                  </Text>
                  <Text size="xs" c="dimmed">
                    UTC {dayjs(eventDetails?.start_at).format("Z")}
                  </Text>
                </Group>
              </Card.Section>

              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" mt="md">
                <CardStatsItem
                  icon={<IconCoinEuro size={18} />}
                  label="Price"
                  color="yellow"
                  value={
                    <Text
                      span
                      c={!eventDetails?.price ? "green" : "inherit"}
                      fw={!eventDetails?.price ? 700 : 600}
                    >
                      {eventDetails?.price ? `${eventDetails.price} €` : "Free"}
                    </Text>
                  }
                />

                <CardStatsItem
                  icon={<IconUsers size={18} />}
                  label="Capacity"
                  color="blue"
                  value={
                    eventDetails?.capacity
                      ? `${eventDetails.capacity} people max`
                      : "Unlimited"
                  }
                />

                <CardStatsItem
                  icon={<IconMapPin size={18} />}
                  label="Location"
                  color="green"
                  value={`${eventDetails?.street}, ${eventDetails?.city}`}
                />
              </SimpleGrid>

              {/* Footer Actions */}
              <Stack mt="xl">
                <Group grow>
                  <Button variant="edit" onClick={openEdit} fullWidth>
                    Edit event
                  </Button>
                  <Button
                    fullWidth
                    variant={
                      ["cancelled", "pending", "refused"].includes(
                        eventDetails?.status ?? "",
                      )
                        ? "primary"
                        : "delete"
                    }
                    onClick={openUpdateStatusModal}
                  >
                    {eventDetails?.status === "cancelled"
                      ? "Reopen event"
                      : ["pending", "refused"].includes(
                            eventDetails?.status ?? "",
                          )
                        ? "Approve event"
                        : "Cancel event"}
                  </Button>
                </Group>
              </Stack>

              {/* Edit Modal Logic */}
              <EditEventModal
                opened={openedEdit}
                onClose={closeEdit}
                id_event={id_event}
                eventDetails={eventDetails}
              />
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
            disabled={eventDetails?.status === "approved"}
            closeDelay={200}
            transitionProps={{ transition: "pop", duration: 300 }}
          >
            <div style={{ width: "fit-content" }}>
              <Button
                variant="primary"
                onClick={openAssign}
                leftSection={<IconPlus size={16} />}
                disabled={eventDetails?.status !== "approved"}
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
          footer={
            <PaginationFooter
              activePage={1}
              setPage={() => {}}
              total_records={assignedEmployees?.length || 0}
              last_page={1}
              limit={assignedEmployees?.length || 0}
              loading={isLoadingAssignedEmployees}
              unit="employees"
            />
          }
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
                      disabled={eventDetails?.status === "approved"}
                      closeDelay={200}
                      transitionProps={{ transition: "pop", duration: 300 }}
                    >
                      {/* Wrap in a div to capture hover events when the button is disabled */}
                      <div style={{ width: "fit-content", margin: "auto" }}>
                        <Button
                          variant="delete"
                          disabled={eventDetails?.status !== "approved"}
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
      <CancelEventModal
        opened={openedUpdateStatusModal}
        onClose={closeUpdateStatusModal}
        onConfirm={handleUpdateEventStatus}
        loading={cancelEvent.isPending}
        title={
          eventDetails?.status === "cancelled"
            ? "Reopen Event"
            : eventDetails?.status === "pending" ||
                eventDetails?.status === "refused"
              ? "Approve Event"
              : "Cancel Event"
        }
        message={
          eventDetails?.status === "cancelled"
            ? "Are you sure you want to reopen this event? It will be visible to all users again."
            : eventDetails?.status === "pending" ||
                eventDetails?.status === "refused"
              ? "Are you sure you want to approve this event? It will be published and visible to all users."
              : "Are you sure you want to cancel this event? This action will notify all registered participants."
        }
        confirmLabel={
          eventDetails?.status === "cancelled"
            ? "Confirm Reopen"
            : eventDetails?.status === "pending" ||
                eventDetails?.status === "refused"
              ? "Confirm Approval"
              : "Confirm Cancellation"
        }
      />
    </Container>
  );
}
