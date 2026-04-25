import { PATHS } from "../../../routes/paths";
import MyBreadcrumbs from "../../../components/nav/MyBreadcrumbs";
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
} from "@mantine/core";
import { useTranslation } from "react-i18next";
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
import PaginationFooter from "../../../components/common/PaginationFooter";

export default function AdminUsersDeleted() {
  const { t } = useTranslation("admin");
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
              <Pill variant="blue">{t("users.roles.user")}</Pill>
            ) : account.role === "pro" ? (
              <Pill variant="yellow">{t("users.roles.pro")}</Pill>
            ) : account.role === "employee" ? (
              <Pill variant="green">{t("users.roles.employee")}</Pill>
            ) : (
              <Pill variant="red">{t("users.roles.admin")}</Pill>
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
              {t("users.details.actions.recover")}
            </Button>
          </Table.Td>
        </Table.Tr>
      ))
    ) : (
      <Table.Tr>
        <Table.Td colSpan={8} ta="center">
          {t("users.deleted.table.no_users")}
        </Table.Td>
      </Table.Tr>
    );

  return (
    <Container px="md" size="xl">
      <Title order={2} mt="xs" mb="sm">
        {t("users.deleted.title")}
      </Title>
      <MyBreadcrumbs
        breadcrumbs={[
          { title: t("users.title"), href: PATHS.ADMIN.USERS.ALL },
          { title: t("users.deleted.title"), href: "#" },
        ]}
      />
      <Stack gap="md" mb="xl">
        <Group justify="space-between" align="flex-end">
          <Title c="dimmed" order={3}>
            {t("users.deleted.subtitle")}
          </Title>
        </Group>

        <Grid align="flex-end">
          <Grid.Col span={{ base: 12, md: 5 }}>
            <TextInput
              label={t("history.filters.search")}
              placeholder={t("users.search_placeholder")}
              rightSection={<IconSearch size={14} />}
              value={filters.searchValue}
              onChange={(e) =>
                handleFilterChange("searchValue", e.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSearchClick();
                }
              }}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 6, sm: 4, md: 2 }}>
            <Select
              label={t("history.filters.sort")}
              placeholder={t("history.filters.sort_placeholder")}
              data={[
                {
                  value: "most_recent_registration",
                  label: t("users.sort.recent_reg"),
                },
                {
                  value: "oldest_registration",
                  label: t("users.sort.oldest_reg"),
                },
                {
                  value: "most_recent_last_active",
                  label: t("users.sort.recent_active"),
                },
                {
                  value: "oldest_last_active",
                  label: t("users.sort.oldest_active"),
                },
              ]}
              value={filters.sortValue}
              onChange={(val) => handleFilterChange("sortValue", val)}
              clearable
            />
          </Grid.Col>

          <Grid.Col span={{ base: 6, sm: 4, md: 2 }}>
            <Select
              label={t("users.table.role")}
              placeholder={t("users.roles.all")}
              data={[
                { value: "user", label: t("users.roles.user") },
                { value: "pro", label: t("users.roles.pro") },
                { value: "employee", label: t("users.roles.employee") },
                { value: "admin", label: t("users.roles.admin") },
              ]}
              value={filters.roleValue}
              onChange={(val) => handleFilterChange("roleValue", val)}
              clearable
            />
          </Grid.Col>

          <Grid.Col span={{ base: 6, sm: 4, md: 3 }}>
            <Group gap="xs" grow>
              <Button onClick={handleSearchClick} variant="primary">
                {t("history.filters.apply")}
              </Button>
              <Button variant="secondary" onClick={handleResetFilters}>
                {t("history.filters.reset")}
              </Button>
            </Group>
          </Grid.Col>
        </Grid>
      </Stack>
      <AdminTable
        loading={isDeletedAccountsLoading}
        header={[
          t("users.details.fields.registered_on"),
          t("users.deleted.table.deleted_at"),
          "ID",
          t("users.details.fields.username"),
          t("users.details.fields.email"),
          t("users.details.fields.role"),
          t("users.table.actions"),
        ]}
        footer={
          <PaginationFooter
            activePage={activePage}
            setPage={setPage}
            total_records={accountsWithPagination?.total_records || 0}
            last_page={accountsWithPagination?.last_page || 1}
            limit={LIMIT}
            loading={isDeletedAccountsLoading}
            hidden={hasFilters}
          />
        }
      >
        {listDeletedUsers}
      </AdminTable>

      <Modal
        opened={openedRecover}
        onClose={closeRecover}
        title={t("users.details.modals.recover_title")}
      >
        {t("users.details.modals.recover_text")}
        <Group mt="lg" justify="flex-end">
          <Button onClick={closeRecover} variant="grey">
            {t("common:actions.cancel")}
          </Button>
          <Button
            onClick={handleRecover}
            variant="primary"
            loading={isPendingRecover}
          >
            {t("users.details.actions.recover")}
          </Button>
        </Group>
      </Modal>
    </Container>
  );
}
