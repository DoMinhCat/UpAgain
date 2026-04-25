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
  Modal,
  PasswordInput,
  Checkbox,
} from "@mantine/core";
import AdminTable from "../../../components/admin/AdminTable";
import {
  IconSearch,
  IconPlus,
  IconLock,
  IconRestore,
  IconDownload,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { type Account } from "../../../api/interfaces/account";
import { useState, useEffect } from "react";
import {
  useGetAllAccounts,
  useDeleteAccount,
  useCreateAccount,
  useUpdateAccount,
  useAccountDetails,
} from "../../../hooks/accountHooks";
import dayjs from "dayjs";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "react-i18next";

import { PATHS } from "../../../routes/paths";
import { useAuth } from "../../../context/AuthContext";
import PaginationFooter from "../../../components/common/PaginationFooter";
import { getExportAccountsCsv } from "../../../api/accountModule";
import { showErrorNotification } from "../../../components/common/NotificationToast";

const requirements = [
  { re: /[0-9]/, label: "requirement_number" },
  { re: /[A-Z]/, label: "requirement_uppercase" },
  { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: "requirement_special" },
];

export default function AdminUsersModule() {
  const { t } = useTranslation("admin");
  const { user } = useAuth();
  const [openedCreate, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);
  const [openedDelete, { open: openDelete, close: closeDelete }] =
    useDisclosure(false);
  const [openedEdit, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);
  // form
  const [usernameNew, setUsernameNew] = useState<string>("");
  const [emailNew, setEmailNew] = useState<string>("");
  const [passwordNew, setPasswordNew] = useState<string>("");
  const [confirmPasswordNew, setConfirmPasswordNew] = useState<string>("");
  const [roleNew, setRoleNew] = useState<string>("");
  const [phoneNew, setPhoneNew] = useState<string>("");
  const [isPremiumNew, setIsPremiumNew] = useState<boolean>(false);
  const [isTrialNew, setIsTrialNew] = useState<boolean>(false);
  // error states
  const [usernameNewError, setUsernameNewError] = useState<string | null>(null);
  const [emailNewError, setEmailNewError] = useState<string | null>(null);
  const [passwordNewError, setPasswordNewError] = useState<string | null>(null);
  const [confirmPasswordNewError, setConfirmPasswordNewError] = useState<
    string | null
  >(null);
  const [roleNewError, setRoleNewError] = useState<string | null>(null);
  const [phoneNewError, setPhoneNewError] = useState<string | null>(null);
  const [disablePhone, setDisablePhone] = useState<boolean>(false);
  const [disablePhoneEdit, setDisablePhoneEdit] = useState<boolean>(false);
  const [usernameEditError, setUsernameEditError] = useState<string | null>(
    null,
  );
  const [emailEditError, setEmailEditError] = useState<string | null>(null);
  const [phoneEditError, setPhoneEditError] = useState<string | null>(null);
  // validations
  const validateUsernameNew = (val: string) => {
    if (!val) {
      setUsernameNewError(t("users.errors.username_required"));
      return false;
    }
    if (val.length < 4) {
      setUsernameNewError(t("users.errors.username_min"));
      return false;
    }
    if (val.length > 20) {
      setUsernameNewError(t("users.errors.username_max"));
      return false;
    }
    setUsernameNewError(null);
    return true;
  };
  const validateUsernameEdit = (val: string) => {
    if (!val) {
      setUsernameEditError(t("users.errors.username_required"));
      return false;
    }
    if (val.length < 4) {
      setUsernameEditError(t("users.errors.username_min"));
      return false;
    }
    if (val.length > 20) {
      setUsernameEditError(t("users.errors.username_max"));
      return false;
    }
    setUsernameEditError(null);
    return true;
  };

  const validateEmailNew = (val: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!val) {
      setEmailNewError(t("users.errors.email_required"));
      return false;
    }
    if (!regex.test(val)) {
      setEmailNewError(t("users.errors.email_invalid"));
      return false;
    }
    setEmailNewError(null);
    return true;
  };
  const validateEmailEdit = (val: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!val) {
      setEmailEditError(t("users.errors.email_required"));
      return false;
    }
    if (!regex.test(val)) {
      setEmailEditError(t("users.errors.email_invalid"));
      return false;
    }
    setEmailEditError(null);
    return true;
  };

  const validatePasswordNew = (val: string) => {
    if (!val) {
      setPasswordNewError(t("users.errors.password_required"));
      return false;
    }
    if (val.length < 12) {
      setPasswordNewError(t("users.errors.password_min"));
      return false;
    }
    if (val.length > 60) {
      setPasswordNewError(t("users.errors.password_max"));
      return false;
    }
    if (!requirements.every((requirement) => requirement.re.test(val))) {
      setPasswordNewError(t("users.errors.password_complexity"));
      return false;
    }
    setPasswordNewError(null);
    return true;
  };

  const validateConfirmPasswordNew = (val: string) => {
    if (!val) {
      setConfirmPasswordNewError(t("users.errors.confirm_required"));
      return false;
    }
    if (val !== passwordNew) {
      setConfirmPasswordNewError(t("users.errors.confirm_mismatch"));
      return false;
    }
    setConfirmPasswordNewError(null);
    return true;
  };

  const validatePhoneNew = (val: string) => {
    if (val.length !== 0) {
      if (!val.match(/^[0-9]+$/)) {
        setPhoneNewError(t("users.errors.phone_numbers_only"));
        return false;
      }
      if (val.length < 10) {
        setPhoneNewError(t("users.errors.phone_min"));
        return false;
      }
      if (val.length > 15) {
        setPhoneNewError(t("users.errors.phone_max"));
        return false;
      }
      setPhoneNewError(null);
      return true;
    }
  };
  const validatePhoneEdit = (val: string) => {
    if (val.length !== 0) {
      if (!val.match(/^[0-9]+$/)) {
        setPhoneEditError(t("users.errors.phone_numbers_only"));
        return false;
      }
      if (val.length < 10) {
        setPhoneEditError(t("users.errors.phone_min"));
        return false;
      }
      if (val.length > 15) {
        setPhoneEditError(t("users.errors.phone_max"));
        return false;
      }
      setPhoneEditError(null);
      return true;
    }
  };

  const validateRoleNew = (val: string) => {
    if (!val) {
      setRoleNewError(t("users.errors.role_required"));
      return false;
    }
    setRoleNewError(null);
    return true;
  };

  // create hook
  const handleCloseCreate = () => {
    closeCreate();
    setUsernameNew("");
    setEmailNew("");
    setPasswordNew("");
    setConfirmPasswordNew("");
    setRoleNew("");
    setPhoneNew("");
    setIsPremiumNew(false);
    setIsTrialNew(false);
    setUsernameNewError(null);
    setEmailNewError(null);
    setPasswordNewError(null);
    setConfirmPasswordNewError(null);
    setRoleNewError(null);
    setPhoneNewError(null);
  };
  const createMutation = useCreateAccount();

  const handleCreateAccount = async (e: React.FormEvent) => {
    console.log(isPremiumNew, isTrialNew);
    e.preventDefault();
    if (
      !validateUsernameNew(usernameNew) ||
      !validateEmailNew(emailNew) ||
      !validatePasswordNew(passwordNew) ||
      !validateConfirmPasswordNew(confirmPasswordNew) ||
      !validateRoleNew(roleNew)
    )
      return;
    createMutation.mutate(
      {
        username: usernameNew,
        email: emailNew,
        password: passwordNew,
        role: roleNew,
        phone: phoneNew !== "" ? phoneNew : undefined,
        ...(roleNew === "pro" && {
          is_premium: isPremiumNew,
          is_trial: isTrialNew,
        }),
      },
      {
        onSuccess: (response: any) => {
          if (response?.status === 201) {
            closeCreate();
          }
        },
      },
    );
  };

  // handle delete account confirmation modals
  const [selectedDeleteAcc, setSelectedDeleteAcc] = useState<Account | null>(
    null,
  );
  const handleModalDelete = (account: Account) => {
    setSelectedDeleteAcc(account);
    openDelete();
  };

  const deleteMutation = useDeleteAccount();

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDeleteAcc?.id) {
      deleteMutation.mutate(selectedDeleteAcc.id, {
        onSuccess: (response: any) => {
          if (response?.status === 204) {
            closeDelete();
          }
        },
      });
    }
  };

  // handle edit account modals
  const [usernameEdit, setUsernameEdit] = useState<string>("");
  const [emailEdit, setEmailEdit] = useState<string>("");
  const [phoneEdit, setPhoneEdit] = useState<string>("");
  const editMutation = useUpdateAccount();
  const [selectedEditAcc, setSelectedEditAcc] = useState<Account | null>(null);
  const handleModalEdit = (account: Account) => {
    setSelectedEditAcc(account);
    openEdit();
  };

  const handleCloseEdit = () => {
    setUsernameEdit("");
    setEmailEdit("");
    setPhoneEdit("");
    setUsernameEditError(null);
    setEmailEditError(null);
    setPhoneEditError(null);
    setDisablePhoneEdit(false);
    setSelectedEditAcc(null);
    closeEdit();
  };

  const handleEditAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const userErr = validateUsernameEdit(usernameEdit);
    const emailErr = validateEmailEdit(emailEdit);
    const phoneErr = validatePhoneEdit(phoneEdit);
    if (!userErr || !emailErr || !phoneErr) {
      return;
    }
    if (selectedEditAcc?.id) {
      editMutation.mutate(
        {
          id_account: selectedEditAcc.id,
          username: usernameEdit,
          email: emailEdit,
          phone: phoneEdit,
        },
        {
          onSuccess: (response: any) => {
            if (response?.status === 204) {
              handleCloseEdit();
            }
          },
        },
      );
    }
  };

  // info for edit account in form triggered at each modal opening
  const selectedEditId = selectedEditAcc?.id ? selectedEditAcc.id : 0;
  const isValidId = !isNaN(selectedEditId) && selectedEditId > 0;
  const { data: accountDetails, isLoading: isAccountDetailsLoading } =
    useAccountDetails(selectedEditId, isValidId);

  useEffect(() => {
    if (accountDetails && openedEdit) {
      setUsernameEdit(accountDetails.username || "");
      setEmailEdit(accountDetails.email || "");
      setPhoneEdit(accountDetails.phone || "");
      const role = accountDetails.role || "";

      if (role === "admin" || role === "employee") {
        setDisablePhoneEdit(true);
      } else {
        setDisablePhoneEdit(false);
      }
    }
  }, [accountDetails, openedEdit]);
  // filters
  const navigate = useNavigate();
  const [filters, setFilters] = useState<{
    searchValue: string | undefined;
    sortValue: string | null;
    roleValue: string | null;
    statusValue: string | null;
  }>({ searchValue: "", sortValue: null, roleValue: null, statusValue: null });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [activePage, setPage] = useState(1);
  const LIMIT = 10;

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const hasFilters = Boolean(
    appliedFilters.searchValue ||
    appliedFilters.roleValue ||
    appliedFilters.statusValue ||
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
      statusValue: null,
    };
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setPage(1);
  };

  const {
    data: accountsWithPagination,
    isLoading: isAccountsLoading,
    error: accountsError,
  } = useGetAllAccounts(
    false,
    hasFilters ? -1 : activePage,
    hasFilters ? -1 : LIMIT,
    appliedFilters.searchValue,
    appliedFilters.roleValue || undefined,
    appliedFilters.statusValue || undefined,
    appliedFilters.sortValue || undefined,
  );
  const filteredAccounts = accountsWithPagination?.accounts || [];
  const listUsers =
    filteredAccounts.length > 0 ? (
      filteredAccounts.map((account) => (
        <Table.Tr
          style={{
            cursor: "pointer",
          }}
          key={account.id}
          onClick={() => {
            navigate(PATHS.ADMIN.USERS.ALL + "/" + account.id, {
              state: "allUsers",
            });
          }}
        >
          <Table.Td ta="center">
            {dayjs(account.created_at).format("DD/MM/YYYY - HH:mm")}
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
            {account.is_banned ? (
              <Pill variant="red">{t("users.status.banned")}</Pill>
            ) : (
              <Pill variant="green">{t("users.status.active")}</Pill>
            )}
          </Table.Td>
          <Table.Td ta="center">
            {account.last_active
              ? dayjs(account.last_active).format("DD/MM/YYYY - HH:mm")
              : "N/A"}
          </Table.Td>
          <Table.Td ta="center">
            <Group gap="xs" justify="center">
              <Button
                variant="edit"
                size="xs"
                disabled={account.role === "admin" && account.id !== user?.id}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  handleModalEdit(account);
                }}
              >
                {t("actions.update")}
              </Button>
              <Button
                disabled={account.role === "admin" && account.id !== user?.id}
                variant="delete"
                size="xs"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  handleModalDelete(account);
                }}
              >
                {t("actions.delete")}
              </Button>
            </Group>
          </Table.Td>
        </Table.Tr>
      ))
    ) : (
      <Table.Tr>
        <Table.Td colSpan={8} ta="center">
          {t("users.table.no_users")}
        </Table.Td>
      </Table.Tr>
    );

  // EXPORT CSV
  const [isExporting, setIsExporting] = useState(false);
  const exportAccounts = async () => {
    try {
      setIsExporting(true);
      const blob = await getExportAccountsCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "UpAgain_accounts.csv";
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.log(error);
      showErrorNotification(
        t("users.errors.export_failed"),
        t("users.errors.export_error"),
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Container px="md" size="xl">
      <Title order={2} mt="lg" mb="xl">
        {t("users.title")}
      </Title>

      <Stack gap="md" mb="xl">
        <Group justify="space-between" align="flex-end">
          <Title c="dimmed" order={3}>
            {t("users.subtitle")}
          </Title>

          <Group gap="xs" align="flex-end">
            <Button
              variant="secondary"
              leftSection={<IconDownload size={16} />}
              onClick={exportAccounts}
              loading={isExporting}
            >
              {t("users.export_csv")}
            </Button>
            <Button
              variant="edit"
              leftSection={<IconRestore size={16} />}
              onClick={() => {
                navigate(PATHS.ADMIN.USERS.DELETED);
              }}
            >
              {t("users.recover_accounts")}
            </Button>
            <Button
              variant="primary"
              leftSection={<IconPlus size={16} />}
              onClick={openCreate}
            >
              {t("users.new_account")}
            </Button>
          </Group>
        </Group>

        <Grid align="flex-end">
          <Grid.Col span={{ base: 12, md: 3 }}>
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
                { value: "oldest_registration", label: t("users.sort.oldest_reg") },
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
              clearable
              onChange={(val) => handleFilterChange("sortValue", val)}
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

          <Grid.Col span={{ base: 12, sm: 4, md: 2 }}>
            <Select
              label={t("users.table.status")}
              placeholder={t("users.status.all")}
              data={[
                { value: "active", label: t("users.status.active") },
                { value: "banned", label: t("users.status.banned") },
              ]}
              value={filters.statusValue}
              onChange={(val) => handleFilterChange("statusValue", val)}
              clearable
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 12, md: 3 }}>
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
        loading={isAccountsLoading}
        error={accountsError}
        header={[
          t("users.table.registered_on"),
          t("users.table.id"),
          t("users.table.username"),
          t("users.table.email"),
          t("users.table.role"),
          t("users.table.status"),
          t("users.table.last_active"),
          t("users.table.actions"),
        ]}
        footer={
          <PaginationFooter
            activePage={activePage}
            setPage={setPage}
            total_records={accountsWithPagination?.total_records || 0}
            last_page={accountsWithPagination?.last_page || 1}
            limit={LIMIT}
            loading={isAccountsLoading}
            hidden={hasFilters}
          />
        }
      >
        {listUsers}
      </AdminTable>
      <Modal
        title={t("users.delete_modal.title")}
        opened={openedDelete}
        onClose={closeDelete}
      >
        {t("users.delete_modal.text")}
        <Group mt="lg" justify="flex-end">
          <Button onClick={closeDelete} variant="grey">
            {t("users.delete_modal.cancel")}
          </Button>
          <Button
            onClick={(e) => {
              handleDeleteAccount(e);
            }}
            variant="delete"
            loading={deleteMutation.isPending}
          >
            {t("users.delete_modal.confirm")}
          </Button>
        </Group>
      </Modal>
      <Modal
        opened={openedCreate}
        onClose={handleCloseCreate}
        title={t("users.create_modal.title")}
      >
        <Stack>
          <TextInput
            data-autofocus
            withAsterisk
            label={t("users.create_modal.username")}
            placeholder={t("users.create_modal.username")}
            onChange={(e) => {
              setUsernameNew(e.target.value);
              validateUsernameNew(e.target.value);
            }}
            onBlur={() => validateUsernameNew(usernameNew)}
            error={usernameNewError}
            required
          />
          <TextInput
            withAsterisk
            label={t("users.create_modal.email")}
            placeholder={t("users.create_modal.email")}
            onChange={(e) => {
              setEmailNew(e.target.value);
              validateEmailNew(e.target.value);
            }}
            onBlur={() => validateEmailNew(emailNew)}
            error={emailNewError}
            required
          />
          <PasswordInput
            withAsterisk
            leftSection={<IconLock size={14} />}
            label={t("users.create_modal.password")}
            placeholder={t("users.create_modal.password")}
            onChange={(e) => {
              setPasswordNew(e.target.value);
              validatePasswordNew(e.target.value);
            }}
            onBlur={() => validatePasswordNew(passwordNew)}
            error={passwordNewError}
            required
          />
          <PasswordInput
            withAsterisk
            leftSection={<IconLock size={14} />}
            label={t("users.create_modal.confirm_password")}
            placeholder={t("users.create_modal.confirm_password")}
            onChange={(e) => {
              setConfirmPasswordNew(e.target.value);
              validateConfirmPasswordNew(e.target.value);
            }}
            onBlur={() => validateConfirmPasswordNew(confirmPasswordNew)}
            error={confirmPasswordNewError}
            required
          />
          <TextInput
            label={t("users.create_modal.phone")}
            placeholder={t("users.create_modal.phone")}
            onChange={(e) => {
              setPhoneNew(e.target.value);
              validatePhoneNew(e.target.value);
            }}
            onBlur={() => validatePhoneNew(phoneNew)}
            error={phoneNewError}
            disabled={disablePhone}
          />
          <Select
            withAsterisk
            clearable
            label={t("users.create_modal.role")}
            error={roleNewError}
            onBlur={() => validateRoleNew(roleNew)}
            placeholder={t("users.create_modal.role")}
            data={[
              { value: "user", label: t("users.roles.user") },
              { value: "pro", label: t("users.roles.pro") },
              { value: "employee", label: t("users.roles.employee") },
              { value: "admin", label: t("users.roles.admin") },
            ]}
            onChange={(value) => {
              setRoleNew(value as string);
              if (value === "admin" || value === "employee") {
                setPhoneNew("");
                setPhoneNewError(null);
                setDisablePhone(true);
              } else {
                setDisablePhone(false);
              }
            }}
          />
          {roleNew === "pro" && (
            <Group>
              <Checkbox
                color="var(--upagain-neutral-green)"
                label="Premium"
                checked={isPremiumNew}
                onChange={(event) => {
                  const isChecked = event.currentTarget.checked;

                  // Always update the premium status
                  setIsPremiumNew(isChecked);

                  // If it was just unchecked, turn off the trial as well
                  if (!isChecked) {
                    setIsTrialNew(false);
                  }
                }}
              />
              <Checkbox
                color="var(--upagain-neutral-green)"
                label="Trial"
                checked={isTrialNew}
                disabled={!isPremiumNew}
                onChange={(event) => setIsTrialNew(event.currentTarget.checked)}
              />
            </Group>
          )}
          <Button
            variant="primary"
            onClick={handleCreateAccount}
            loading={createMutation.isPending}
          >
            Create Account
          </Button>
        </Stack>
      </Modal>
      <Modal
        title="Edit account"
        opened={openedEdit}
        onClose={handleCloseEdit}
        centered
      >
        <Stack>
          <TextInput
            data-autofocus
            withAsterisk
            label="Username"
            placeholder="Username"
            value={usernameEdit}
            onChange={(e) => {
              setUsernameEdit(e.target.value);
              validateUsernameEdit(e.target.value);
            }}
            onBlur={() => validateUsernameEdit(usernameEdit)}
            error={usernameEditError}
            disabled={isAccountDetailsLoading}
            required
          />
          <TextInput
            withAsterisk
            label="Email"
            placeholder="Email"
            value={emailEdit}
            onChange={(e) => {
              setEmailEdit(e.target.value);
              validateEmailEdit(e.target.value);
            }}
            onBlur={() => validateEmailEdit(emailEdit)}
            error={emailEditError}
            disabled={isAccountDetailsLoading}
            required
          />
          <TextInput
            label="Phone"
            placeholder="Phone"
            value={phoneEdit}
            onChange={(e) => {
              setPhoneEdit(e.target.value);
              validatePhoneEdit(e.target.value);
            }}
            onBlur={() => validatePhoneEdit(phoneEdit)}
            error={phoneEditError}
            disabled={disablePhoneEdit || isAccountDetailsLoading}
          />
        </Stack>
        <Group mt="lg" justify="center">
          <Button onClick={handleCloseEdit} variant="grey">
            Cancel
          </Button>
          <Button
            onClick={(e) => {
              handleEditAccount(e);
            }}
            variant="primary"
            loading={editMutation.isPending}
            disabled={editMutation.isPending || isAccountDetailsLoading}
          >
            Confirm
          </Button>
        </Group>
      </Modal>
    </Container>
  );
}
