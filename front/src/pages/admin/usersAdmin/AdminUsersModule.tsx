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
} from "@mantine/core";
import AdminTable from "../../../components/admin/AdminTable";
import {
  IconSearch,
  IconPlus,
  IconLock,
  IconRestore,
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

import { PATHS } from "../../../routes/paths";
import { useAuth } from "../../../context/AuthContext";
import PaginationFooter from "../../../components/PaginationFooter";

const requirements = [
  { re: /[0-9]/, label: "Includes number" },
  { re: /[A-Z]/, label: "Includes uppercase letter" },
  { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: "Includes special character" },
];

export default function AdminUsersModule() {
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
      setUsernameNewError("Username is required");
      return false;
    }
    if (val.length < 4) {
      setUsernameNewError("Username must be at least 4 characters long");
      return false;
    }
    if (val.length > 20) {
      setUsernameNewError("Username must be at most 20 characters long");
      return false;
    }
    setUsernameNewError(null);
    return true;
  };
  const validateUsernameEdit = (val: string) => {
    if (!val) {
      setUsernameEditError("Username is required");
      return false;
    }
    if (val.length < 4) {
      setUsernameEditError("Username must be at least 4 characters long");
      return false;
    }
    if (val.length > 20) {
      setUsernameEditError("Username must be at most 20 characters long");
      return false;
    }
    setUsernameEditError(null);
    return true;
  };

  const validateEmailNew = (val: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!val) {
      setEmailNewError("Email is required");
      return false;
    }
    if (!regex.test(val)) {
      setEmailNewError("Invalid email format");
      return false;
    }
    setEmailNewError(null);
    return true;
  };
  const validateEmailEdit = (val: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!val) {
      setEmailEditError("Email is required");
      return false;
    }
    if (!regex.test(val)) {
      setEmailEditError("Invalid email format");
      return false;
    }
    setEmailEditError(null);
    return true;
  };

  const validatePasswordNew = (val: string) => {
    if (!val) {
      setPasswordNewError("Password is required");
      return false;
    }
    if (val.length < 12) {
      setPasswordNewError("Password must be at least 12 characters long");
      return false;
    }
    if (val.length > 60) {
      setPasswordNewError("Password must be at most 60 characters long");
      return false;
    }
    if (!requirements.every((requirement) => requirement.re.test(val))) {
      setPasswordNewError(
        "Password must contain at least one number, one uppercase letter, and one special character",
      );
      return false;
    }
    setPasswordNewError(null);
    return true;
  };

  const validateConfirmPasswordNew = (val: string) => {
    if (!val) {
      setConfirmPasswordNewError("Confirm password is required");
      return false;
    }
    if (val !== passwordNew) {
      setConfirmPasswordNewError("Passwords do not match");
      return false;
    }
    setConfirmPasswordNewError(null);
    return true;
  };

  const validatePhoneNew = (val: string) => {
    if (val.length !== 0) {
      if (!val.match(/^[0-9]+$/)) {
        setPhoneNewError("Phone number must contain only numbers");
        return false;
      }
      if (val.length < 10) {
        setPhoneNewError("Phone must be at least 10 characters long");
        return false;
      }
      if (val.length > 15) {
        setPhoneNewError("Phone must be at most 15 characters long");
        return false;
      }
      setPhoneNewError(null);
      return true;
    }
  };
  const validatePhoneEdit = (val: string) => {
    if (val.length !== 0) {
      if (!val.match(/^[0-9]+$/)) {
        setPhoneEditError("Phone number must contain only numbers");
        return false;
      }
      if (val.length < 10) {
        setPhoneEditError("Phone must be at least 10 characters long");
        return false;
      }
      if (val.length > 15) {
        setPhoneEditError("Phone must be at most 15 characters long");
        return false;
      }
      setPhoneEditError(null);
      return true;
    }
  };

  const validateRoleNew = (val: string) => {
    if (!val) {
      setRoleNewError("Role is required");
      return false;
    }
    setRoleNewError(null);
    return true;
  };

  // create hook
  const createMutation = useCreateAccount();

  const handleCreateAccount = async (e: React.FormEvent) => {
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
  let selectedEditId = selectedEditAcc?.id ? selectedEditAcc.id : 0;
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
                Edit
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
                Delete
              </Button>
            </Group>
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
        <Group justify="space-between" align="flex-end">
          <Title c="dimmed" order={3}>
            Manage users and their permissions
          </Title>

          <Group gap="xs" align="flex-end">
            <Button
              variant="edit"
              leftSection={<IconRestore size={16} />}
              onClick={() => {
                navigate(PATHS.ADMIN.USERS.DELETED);
              }}
            >
              Recover Accounts
            </Button>
            <Button
              variant="primary"
              leftSection={<IconPlus size={16} />}
              onClick={openCreate}
            >
              New Account
            </Button>
          </Group>
        </Group>

        <Grid align="flex-end">
          <Grid.Col span={{ base: 12, md: 3 }}>
            <TextInput
              label="Search"
              variant="filled"
              placeholder="Search by username, email or ID..."
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
              clearable
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
        loading={isAccountsLoading}
        error={accountsError}
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
        title="Delete this account?"
        opened={openedDelete}
        onClose={closeDelete}
      >
        Are you sure you want to delete this account? This account will be soft
        deleted.
        <Group mt="lg" justify="flex-end">
          <Button onClick={closeDelete} variant="grey">
            Cancel
          </Button>
          <Button
            onClick={(e) => {
              handleDeleteAccount(e);
            }}
            variant="delete"
            loading={deleteMutation.isPending}
          >
            Delete
          </Button>
        </Group>
      </Modal>
      <Modal opened={openedCreate} onClose={closeCreate} title="Create account">
        <Stack>
          <TextInput
            data-autofocus
            withAsterisk
            label="Username"
            placeholder="Username"
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
            label="Email"
            placeholder="Email"
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
            label="Password"
            placeholder="Password"
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
            label="Confirm Password"
            placeholder="Confirm Password"
            onChange={(e) => {
              setConfirmPasswordNew(e.target.value);
              validateConfirmPasswordNew(e.target.value);
            }}
            onBlur={() => validateConfirmPasswordNew(confirmPasswordNew)}
            error={confirmPasswordNewError}
            required
          />
          <TextInput
            label="Phone"
            placeholder="Phone"
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
            label="Role"
            error={roleNewError}
            onBlur={() => validateRoleNew(roleNew)}
            placeholder="Role"
            data={[
              { value: "user", label: "User" },
              { value: "pro", label: "Pro" },
              { value: "employee", label: "Employee" },
              { value: "admin", label: "Admin" },
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
