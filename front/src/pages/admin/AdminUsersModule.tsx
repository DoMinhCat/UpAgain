import {
  Container,
  Grid,
  Title,
  Table,
  Button,
  TextInput,
  Select,
  Stack,
  Pill,
  Group,
  Text,
} from "@mantine/core";
import AdminTable from "../../components/admin/AdminTable";
import { IconSearch, IconChevronDown, IconPlus } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { getAllAccounts, type Account } from "../../api/admin/userModule";
import { showNotification } from "@mantine/notifications";
import dayjs from "dayjs";

export default function AdminUsersModule() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filters, setFilters] = useState<{
    searchValue: string | undefined;
    sortValue: string | null;
    roleValue: string | null;
    statusValue: string | null;
  }>({ searchValue: "", sortValue: null, roleValue: null, statusValue: null });
  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const [accounts, setAccounts] = useState<Account[]>([]);
  useEffect(() => {
    const fetchAccounts = async () => {
      setIsLoading(true);
      try {
        const response = await getAllAccounts();
        setAccounts(response);
      } catch (error) {
        showNotification({
          title: "Error",
          message: "Failed to fetch accounts",
          color: "red",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccounts();
  }, []);
  const filteredAccounts = useMemo(() => {
    const result = accounts.filter((account) => {
      const matchesSearch =
        account.username
          .toLowerCase()
          .includes(filters.searchValue?.toLowerCase() || "") ||
        account.email
          .toLowerCase()
          .includes(filters.searchValue?.toLowerCase() || "");
      const matchesRole =
        !filters.roleValue || account.role === filters.roleValue;
      const matchesStatus =
        !filters.statusValue ||
        account.is_banned === (filters.statusValue === "banned");
      return matchesSearch && matchesRole && matchesStatus;
    });
    // TODO
    return [...result].sort((a, b) => {
      if (filters.sortValue === "most_recent_registration") {
        return dayjs(b.created_at).diff(dayjs(a.created_at));
      } else if (filters.sortValue === "oldest_registration") {
        return dayjs(a.created_at).diff(dayjs(b.created_at));
      } else if (filters.sortValue === "most_recent_last_active") {
        return dayjs(b.last_active).diff(dayjs(a.last_active));
      } else if (filters.sortValue === "oldest_last_active") {
        return dayjs(a.last_active).diff(dayjs(b.last_active));
      }
      return 0;
    });
  }, [
    accounts,
    filters.searchValue,
    filters.roleValue,
    filters.statusValue,
    filters.sortValue,
  ]);
  const listUsers =
    filteredAccounts.length > 0 ? (
      filteredAccounts.map((account) => (
        <Table.Tr key={account.id}>
          <Table.Td ta="center">
            {dayjs(account.created_at).format("DD/MM/YYYY - HH:mm")}
          </Table.Td>
          <Table.Td ta="center">{account.id}</Table.Td>
          <Table.Td ta="center">{account.username}</Table.Td>
          <Table.Td ta="center">{account.email}</Table.Td>
          <Table.Td ta="center">
            {account.role === "user" ? (
              <Pill variant="blue">User</Pill>
            ) : account.role === "pro" ? (
              <Pill variant="yellow">Pro</Pill>
            ) : account.role === "employee" ? (
              <Pill variant="green">Employee</Pill>
            ) : (
              <Pill variant="red">Admin</Pill>
            )}
          </Table.Td>
          <Table.Td ta="center">
            {account.is_banned ? (
              <Pill variant="red">Banned</Pill>
            ) : (
              <Pill variant="green">Active</Pill>
            )}
          </Table.Td>
          <Table.Td ta="center">
            {dayjs(account.last_active).format("DD/MM/YYYY - HH:mm")}
          </Table.Td>
          <Table.Td ta="center">
            <Button variant="edit" me="sm" size="xs">
              Edit
            </Button>
            <Button variant="delete" size="xs">
              Delete
            </Button>
          </Table.Td>
        </Table.Tr>
      ))
    ) : (
      <Table.Tr>
        <Table.Td colSpan={8} ta="center">
          No users found
        </Table.Td>
      </Table.Tr>
    );

  return (
    <Container px="md" size="xl">
      <Title order={2} mt="lg" mb="xl">
        User Management
      </Title>

      <Stack gap="md" mb="xl">
        {/* Row 1: Header & Main Actions */}
        <Group justify="space-between" align="flex-end">
          <div>
            <Title c="dimmed" order={3}>
              Manage users and their permissions
            </Title>
          </div>

          <Button variant="primary" leftSection={<IconPlus size={16} />}>
            New Account
          </Button>
        </Group>

        <Grid align="flex-end">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <TextInput
              label="Search"
              variant="filled"
              placeholder="Name or email..."
              rightSection={<IconSearch size={14} />}
              value={filters.searchValue}
              onChange={(e) =>
                handleFilterChange("searchValue", e.target.value)
              }
            />
          </Grid.Col>

          <Grid.Col span={{ base: 6, sm: 4, md: 2 }}>
            <Select
              label="Sort by"
              placeholder="Pick one"
              data={[
                {
                  value: "most_recent_registration",
                  label: "Most recent registration",
                },
                { value: "oldest_registration", label: "Oldest registration" },
                {
                  value: "most_recent_last_active",
                  label: "Most recent last active",
                },
                {
                  value: "oldest_last_active",
                  label: "Oldest last active",
                },
              ]}
              value={filters.sortValue}
              onChange={(val) => handleFilterChange("sortValue", val)}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 6, sm: 4, md: 2 }}>
            <Select
              label="Role"
              placeholder="All roles"
              data={[
                { value: "user", label: "User" },
                { value: "pro", label: "Pro" },
                { value: "employee", label: "Employee" },
                { value: "admin", label: "Admin" },
              ]}
              value={filters.roleValue}
              onChange={(val) => handleFilterChange("roleValue", val)}
              clearable
            />
          </Grid.Col>

          <Grid.Col span={{ base: 6, sm: 4, md: 2 }}>
            <Select
              label="Status"
              placeholder="All status"
              data={[
                { value: "active", label: "Active" },
                { value: "banned", label: "Banned" },
              ]}
              value={filters.statusValue}
              onChange={(val) => handleFilterChange("statusValue", val)}
              clearable
            />
          </Grid.Col>

          <Grid.Col span={{ base: 6, sm: 4, md: 2 }}>
            <Button
              variant="secondary"
              fullWidth
              onClick={() =>
                setFilters({
                  searchValue: "",
                  roleValue: null,
                  statusValue: null,
                  sortValue: null,
                })
              }
            >
              Reset filters
            </Button>
          </Grid.Col>
        </Grid>
      </Stack>
      <AdminTable
        loading={isLoading}
        header={[
          "Registered on",
          "ID",
          "Username",
          "Email",
          "Role",
          "Status",
          "Last Active",
          "Actions",
        ]}
      >
        {listUsers}
      </AdminTable>
    </Container>
  );
}
