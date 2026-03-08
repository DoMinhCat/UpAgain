import {
  Container as MantineContainer,
  Title,
  SimpleGrid,
  Divider,
  Table,
  Button,
  Group,
  Stack,
  TextInput,
  Select,
} from "@mantine/core";
import { 
  IconBox, 
  IconAlertTriangle, 
  IconCheck, 
  IconPlus, 
  IconSearch,
  IconBuildingWarehouse 
} from "@tabler/icons-react";
import { AdminCardInfo } from "../../components/admin/AdminCardInfo";
import AdminTable from "../../components/admin/AdminTable";
import { useQuery } from "@tanstack/react-query";
import { getAllContainers, type Container } from "../../api/admin/containerModule";
import { useState, useMemo } from "react";
import dayjs from "dayjs";
import { useDisclosure } from "@mantine/hooks";

export default function AdminContainersModule() {
  const [openedCreate, { open: openCreate }] = useDisclosure(false);
  const [filters, setFilters] = useState({ searchValue: "", statusValue: null as string | null });

  const { data: containers = [], isLoading } = useQuery<Container[]>({
    queryKey: ["containers"],
    queryFn: getAllContainers,
    staleTime: 1000 * 60 * 5, 
  });

  const stats = useMemo(() => {
    return {
      total: containers.length,
      ready: containers.filter(c => c.status === 'ready').length,
      full: containers.filter(c => c.status === 'full').length,
      maintenance: containers.filter(c => c.status === 'maintenance').length,
    };
  }, [containers]);

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

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg" mb="xl">
        <AdminCardInfo
          icon={IconBox}
          title="Total Containers"
          value={stats.total}
          description="Across all European sites"
        />
        <AdminCardInfo
          icon={IconCheck}
          title="Ready for Deposit"
          value={stats.ready}
        />
        <AdminCardInfo
          icon={IconBuildingWarehouse}
          title="Full / To Collect"
          value={stats.full}
        />
        <AdminCardInfo
          icon={IconAlertTriangle}
          title="In Maintenance"
          value={stats.maintenance}
        />
      </SimpleGrid>

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
          <Button leftSection={<IconPlus size={16} />} onClick={openCreate} variant="primary">
            Add New Container
          </Button>
        </Group>

        <AdminTable 
          loading={isLoading}
          header={["Created At", "ID", "Location", "Zip Code", "Status", "Actions"]}
        >
          {filteredData.map((c) => (
            <Table.Tr key={c.id}>
              <Table.Td>{dayjs(c.created_at).format("DD/MM/YYYY")}</Table.Td>
              <Table.Td><strong>{c.id}</strong></Table.Td>
              <Table.Td>{c.city_name}</Table.Td>
              <Table.Td>{c.postal_code}</Table.Td>
              <Table.Td>{c.status.toUpperCase()}</Table.Td>
              <Table.Td>
                <Button variant="subtle" size="xs">Manage</Button>
              </Table.Td>
            </Table.Tr>
          ))}
        </AdminTable>
      </Stack>
    </MantineContainer>
  );
}