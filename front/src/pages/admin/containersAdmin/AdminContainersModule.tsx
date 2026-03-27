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
  ActionIcon,
} from "@mantine/core";
import {
  IconBox,
  IconPackage,
  IconPlus,
  IconSearch,
  IconTrash,
  IconEdit,
} from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useDisclosure } from "@mantine/hooks";
import { BarChart } from "@mantine/charts";

import { AdminCardInfo } from "../../../components/admin/AdminCardInfo";
import AdminTable from "../../../components/admin/AdminTable";
import PaginationFooter from "../../../components/PaginationFooter";

import {
  useContainers,
  useCreateContainer,
  useDeleteContainer,
} from "../../../hooks/containerHooks";
import { PATHS } from "../../../routes/paths";
export interface Container {
  id: number;
  created_at: string;
  city_name: string;
  postal_code: string;
  status: "ready" | "occupied" | "maintenance";
  is_deleted: boolean;
}

export default function AdminContainersModule() {
  const navigate = useNavigate();
  const [openedCreate, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);
  const [openedDelete, { open: openDelete, close: closeDelete }] =
    useDisclosure(false);

  const [selectedContainer, setSelectedContainer] = useState<Container | null>(
    null,
  );
  const [filters, setFilters] = useState({
    searchValue: "",
    statusValue: null as string | null,
  });

  const { data: containers = [], isLoading } = useContainers();
  const createMutation = useCreateContainer();
  const deleteMutation = useDeleteContainer();
  const handleDeleteContainer = (id: number) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        closeDelete();
      },
    });
  };

  const stats = useMemo(
    () => ({
      total: containers.length,
      ready: containers.filter((c) => c.status === "ready").length,
      occupied: containers.filter((c) => c.status === "occupied").length,
      maintenance: containers.filter((c) => c.status === "maintenance").length,
    }),
    [containers],
  );

  const chartData = useMemo(
    () => [
      { label: "Ready", value: stats.ready, color: "#45a575" },
      {
        label: "Occupied",
        value: stats.occupied,
        color: "var(--mantine-color-yellow-6)",
      },
      {
        label: "Maintenance",
        value: stats.maintenance,
        color: "var(--mantine-color-red-6)",
      },
    ],
    [stats],
  );

  const filteredData = useMemo(() => {
    return containers.filter((c) => {
      const matchesSearch =
        c.city_name.toLowerCase().includes(filters.searchValue.toLowerCase()) ||
        c.postal_code.includes(filters.searchValue);
      const matchesStatus =
        !filters.statusValue || c.status === filters.statusValue;
      return matchesSearch && matchesStatus && !c.is_deleted;
    });
  }, [containers, filters]);

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate(
      {
        city_name: formData.get("city") as string,
        postal_code: formData.get("zip") as string,
      },
      {
        onSuccess: () => closeCreate(),
      },
    );
  };

  const handleOpenDelete = (c: Container) => {
    setSelectedContainer(c);
    openDelete();
  };
  const handleCloseDelete = () => {
    setSelectedContainer(null);
    closeDelete();
  };

  return (
    <MantineContainer px="md" size="xl">
      <Group justify="space-between" mt="lg" mb="xl">
        <Title order={2}>Container Management</Title>
      </Group>

      <Grid mb="xl" align="stretch">
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="md" h="100%">
            <AdminCardInfo
              icon={IconBox}
              title="Total Inventory"
              value={stats.total}
              description="Units across all active regions"
            />
            <AdminCardInfo
              icon={IconPackage}
              title="Operational Rate"
              value={`${stats.ready + stats.occupied} / ${stats.total}`}
              description="Containers available for collection"
            />
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper px="md" radius="lg" shadow="sm" h="100%">
            <Title order={4} mb="lg">
              Inventory Distribution
            </Title>
            <BarChart
              h={300}
              data={chartData}
              dataKey="label"
              series={[{ name: "value", color: "green.6" }]}
              gridAxis="xy"
              barProps={{ radius: [8, 8, 0, 0] }}
              getBarColor={(value) => {
                const item = chartData.find((d) => d.value === value);
                return item ? item.color : "blue";
              }}
              tooltipProps={{
                cursor: { fill: "rgba(255, 255, 255, 0.05)" },
                content: ({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <Paper withBorder p="xs" radius="md" shadow="md">
                        <Text
                          size="xs"
                          fw={700}
                          tt="uppercase"
                          style={{ color: data.color }}
                        >
                          {data.label}
                        </Text>
                        <Text fw={700} size="sm">
                          {data.value} Containers
                        </Text>
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

      <Divider my="xl" label="Detailed Records" labelPosition="center" />

      <Stack gap="md">
        <Group>
          <TextInput
            placeholder="Search by city or zip..."
            rightSection={<IconSearch size={16} />}
            value={filters.searchValue}
            onChange={(e) =>
              setFilters({ ...filters, searchValue: e.target.value })
            }
            style={{ flex: 1 }}
          />
          <Select
            placeholder="Filter by Status"
            data={["ready", "occupied", "maintenance"]}
            value={filters.statusValue}
            onChange={(val) => setFilters({ ...filters, statusValue: val })}
            clearable
          />
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
          header={[
            "Created At",
            "ID",
            "Location",
            "Zip Code",
            "Status",
            "Actions",
          ]}
          footer={
            <PaginationFooter
              activePage={1}
              setPage={() => {}}
              total_records={filteredData.length}
              last_page={1}
              limit={filteredData.length}
              loading={isLoading}
            />
          }
        >
          {filteredData.map((c) => (
            <Table.Tr
              key={c.id}
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`${PATHS.ADMIN.CONTAINERS}/${c.id}`)}
            >
              <Table.Td ta="center">
                {dayjs(c.created_at).format("DD/MM/YYYY")}
              </Table.Td>
              <Table.Td ta="center">
                <strong>{c.id}</strong>
              </Table.Td>
              <Table.Td ta="center">{c.city_name}</Table.Td>
              <Table.Td ta="center">{c.postal_code}</Table.Td>
              <Table.Td ta="center">
                <Pill
                  style={{
                    backgroundColor:
                      c.status === "ready"
                        ? "#45a575"
                        : c.status === "occupied"
                          ? "var(--mantine-color-yellow-6)"
                          : "var(--mantine-color-red-6)",
                  }}
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
                      handleOpenDelete(c);
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

      {/* modals */}

      {/* create */}
      <Modal
        opened={openedCreate}
        onClose={closeCreate}
        title="Deploy New Container"
        centered
      >
        <form onSubmit={handleCreateSubmit}>
          <Stack>
            <TextInput
              label="City Name"
              name="city"
              required
              placeholder="e.g. Lyon"
            />
            <TextInput
              label="Postal Code"
              name="zip"
              required
              placeholder="e.g. 69000"
            />
            <Group justify="flex-end" mt="md">
              <Button variant="grey" onClick={closeCreate}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={createMutation.isPending}
              >
                Deploy
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* delete */}
      <Modal
        opened={openedDelete}
        onClose={handleCloseDelete}
        title="Confirm Archiving"
        centered
      >
        <Text size="sm" mb="lg">
          Are you sure you want to remove container{" "}
          <strong>#{selectedContainer?.id}</strong> (
          {selectedContainer?.city_name})? This will perform a soft delete.
        </Text>
        <Group justify="flex-end">
          <Button variant="grey" onClick={handleCloseDelete}>
            Cancel
          </Button>
          <Button
            variant="delete"
            loading={deleteMutation.isPending}
            onClick={() =>
              selectedContainer && handleDeleteContainer(selectedContainer.id)
            }
          >
            Confirm Delete
          </Button>
        </Group>
      </Modal>
    </MantineContainer>
  );
}
