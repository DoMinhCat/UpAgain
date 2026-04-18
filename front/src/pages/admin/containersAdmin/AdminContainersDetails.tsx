import {
  Container,
  Box,
  Paper,
  Stack,
  Group,
  Text,
  Title,
  Button,
  Modal,
  ThemeIcon,
  Select,
  Anchor,
  Center,
  Loader,
  HoverCard,
  Indicator,
  UnstyledButton,
} from "@mantine/core";
import { Calendar } from "@mantine/dates";
import { PATHS } from "../../../routes/paths";
import AdminBreadcrumbs from "../../../components/admin/AdminBreadcrumbs";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import FullScreenLoader from "../../../components/common/FullScreenLoader";
import InfoField from "../../../components/common/InfoField";
import dayjs from "dayjs";
import { IconBox, IconTrash, IconEdit } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";

import {
  useContainerDetails,
  useUpdateStatus,
  useDeleteContainer,
  useGetAllContainers,
  useUpdateLocation,
  useGetContainerSchedule,
} from "../../../hooks/containerHooks";

// TODO: add street field to table containers
// TODO: link to listing/deposit object if its currently occupied
export default function AdminContainersDetails() {
  const origin = useLocation().state;
  const navigate = useNavigate();
  const params = useParams();
  const [openedDelete, { open: openDelete, close: closeDelete }] =
    useDisclosure(false);
  const [openedStatus, { open: openStatus, close: closeStatus }] =
    useDisclosure(false);
  const [openedLocation, { open: openLocation, close: closeLocation }] =
    useDisclosure(false);
  const [openedCalendar, { open: openCalendar, close: closeCalendar }] =
    useDisclosure(false);

  const containerId: number = params.id ? parseInt(params.id) : 0;
  const isValidId = !isNaN(containerId) && containerId > 0;
  if (!isValidId) {
    console.log("Invalid container ID", containerId);
    navigate(PATHS.ERROR.NOT_FOUND, { replace: true });
  }

  const {
    data: container,
    isLoading,
    isError,
  } = useContainerDetails(containerId);

  const { data: scheduleData, isLoading: isScheduleLoading } =
    useGetContainerSchedule(containerId);

  //location
  const { data: containersData } = useGetAllContainers();
  const locationMutation = useUpdateLocation();

  const cityOptions = [
    ...new Set(containersData?.containers?.map((c) => c.city_name) ?? []),
  ].map((city) => ({ value: city, label: city }));

  const handleLocationChange = (city_name: string) => {
    locationMutation.mutate(
      { id: containerId, city_name },
      { onSuccess: () => closeLocation() },
    );
  };
  //status
  const statusMutation = useUpdateStatus();
  const deleteMutation = useDeleteContainer();

  const handleStatusChange = (newStatus: string) => {
    statusMutation.mutate(
      { id: containerId, status: newStatus },
      { onSuccess: () => closeStatus() },
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(containerId, {
      onSuccess: () => navigate(PATHS.ADMIN.CONTAINERS),
    });
  };

  if (isLoading) return <FullScreenLoader />;
  if (isError) return <Navigate to={PATHS.ADMIN.CONTAINERS} replace />;

  const statusColor =
    container?.status === "ready"
      ? "green"
      : container?.status === "occupied"
        ? "orange"
        : "red";

  return (
    <Container px="md" size="xl">
      <Title order={2} mt="xs" mb="sm">
        Container's Details
      </Title>
      <AdminBreadcrumbs
        breadcrumbs={[
          ...(origin?.from === "historyDetails"
            ? [
                {
                  title: "History Details",
                  href: PATHS.ADMIN.HISTORY.ALL + "/" + origin.id_history,
                },
              ]
            : origin?.from === "listingDetails"
              ? [
                  {
                    title: "Object Management",
                    href: PATHS.ADMIN.LISTINGS,
                  },
                  {
                    title: "Object's Details",
                    href: PATHS.ADMIN.LISTINGS + "/" + origin.id_listing,
                  },
                ]
              : [
                  {
                    title: "Container Management",
                    href: PATHS.ADMIN.CONTAINERS,
                  },
                ]),
          { title: `Container's Details`, href: "#" },
        ]}
      />

      <Container px="md" size="sm" mt="xl">
        <Stack justify="center" align="center" mb="xl">
          <ThemeIcon size={80} radius="xl" color={statusColor}>
            <IconBox size={45} />
          </ThemeIcon>
          <Title order={2}>Container #{container?.id}</Title>
          <Text c="dimmed">
            {container?.city_name} - {container?.postal_code}
          </Text>
        </Stack>

        <Title order={3} ta="left" mt="xl">
          General Information
        </Title>
        <Paper variant="primary" px="lg" py="md" mt="sm">
          <InfoField label="Current Status">
            <Group mt="xs" mb="xl">
              <Text fw={700} c={statusColor}>
                {container?.status.toUpperCase()}
              </Text>
              <Button
                size="compact-xs"
                variant="light"
                onClick={openStatus}
                leftSection={<IconEdit size={14} />}
              >
                Change Status
              </Button>
            </Group>
          </InfoField>

          <InfoField label="Location">
            <Group mt="xs" mb="xl">
              <Text fw={500}>
                {container?.city_name} ({container?.postal_code})
              </Text>
              <Button
                size="compact-xs"
                variant="light"
                onClick={openLocation}
                leftSection={<IconEdit size={14} />}
              >
                Change Location
              </Button>
            </Group>
          </InfoField>

          <InfoField label="Created On">
            <Text ps="sm" mt="xs">
              {dayjs(container?.created_at).format("DD/MM/YYYY - HH:mm")}
            </Text>
          </InfoField>
        </Paper>

        <Title order={3} ta="left" mt="xl">
          Activities
        </Title>
        <Paper variant="primary" px="lg" py="md" mt="sm">
          <InfoField label="Current Object">
            {container?.status === "maintenance" ? (
              <Text ps="sm" mt="xs" mb="lg">
                This container is currently under maintenance.
              </Text>
            ) : container?.current_deposit_id === 0 ? (
              <Text ps="sm" mt="xs" mb="lg">
                There is no object ready for pickup or drop-off for this
                container.
              </Text>
            ) : (
              <Anchor
                onClick={() =>
                  navigate(
                    PATHS.ADMIN.LISTINGS + "/" + container?.current_deposit_id,
                    {
                      state: {
                        from: "containerDetails",
                        idContainer: containerId,
                      },
                    },
                  )
                }
                ps="sm"
                mt="xs"
                mb="lg"
                c="var(--component-color-primary)"
                display="block"
                style={{ cursor: "pointer" }}
              >
                {container?.current_deposit_title}
              </Anchor>
            )}
          </InfoField>

          <InfoField label="Planning">
            <Button mt="xs" variant="primary" size="sm" onClick={openCalendar}>
              View container's planning
            </Button>
          </InfoField>
        </Paper>

        <Title order={3} ta="left" mt="xl" c="red">
          Danger Zone
        </Title>
        <Paper
          variant="primary"
          px="lg"
          py="md"
          mt="sm"
          style={{ border: "1px solid #ff000033" }}
        >
          <InfoField label="Permanently Remove">
            <Box ps="sm">
              <Text c="dimmed" size="sm" mt="xs">
                This will soft-delete the container from the active park.
              </Text>
              <Button
                mt="xs"
                variant="delete"
                leftSection={<IconTrash size={16} />}
                onClick={openDelete}
              >
                Delete Container
              </Button>
            </Box>
          </InfoField>
        </Paper>
      </Container>

      {/* MODALS */}
      <Modal
        opened={openedStatus}
        onClose={closeStatus}
        title="Update Container Status"
        centered
      >
        <Select
          label="New Status"
          placeholder="Pick one"
          data={[
            { value: "ready", label: "Ready" },
            { value: "maintenance", label: "Maintenance" },
          ]}
          defaultValue={container?.status}
          onChange={(val) => val && handleStatusChange(val)}
        />
      </Modal>

      <Modal
        opened={openedLocation}
        onClose={closeLocation}
        title="Update Container Location"
        centered
      >
        <Select
          label="New Location"
          placeholder="Pick a city"
          data={cityOptions}
          defaultValue={container?.city_name}
          onChange={(val) => val && handleLocationChange(val)}
        />
      </Modal>

      <Modal
        opened={openedDelete}
        onClose={closeDelete}
        title="Confirm Deletion"
        centered
      >
        <Text size="sm">
          Are you sure? This action will remove the container from the
          monitoring dashboard.
        </Text>
        <Group mt="xl" justify="flex-end">
          <Button variant="grey" onClick={closeDelete}>
            Cancel
          </Button>
          <Button
            variant="delete"
            loading={deleteMutation.isPending}
            onClick={handleDelete}
          >
            Confirm Delete
          </Button>
        </Group>
      </Modal>

      <Modal
        size="lg"
        title={<Text fw={700}>Container #{container?.id} schedule</Text>}
        opened={openedCalendar}
        onClose={closeCalendar}
        centered
        styles={{ body: { paddingBottom: "var(--mantine-spacing-xl)", overflowX: "hidden" } }}
      >
        <Center>
          {isScheduleLoading ? (
            <Loader />
          ) : (
            <Box px="sm" w="100%">
              <Calendar
              styles={{
                levelsGroup: { width: "100%" },
                month: { width: "100%" },
                weekday: { textAlign: "center" },
                day: { width: "100%" },
                calendarHeader: {
                  maxWidth: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "var(--mantine-spacing-md)",
                },
              }}
              static
              size="lg"
              renderDay={(date) => {
                const day = dayjs(date).date();
                const userTasksOnDate =
                  scheduleData?.user_range?.filter((event) => {
                    const eventStartVal = dayjs(event.valid_from).valueOf();
                    const eventEndVal = dayjs(event.valid_to).valueOf();
                    const dayStartVal = dayjs(date).valueOf();
                    const dayEndVal = dayjs(date).endOf("day").valueOf();

                    return (
                      eventStartVal <= dayEndVal && eventEndVal >= dayStartVal
                    );
                  }) || [];
                const proTasksOnDate =
                  scheduleData?.pro_range?.filter((event) => {
                    const eventStartVal = dayjs(event.valid_from).valueOf();
                    const eventEndVal = dayjs(event.valid_to).valueOf();
                    const dayStartVal = dayjs(date).valueOf();
                    const dayEndVal = dayjs(date).endOf("day").valueOf();

                    return (
                      eventStartVal <= dayEndVal && eventEndVal >= dayStartVal
                    );
                  }) || [];

                const tasksOnDate = [
                  ...userTasksOnDate.map((t) => ({ ...t, type: "user" })),
                  ...proTasksOnDate.map((t) => ({ ...t, type: "pro" })),
                ];
                const hasTasks = tasksOnDate.length > 0;

                let indicatorColor = "var(--mantine-color-blue-6)";
                if (proTasksOnDate.length > 0)
                  indicatorColor = "var(--mantine-color-yellow-6)";

                return (
                  <HoverCard
                    shadow="xl"
                    disabled={!hasTasks}
                    withinPortal
                    withArrow
                    openDelay={100}
                    closeDelay={200}
                  >
                    <HoverCard.Target>
                      <Indicator
                        processing={hasTasks && dayjs(date).endOf("day").isAfter(dayjs())}
                        size={hasTasks && tasksOnDate.length > 1 ? 18 : 10}
                        color={indicatorColor}
                        offset={tasksOnDate.length > 1 ? 4 : 0}
                        disabled={!hasTasks}
                        label={
                          tasksOnDate.length > 1
                            ? `+${tasksOnDate.length}`
                            : undefined
                        }
                        styles={{
                          indicator: {
                            fontSize: "10px",
                            fontWeight: 700,
                          },
                        }}
                        style={{ width: "100%", height: "100%" }}
                      >
                        <Center w="100%" h="100%">
                          <Text size="sm" fw={hasTasks ? 700 : 400}>
                            {day}
                          </Text>
                        </Center>
                      </Indicator>
                    </HoverCard.Target>

                    <HoverCard.Dropdown p="sm">
                      <Stack gap="xs">
                        <Box
                          style={{
                            borderBottom: "1px solid var(--border-color)",
                            paddingBottom: "4px",
                          }}
                        >
                          <Text size="xs" c="dimmed" tt="uppercase">
                            {dayjs(date).format("dddd")}
                          </Text>
                          <Text size="sm">
                            {dayjs(date).format("DD MMM YYYY")}
                          </Text>
                        </Box>

                        <Stack gap={4}>
                          {tasksOnDate.map((task, i) => (
                            <UnstyledButton
                              key={`${task.type}-${task.deposit_id}-${i}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                closeCalendar();
                                navigate(
                                  `${PATHS.ADMIN.LISTINGS}/${task.deposit_id}`,
                                  {
                                    state: {
                                      from: "containerDetails",
                                      idContainer: containerId,
                                    },
                                  },
                                );
                              }}
                              style={{
                                padding: "6px 8px",
                                borderRadius: "4px",
                                transition: "background 0.2s ease",
                              }}
                              onMouseEnter={(e) => (
                                (e.currentTarget.style.backgroundColor =
                                  "var(--upagain-neutral-green)"),
                                (e.currentTarget.style.color =
                                  "var(--text-color)")
                              )}
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "transparent")
                              }
                            >
                              <Group gap="xs" wrap="nowrap">
                                <Text size="sm" truncate>
                                  {task.type === "user"
                                    ? "[Drop-off] "
                                    : "[Pick-up] "}
                                  {task.deposit_title}
                                </Text>
                              </Group>
                            </UnstyledButton>
                          ))}
                        </Stack>
                      </Stack>
                    </HoverCard.Dropdown>
                  </HoverCard>
                );
              }}
              />
            </Box>
          )}
        </Center>
      </Modal>
    </Container>
  );
}
