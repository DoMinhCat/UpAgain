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
  TextInput,
} from "@mantine/core";
import { Calendar } from "@mantine/dates";
import { PATHS } from "../../../routes/paths";
import MyBreadcrumbs from "../../../components/nav/MyBreadcrumbs";
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
import { useTranslation } from "react-i18next";

import {
  useContainerDetails,
  useUpdateStatus,
  useDeleteContainer,
  useGetAllContainers,
  useUpdateLocation,
  useGetContainerSchedule,
} from "../../../hooks/containerHooks";

import { useState } from "react";

export default function AdminContainersDetails() {
  const { t } = useTranslation("admin");
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
  const [locationCity, setLocationCity] = useState(container?.city_name || "");
  const [locationStreet, setLocationStreet] = useState(container?.street || "");
  const { data: containersData } = useGetAllContainers();
  const locationMutation = useUpdateLocation();

  const cityOptions = [
    ...new Set(containersData?.containers?.map((c) => c.city_name) ?? []),
  ].map((city) => ({ value: city, label: city }));

  const handleLocationChange = (city_name: string, street: string) => {
    locationMutation.mutate(
      { id: containerId, city_name, street },
      {
        onSuccess: () => {
          closeLocation();
        },
      },
    );
  };

  const handleOpenLocation = () => {
    setLocationCity(container?.city_name || "");
    setLocationStreet(container?.street || "");
    openLocation();
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
      : container?.status === "occupied" || container?.status === "waiting"
        ? "yellow"
        : "red";

  return (
    <Container px="md" size="xl">
      <Title order={2} mt="xs" mb="sm">
        {t("containers.details.title")}
      </Title>
      <MyBreadcrumbs
        breadcrumbs={[
          ...(origin?.from === "historyDetails"
            ? [
                {
                  title: t("history.details.title"),
                  href: PATHS.ADMIN.HISTORY.ALL + "/" + origin.id_history,
                },
              ]
            : origin?.from === "listingDetails"
              ? [
                  {
                    title: t("common:object_management", { defaultValue: "Object Management" }),
                    href: PATHS.ADMIN.LISTINGS,
                  },
                  {
                    title: t("listings.details.title"),
                    href: PATHS.ADMIN.LISTINGS + "/" + origin.id_listing,
                  },
                ]
              : [
                  {
                    title: t("containers.title"),
                    href: PATHS.ADMIN.CONTAINERS,
                  },
                ]),
          { title: t("containers.details.title"), href: "#" },
        ]}
      />

      <Container px="md" size="sm" mt="xl">
        <Stack justify="center" align="center" mb="xl">
          <ThemeIcon size={80} radius="xl" color={statusColor}>
            <IconBox size={45} />
          </ThemeIcon>
          <Title order={2}>{t("common:container")} #{container?.id}</Title>
          <Text c="dimmed">
            {container?.street}, {container?.city_name} -{" "}
            {container?.postal_code}
          </Text>
        </Stack>

        <Title order={3} ta="left" mt="xl">
          {t("containers.details.general_info")}
        </Title>
        <Paper variant="primary" px="lg" py="md" mt="sm" radius="lg">
          <InfoField label={t("containers.details.current_status")}>
            <Group mt="xs" mb="xl">
              <Text fw={700} c={statusColor}>
                {t(`status.${container?.status}` as any, { defaultValue: container?.status.toUpperCase() })}
              </Text>
              <Button
                size="compact-xs"
                variant="light"
                onClick={openStatus}
                leftSection={<IconEdit size={14} />}
              >
                {t("containers.details.change_status")}
              </Button>
            </Group>
          </InfoField>

          <InfoField label={t("containers.details.location")}>
            <Group mt="xs" mb="xl">
              <Text fw={500}>
                {container?.street}, {container?.city_name} (
                {container?.postal_code})
              </Text>
              <Button
                size="compact-xs"
                variant="light"
                onClick={handleOpenLocation}
                leftSection={<IconEdit size={14} />}
              >
                {t("containers.details.change_location")}
              </Button>
            </Group>
          </InfoField>

          <InfoField label={t("containers.details.created_on")}>
            <Text ps="sm" mt="xs">
              {dayjs(container?.created_at).format("DD/MM/YYYY - HH:mm")}
            </Text>
          </InfoField>
        </Paper>

        <Title order={3} ta="left" mt="xl">
          {t("containers.details.activities")}
        </Title>
        <Paper variant="primary" px="lg" py="md" mt="sm" radius="lg">
          <InfoField label={t("containers.details.current_object")}>
            {container?.status === "maintenance" ? (
              <Text ps="sm" mt="xs" mb="lg">
                {t("containers.details.under_maintenance")}
              </Text>
            ) : container?.current_deposit_id === 0 ? (
              <Text ps="sm" mt="xs" mb="lg">
                {t("containers.details.no_object")}
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

          <InfoField label={t("common:schedule")}>
            <Button mt="xs" variant="primary" size="sm" onClick={openCalendar}>
              {t("containers.details.view_schedule")}
            </Button>
          </InfoField>
        </Paper>

        <Title order={3} ta="left" mt="xl" c="red">
          {t("containers.details.danger_zone")}
        </Title>
        <Paper
          variant="primary"
          px="lg"
          py="md"
          mt="sm"
          radius="lg"
          style={{ border: "1px solid #ff000033" }}
        >
          <InfoField label={t("containers.details.permanently_remove")}>
            <Box ps="sm">
              <Text c="dimmed" size="sm" mt="xs">
                {t("containers.details.permanently_remove_desc")}
              </Text>
              <Button
                mt="xs"
                variant="delete"
                leftSection={<IconTrash size={16} />}
                onClick={openDelete}
              >
                {t("containers.details.delete_button")}
              </Button>
            </Box>
          </InfoField>
        </Paper>
      </Container>

      {/* MODALS */}
      <Modal
        opened={openedStatus}
        onClose={closeStatus}
        title={t("containers.details.change_status")}
        centered
      >
        <Select
          label={t("history.filters.status")}
          placeholder={t("history.filters.sort_placeholder")}
          withAsterisk
          data={[
            { value: "ready", label: t("status.ready") },
            { value: "maintenance", label: t("status.maintenance") },
          ]}
          defaultValue={container?.status}
          onChange={(val) => val && handleStatusChange(val)}
        />
      </Modal>

      <Modal
        opened={openedLocation}
        onClose={closeLocation}
        title={t("containers.details.change_location")}
        centered
      >
        <Stack>
          <Select
            withAsterisk
            label={t("containers.create_modal.city")}
            required
            data={cityOptions}
            value={locationCity}
            onChange={(val) => val && setLocationCity(val)}
          />
          <TextInput
            label={t("containers.create_modal.street")}
            withAsterisk
            value={locationStreet}
            onChange={(e) => setLocationStreet(e.target.value)}
            required
          />
          <Group justify="flex-end" mt="md">
            <Button variant="grey" onClick={closeLocation}>
              {t("common:actions.cancel")}
            </Button>
            <Button
              disabled={!locationCity || !locationStreet}
              onClick={() => handleLocationChange(locationCity, locationStreet)}
            >
              {t("common:actions.confirm")}
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={openedDelete}
        onClose={closeDelete}
        title={t("containers.delete_modal.title")}
        centered
      >
        <Text size="sm">
          {t("containers.delete_modal.text", { id: container?.id, city: container?.city_name })}
        </Text>
        <Group mt="xl" justify="flex-end">
          <Button variant="grey" onClick={closeDelete}>
            {t("common:actions.cancel")}
          </Button>
          <Button
            variant="delete"
            loading={deleteMutation.isPending}
            onClick={handleDelete}
          >
            {t("containers.delete_modal.confirm")}
          </Button>
        </Group>
      </Modal>

      <Modal
        size="lg"
        title={<Text fw={700}>{t("containers.details.schedule_title", { id: container?.id })}</Text>}
        opened={openedCalendar}
        onClose={closeCalendar}
        centered
        styles={{
          body: {
            paddingBottom: "var(--mantine-spacing-xl)",
            overflowX: "hidden",
          },
        }}
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
                          processing={
                            hasTasks &&
                            dayjs(date).endOf("day").isAfter(dayjs())
                          }
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
                                      ? t("containers.details.drop_off")
                                      : t("containers.details.pick_up")}
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
