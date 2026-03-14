import {
  Container,
  Box,
  Flex,
  Paper,
  Stack,
  Group,
  Text,
  Title,
  Button,
  Modal,
  ThemeIcon,
  Select,
} from "@mantine/core";
import { PATHS } from "../../routes/paths";
import AdminBreadcrumbs from "../../components/admin/AdminBreadcrumbs";
import { useEffect, useState } from "react";
import {
  getContainerDetails,
  deleteContainer,
  updateContainerStatus,
  type Container as ContainerType,
} from "../../api/admin/containerModule";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import {
  showErrorNotification,
  showSuccessNotification,
} from "../../components/NotificationToast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import FullScreenLoader from "../../components/FullScreenLoader";
import InfoField from "../../components/InfoField";
import dayjs from "dayjs";
import { IconBox, IconTrash, IconEdit, IconAlertTriangle } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";

export default function AdminContainersDetails() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const params = useParams();
  const [openedDelete, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const [openedStatus, { open: openStatus, close: closeStatus }] = useDisclosure(false);
  
  const containerId: number = params.id ? parseInt(params.id) : 0;
  const isValidId = !isNaN(containerId) && containerId > 0;

  const {
    data: container,
    isLoading,
    error,
  } = useQuery<ContainerType>({
    queryKey: ["containerDetails", containerId],
    queryFn: () => getContainerDetails(containerId),
    enabled: isValidId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteContainer(id),
    onSuccess: () => {
      showSuccessNotification("Success", "Container removed successfully");
      navigate(PATHS.ADMIN.CONTAINERS);
    },
    onError: (err: any) => showErrorNotification("Error", err.message),
  });

  const statusMutation = useMutation({
    mutationFn: (newStatus: string) => updateContainerStatus(containerId, newStatus),
    onSuccess: () => {
      showSuccessNotification("Updated", "Container status changed");
      queryClient.invalidateQueries({ queryKey: ["containerDetails", containerId] });
      closeStatus();
    },
  });

  if (isLoading) return <FullScreenLoader />;
  if (error || !isValidId) return <Navigate to={PATHS.ADMIN.CONTAINERS} replace />;

  return (
    <Container px="md" size="xl">
      <AdminBreadcrumbs
        breadcrumbs={[
          { title: "Container Management", href: PATHS.ADMIN.CONTAINERS },
          { title: `Container #${containerId}`, href: "#" },
        ]}
      />

      <Container px="md" size="sm" mt="xl">
        <Stack justify="center" align="center" mb="xl">
          <ThemeIcon size={80} radius="xl" color={container?.status === 'ready' ? 'green' : 'orange'}>
            <IconBox size={45} />
          </ThemeIcon>
          <Title order={2}>Container #{container?.id}</Title>
          <Text c="dimmed">{container?.city_name} - {container?.postal_code}</Text>
        </Stack>

        <Title order={3} ta="left" mt="xl">Operational Information</Title>
        <Paper variant="primary" px="lg" py="md" mt="sm">
          <InfoField label="Current Status">
             <Group mt="xs" mb="xl">
                <Text fw={700} c={container?.status === 'ready' ? 'green' : 'orange'}>
                  {container?.status.toUpperCase()}
                </Text>
                <Button size="compact-xs" variant="light" onClick={openStatus} leftSection={<IconEdit size={14}/>}>
                  Change Status
                </Button>
             </Group>
          </InfoField>

          <InfoField label="Location">
            <Text ps="sm" mt="xs" mb="xl">{container?.city_name} ({container?.postal_code})</Text>
          </InfoField>

          <InfoField label="Created On">
            <Text ps="sm" mt="xs">{dayjs(container?.created_at).format("DD/MM/YYYY - HH:mm")}</Text>
          </InfoField>
        </Paper>

        <Title order={3} ta="left" mt="xl" c="red">Danger Zone</Title>
        <Paper variant="primary" px="lg" py="md" mt="sm" style={{ border: '1px solid #ff000033' }}>
          <InfoField label="Maintenance Mode">
            <Box ps="sm" mb="xl">
              <Text c="dimmed" size="sm" mt="xs">Mark as maintenance if the smart-lock or sensors are failing.</Text>
              <Button mt="xs" variant="outline" color="orange" leftSection={<IconAlertTriangle size={16}/>} onClick={() => statusMutation.mutate('maintenance')}>
                Set to Maintenance
              </Button>
            </Box>
          </InfoField>

          <InfoField label="Permanently Remove">
            <Box ps="sm">
              <Text c="dimmed" size="sm" mt="xs">This will soft-delete the container from the active park.</Text>
              <Button mt="xs" variant="delete" leftSection={<IconTrash size={16}/>} onClick={openDelete}>
                Delete Container
              </Button>
            </Box>
          </InfoField>
        </Paper>
      </Container>

      <Modal opened={openedStatus} onClose={closeStatus} title="Update Container Status" centered>
        <Select
          label="New Status"
          placeholder="Pick one"
          data={[
            { value: 'ready', label: 'Ready' },
            { value: 'occupied', label: 'Occupied' },
            { value: 'maintenance', label: 'Maintenance' },
          ]}
          defaultValue={container?.status}
          onChange={(val) => val && statusMutation.mutate(val)}
        />
      </Modal>

      <Modal opened={openedDelete} onClose={closeDelete} title="Confirm Deletion" centered>
        <Text size="sm">Are you sure? This action will remove the container from the monitoring dashboard.</Text>
        <Group mt="xl" justify="flex-end">
          <Button variant="grey" onClick={closeDelete}>Cancel</Button>
          <Button variant="delete" loading={deleteMutation.isPending} onClick={() => deleteMutation.mutate(containerId)}>
            Confirm Delete
          </Button>
        </Group>
      </Modal>
    </Container>
  );
}