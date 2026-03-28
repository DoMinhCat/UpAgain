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
  SimpleGrid,
  Image,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { Carousel } from "@mantine/carousel";
import AdminBreadcrumbs from "../../../components/admin/AdminBreadcrumbs";
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
import PaginationFooter from "../../../components/PaginationFooter";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
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
import ImageDropzone from "../../../components/ImageDropzone";
import { CardStatsItem } from "../../../components/admin/CardStatsItem";
export default function AdminEventDetails() {
  const [openedCarousel, { open: openCarousel, close: closeCarousel }] =
    useDisclosure(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const handleImageClick = (index: number) => {
    setActiveSlide(index);
    openCarousel();
  };

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
  const [fileEdit, setFileEdit] = useState<any[]>([]);

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
      const files = eventDetails.images?.map((path, index) => {
        return {
          path: path,
        };
      });
      setFileEdit(files || []);
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
    const imagesData = new FormData();
    fileEdit.forEach((obj) => {
      if (obj instanceof File) {
        imagesData.append("images", obj);
      } else if (obj.path) {
        imagesData.append("existing_images", obj.path);
      }
    });

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
        images: imagesData,
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
        <Grid gutter="xl" align="flex-start" mb="xl">
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
                <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} mt="md">
                  {eventDetails.images.map((path, index) => (
                    <Image
                      key={index}
                      src={`${import.meta.env.VITE_API_BASE_URL}/${path}`}
                      radius="md"
                      alt={`Event photo ${index + 1}`}
                      fallbackSrc="https://placehold.co/600x400?text=Image+not+found"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleImageClick(index)}
                    />
                  ))}
                </SimpleGrid>

                <Modal
                  opened={openedCarousel}
                  onClose={closeCarousel}
                  size="xl"
                  centered
                  title="Event's gallery"
                  styles={{
                    root: {
                      zIndex: 1000,
                    },
                    body: {
                      padding: "xs",
                    },
                  }}
                >
                  <Carousel
                    initialSlide={activeSlide}
                    withIndicators
                    height={500}
                    slideSize="100%"
                    emblaOptions={{
                      loop: true,
                      align: "center",
                      slidesToScroll: 1,
                    }}
                  >
                    {eventDetails.images.map((path, index) => (
                      <Carousel.Slide key={index}>
                        <Image
                          src={`${import.meta.env.VITE_API_BASE_URL}/${path}`}
                          h={500}
                          fit="contain"
                          radius={0}
                          alt={`Event photo ${index + 1}`}
                          fallbackSrc="https://placehold.co/600x400?text=Image+not+found"
                        />
                      </Carousel.Slide>
                    ))}
                  </Carousel>
                </Modal>
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
                  <Button variant="edit" onClick={handleOpenEdit} fullWidth>
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

              {/* Edit Modal Logic remains here */}
              <Modal
                opened={openedEdit}
                onClose={handleCloseEdit}
                title="Edit event"
                centered
                size="xl"
              >
                {/* ... your existing Modal content ... */}
              </Modal>
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
            disabled={eventDetails?.status === "approved"}
            closeDelay={200}
            transitionProps={{ transition: "pop", duration: 300 }}
          >
            {/* Wrap in a div to capture hover events when the button is disabled */}
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
      <Modal
        opened={openedUpdateStatusModal}
        onClose={closeUpdateStatusModal}
        title={
          eventDetails?.status === "cancelled"
            ? "Reopen Event"
            : eventDetails?.status === "pending" ||
                eventDetails?.status === "refused"
              ? "Approve Event"
              : "Cancel Event"
        }
      >
        <Text>
          Are you sure you want to{" "}
          {eventDetails?.status === "cancelled"
            ? "reopen"
            : eventDetails?.status === "pending" ||
                eventDetails?.status === "refused"
              ? "approve"
              : "cancel"}{" "}
          this event?
        </Text>
        <Group mt="lg" justify="end">
          <Button onClick={closeUpdateStatusModal} variant="grey">
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleUpdateEventStatus();
            }}
            variant={
              eventDetails?.status === "cancelled" ||
              eventDetails?.status === "pending" ||
              eventDetails?.status === "refused"
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
