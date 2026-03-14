import {
  Container as MantineContainer,
  Paper,
  Grid,
  Title,
  Divider,
  Table,
  Button,
  Group,
  Text,
  Stack,
  TextInput,
  Select,
  Pill,
  Modal,
} from "@mantine/core";
import { 
  IconBox, 
  IconPackage, 
  IconPlus, 
  IconSearch,
  IconTrash
} from "@tabler/icons-react";
import { AdminCardInfo } from "../../components/admin/AdminCardInfo";
import AdminTable from "../../components/admin/AdminTable";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  getAllContainers, 
  createContainer, 
  deleteContainer, 
  type Container 
} from "../../api/admin/containerModule"; // Vérifie que ces fonctions sont exportées
import { useState, useMemo } from "react";
import dayjs from "dayjs";
import { useDisclosure } from "@mantine/hooks";
import { BarChart } from '@mantine/charts';
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../routes/paths";
import { 
  showErrorNotification, 
  showSuccessNotification 
} from "../../components/NotificationToast";

export default function AdminContainersModule() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Modals managers
  const [openedCreate, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [openedDelete, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  
  // States
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(null);
  const [filters, setFilters] = useState({ searchValue: "", statusValue: null as string | null });

  // 1. Fetching Data
  const { data: containers = [], isLoading } = useQuery<Container[]>({
    queryKey: ["containers"],
    queryFn: getAllContainers,
    staleTime: 1000 * 60 * 5, 
  });

  // 2. Mutations
  const createMutation = useMutation({
    mutationFn: createContainer,
    onSuccess: () => {
      showSuccessNotification("Success", "New container deployed successfully");
      queryClient.invalidateQueries({ queryKey: ["containers"] });
      closeCreate();
    },
    onError: () => showErrorNotification("Error", "Failed to create container")
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteContainer(id),
    onSuccess: () => {
      showSuccessNotification("Deleted", "Container removed from active inventory");
      queryClient.invalidateQueries({ queryKey: ["containers"] });
      closeDelete();
    },
    onError: () => showErrorNotification("Error", "Deletion failed")
  });

  // 3. Logic & Handlers
  const stats = useMemo(() => ({
    total: containers.length,
    ready: containers.filter(c => c.status === 'ready').length,
    full: containers.filter(c => c.status === 'full').length,
    maintenance: containers.filter(c => c.status === 'maintenance').length,
  }), [containers]);

  const chartData = useMemo(() => [
    { label: 'Ready', value: stats.ready, color: '#45a575' },
    { label: 'Occupied', value: stats.full, color: 'var(--mantine-color-yellow-6)' },
    { label: 'Maintenance', value: stats.maintenance, color: 'var(--mantine-color-red-6)' },
  ], [stats]);

  const filteredData = useMemo(() => {
    return containers.filter(c => {
      const matchesSearch = c.city_name.toLowerCase().includes(filters.searchValue.toLowerCase()) || 
                            c.postal_code.includes(filters.searchValue);
      const matchesStatus = !filters.statusValue || c.status === filters.statusValue;
      return matchesSearch && matchesStatus && !c.is_deleted;
    });
  }, [containers, filters]);

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      city_name: formData.get("city") as string,
      postal_code: formData.get("zip") as string,
    });
  };

  const handleOpenDeleteModal = (c: Container) => {
    setSelectedContainer(c);
    openDelete();
  };

  return (
    <MantineContainer px="md" size="xl">
      <Title order={2} mt="lg" mb="xl">Container Management</Title>

      <Grid mb="xl" align="stretch">
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="md">
            <AdminCardInfo
              icon={IconBox}
              title="Total Containers"
              value={stats.total}
              description="Across all European sites"
            />
            <AdminCardInfo
              icon={IconPackage}
              title="Ready / Total"
              value={`${stats.ready + stats.full} / ${stats.total}`}
              description={`${stats.total > 0 ? ((stats.ready + stats.full) / stats.total * 100).toFixed(0) : 0}% capacity used`}
            />
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper withBorder p="md" radius="lg" shadow="sm" h="100%">
            <Title order={4} mb="lg">Inventory Distribution</Title>
            <BarChart
              h={300}
              data={chartData}
              dataKey="label"
              series={[{ name: 'value', color: 'green.6' }]}
              gridAxis="xy"
              barProps={{ radius: [8, 8, 0, 0] }}
              getBarColor={(value) => {
                const item = chartData.find(d => d.value === value);
                return item ? item.color : 'blue';
              }}
              tooltipProps={{
                cursor: { fill: 'rgba(255, 255, 255, 0.05)' },
                content: ({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <Paper withBorder p="xs" radius="md" shadow="md">
                        <Text size="xs" fw={700} tt="uppercase" style={{ color: data.color }}>
                          {data.label}
                        </Text>
                        <Text fw={700} size="sm">{data.value} Containers</Text>
                      </Paper>
                    );
                  }
                  return null;
                },
              }}
            />
          </Paper>
        </Grid.Col>
      </Grid>

      <Divider my="xl" label="Detailed Inventory" labelPosition="center" />

      <Stack gap="md" mb="xl">
        <Group justify="space-between">
          <Group>
            <TextInput
              placeholder="Search by city or zip..."
              rightSection={<IconSearch size={16} />}
              value={filters.searchValue}
              onChange={(e) => setFilters({...filters, searchValue: e.target.value})}
            />
            <Select
              placeholder="Status"
              data={['ready', 'full', 'maintenance']}
              value={filters.statusValue}
              onChange={(val) => setFilters({...filters, statusValue: val})}
              clearable
            />
          </Group>
          <Button 
            leftSection={<IconPlus size={16} />} 
            variant="primary" 
            onClick={openCreate}
          >
            Add New Container
          </Button>
        </Group>

        <AdminTable 
          loading={isLoading}
          header={["Created At", "ID", "Location", "Zip Code", "Status", "Actions"]}
        >
          {filteredData.map((c) => (
            <Table.Tr 
              key={c.id} 
              style={{ cursor: "pointer" }} 
              onClick={() => navigate(`${PATHS.ADMIN.CONTAINERS}/${c.id}`)}
            >
              <Table.Td ta="center">{dayjs(c.created_at).format("DD/MM/YYYY")}</Table.Td>
              <Table.Td ta="center"><strong>{c.id}</strong></Table.Td>
              <Table.Td ta="center">{c.city_name}</Table.Td>
              <Table.Td ta="center">{c.postal_code}</Table.Td>
              <Table.Td ta="center">
                <Pill 
                  style={{ backgroundColor: c.status === 'ready' ? '#45a575' : c.status === 'full' ? 'var(--mantine-color-yellow-6)' : 'var(--mantine-color-red-6)' }}
                  c="white"
                >
                  {c.status.toUpperCase()}
                </Pill>
              </Table.Td>
              <Table.Td ta="center">
                <Group gap="xs" justify="center">
                  <Button 
                    variant="edit" 
                    size="xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`${PATHS.ADMIN.CONTAINERS}/${c.id}`);
                    }}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="delete" 
                    size="xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDeleteModal(c); 
                    }}
                  >
                    Delete
                  </Button>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </AdminTable>
      </Stack>

      {/* MODAL: CREATE */}
      <Modal opened={openedCreate} onClose={closeCreate} title="Deploy New Container" centered radius="md">
        <form onSubmit={handleCreateSubmit}>
          <Stack>
            <TextInput label="City" name="city" placeholder="e.g. Paris" required />
            <TextInput label="Postal Code" name="zip" placeholder="e.g. 75010" required />
            <Group justify="flex-end" mt="md">
              <Button variant="grey" onClick={closeCreate}>Cancel</Button>
              <Button type="submit" variant="primary" loading={createMutation.isPending}>
                Create Container
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* MODAL: DELETE CONFIRMATION */}
      <Modal opened={openedDelete} onClose={closeDelete} title="Confirm Deletion" centered radius="md">
        <Stack align="center" gap="sm">
          <IconTrash size={40} color="red" />
          <Text ta="center">
            Are you sure you want to delete container <strong>#{selectedContainer?.id}</strong> in {selectedContainer?.city_name}?
          </Text>
          <Text size="xs" c="dimmed">This action will perform a soft delete.</Text>
        </Stack>
        <Group justify="flex-end" mt="xl">
          <Button variant="grey" onClick={closeDelete}>Cancel</Button>
          <Button 
            variant="delete" 
            loading={deleteMutation.isPending}
            onClick={() => selectedContainer && deleteMutation.mutate(selectedContainer.id)}
          >
            Delete Permanently
          </Button>
        </Group>
      </Modal>

    </MantineContainer>
  );
}