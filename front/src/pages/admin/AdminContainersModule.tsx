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
} from "@mantine/core";
import { 
  IconBox, 
  IconPackage, 
  IconPlus, 
  IconSearch,
} from "@tabler/icons-react";
import { AdminCardInfo } from "../../components/admin/AdminCardInfo";
import AdminTable from "../../components/admin/AdminTable";
import { useQuery } from "@tanstack/react-query";
import { getAllContainers, type Container } from "../../api/admin/containerModule";
import { useState, useMemo } from "react";
import dayjs from "dayjs";
import { useDisclosure } from "@mantine/hooks";
import { BarChart } from '@mantine/charts';

export default function AdminContainersModule() {
  const [openedCreate, { open: openCreate }] = useDisclosure(false);
  const [filters, setFilters] = useState({ searchValue: "", statusValue: null as string | null });

  const { data: containers = [], isLoading } = useQuery<Container[]>({
    queryKey: ["containers"],
    queryFn: getAllContainers,
    staleTime: 1000 * 60 * 5, 
  });

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
              description={`${((stats.ready + stats.full) / stats.total * 100).toFixed(0)}% capacity used`}
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
              getBarColor={(value, series) => {
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
          <Button leftSection={<IconPlus size={16} />} variant="primary">
            Add New Container
          </Button>
        </Group>

        <AdminTable 
          loading={isLoading}
          header={["Created At", "ID", "Location", "Zip Code", "Status", "Actions"]}
        >
          {filteredData.map((c) => (
            <Table.Tr key={c.id}>
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
                    <Button variant="edit" size="xs">Edit</Button>
                    <Button variant="delete" size="xs">Delete</Button>
                 </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </AdminTable>
      </Stack>
    </MantineContainer>
  );
}