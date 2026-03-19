import { PATHS } from "../../../routes/paths";
import AdminBreadcrumbs from "../../../components/admin/AdminBreadcrumbs";
import {
  Container,
  Stack,
  Title,
  Group,
  Grid,
  TextInput,
  Select,
  Button,
  Table,
  Pill,
  Modal,
  Pagination,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useState } from "react";
import dayjs from "dayjs";
import AdminTable from "../../../components/admin/AdminTable";
import { useNavigate } from "react-router-dom";
import { useDisclosure } from "@mantine/hooks";
import {
  useRecoverAccount,
  useGetAllAccounts,
} from "../../../hooks/accountHooks";

export default function AdminUsersDeleted() {
  // hooks
  const { mutate: recover, isPending: isPendingRecover } = useRecoverAccount();
  const handleRecover = () => {
    if (selectedAccountId) {
      recover(selectedAccountId, {
        onSuccess: (response: any) => {
          if (response?.status === 204) {
            closeRecover();
          }
        },
      });
    }
  };

  const navigate = useNavigate();
  const [filters, setFilters] = useState<{
    searchValue: string | undefined;
    sortValue: string | null;
    roleValue: string | null;
  }>({ searchValue: "", sortValue: null, roleValue: null });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [activePage, setPage] = useState(1);
  const LIMIT = 10;

  const hasFilters = Boolean(
    appliedFilters.searchValue ||
    appliedFilters.roleValue ||
    appliedFilters.sortValue,
  );

  const handleSearchClick = () => {
    setAppliedFilters(filters);
    setPage(1);
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      searchValue: "",
      sortValue: null,
      roleValue: null,
    };
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setPage(1);
  };

  const [openedRecover, { open: openRecover, close: closeRecover }] =
    useDisclosure(false);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
    null,
  );

  const handleModalRecover = (id: number | null) => {
    if (!id) return;
    setSelectedAccountId(id);
    openRecover();
  };

  // get all deleted accounts
  const { data: accountsWithPagination, isLoading: isDeletedAccountsLoading } =
    useGetAllAccounts(
      true,
      hasFilters ? -1 : activePage,
      hasFilters ? -1 : LIMIT,
      appliedFilters.searchValue,
      appliedFilters.roleValue || undefined,
      undefined,
      appliedFilters.sortValue || undefined,
    );

  const filteredAccounts = accountsWithPagination?.accounts || [];

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const listDeletedUsers =
    filteredAccounts.length > 0 ? (
      filteredAccounts.map((account) => (
        <Table.Tr
          style={{
            cursor: "pointer",
          }}
          key={account.id}
          onClick={() => {
            navigate(PATHS.ADMIN.USERS.ALL + "/" + account.id, {
              state: "deletedList",
            });
          }}
        >
          <Table.Td ta="center">
            {dayjs(account.created_at).format("DD/MM/YYYY - HH:mm")}
          </Table.Td>
          <Table.Td ta="center">
            {dayjs(account.deleted_at).format("DD/MM/YYYY - HH:mm")}
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
            <Button
              variant="primary"
              me="sm"
              size="xs"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                handleModalRecover(account.id);
              }}
            >
              Recover
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
      <Title order={2} mt="xs" mb="sm">
        Deleted Accounts
      </Title>
      <AdminBreadcrumbs
        breadcrumbs={[
          { title: "User Management", href: PATHS.ADMIN.USERS.ALL },
          { title: "Deleted Accounts", href: "#" },
        ]}
      />
      <Stack gap="md" mb="xl">
        <Group justify="space-between" align="flex-end">
          <Title c="dimmed" order={3}>
            Recover soft-deleted accounts
          </Title>
        </Group>

        <Grid align="flex-end">
          <Grid.Col span={{ base: 12, md: 5 }}>
            <TextInput
              label="Search"
              variant="filled"
              placeholder="Search by username, email or ID..."
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
              clearable
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

          <Grid.Col span={{ base: 6, sm: 4, md: 3 }}>
            <Group gap="xs" grow>
              <Button onClick={handleSearchClick} variant="primary">
                Apply filters
              </Button>
              <Button variant="secondary" onClick={handleResetFilters}>
                Reset
              </Button>
            </Group>
          </Grid.Col>
        </Grid>
      </Stack>
      <AdminTable
        loading={isDeletedAccountsLoading}
        header={[
          "Registered on",
          "Deleted at",
          "ID",
          "Username",
          "Email",
          "Role",
          "Actions",
        ]}
        footer={
          !hasFilters &&
          accountsWithPagination &&
          accountsWithPagination.total_records > 0 && (
            <Group justify="space-between" mt="md">
              <span style={{ fontSize: "14px", color: "gray" }}>
                Showing {(activePage - 1) * LIMIT + 1}-
                {Math.min(
                  activePage * LIMIT,
                  accountsWithPagination.total_records,
                )}{" "}
                of {accountsWithPagination.total_records} results
              </span>
              <Pagination
                total={accountsWithPagination.last_page || 1}
                value={activePage}
                onChange={setPage}
                disabled={isDeletedAccountsLoading}
              />
            </Group>
          )
        }
      >
        {listDeletedUsers}
      </AdminTable>

      <Modal
        opened={openedRecover}
        onClose={closeRecover}
        title="Recover account"
      >
        Are you sure you want to recover this account? This account will regain
        access.
        <Group mt="lg" justify="flex-end">
          <Button onClick={closeRecover} variant="grey">
            Cancel
          </Button>
          <Button
            onClick={handleRecover}
            variant="primary"
            loading={isPendingRecover}
          >
            Recover account
          </Button>
        </Group>
      </Modal>
    </Container>
  );
}
