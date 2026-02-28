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
import AdminTable from "../../components/admin/AdminTable";
import { IconSearch, IconPlus, IconLock } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteAccount,
  getAllAccounts,
  type Account,
} from "../../api/admin/userModule";
import dayjs from "dayjs";
import { useDisclosure } from "@mantine/hooks";
import {
  showSuccessNotification,
  showErrorNotification,
} from "../../components/NotificationToast";
import { RegisterRequest } from "../../api/admin/userModule";
import { PATHS } from "../../routes/paths";

const requirements = [
  { re: /[0-9]/, label: "Includes number" },
  { re: /[A-Z]/, label: "Includes uppercase letter" },
  { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: "Includes special character" },
];

export default function AdminUsersModule() {
  const queryClient = useQueryClient();
  const [openedCreate, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);
  const [openedDelete, { open: openDelete, close: closeDelete }] =
    useDisclosure(false);
  // form
  const [usernameNew, setUsernameNew] = useState<string>("");
  const [emailNew, setEmailNew] = useState<string>("");
  const [passwordNew, setPasswordNew] = useState<string>("");
  const [confirmPasswordNew, setConfirmPasswordNew] = useState<string>("");
  const [roleNew, setRoleNew] = useState<string>("");
  const [phoneNew, setPhoneNew] = useState<string>("");
  // errors
  const [usernameNewError, setUsernameNewError] = useState<string | null>(null);
  const [emailNewError, setEmailNewError] = useState<string | null>(null);
  const [passwordNewError, setPasswordNewError] = useState<string | null>(null);
  const [confirmPasswordNewError, setConfirmPasswordNewError] = useState<
    string | null
  >(null);
  const [roleNewError, setRoleNewError] = useState<string | null>(null);
  const [phoneNewError, setPhoneNewError] = useState<string | null>(null);
  const [disablePhone, setDisablePhone] = useState<boolean>(false);

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

  const validateRoleNew = (val: string) => {
    if (!val) {
      setRoleNewError("Role is required");
      return false;
    }
    setRoleNewError(null);
    return true;
  };

  const createMutation = useMutation({
    mutationFn: RegisterRequest,
    onSuccess: (response) => {
      if (response.status === 201) {
        showSuccessNotification(
          "Account creation success",
          "Account created successfully.",
        );
        closeCreate();
        queryClient.invalidateQueries({ queryKey: ["accounts"] });
      } else {
        showErrorNotification("Account creation failed", response.data.error);
      }
    },
    onError: (error: any) => {
      showErrorNotification("Account creation failed", error);
    },
  });

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
    createMutation.mutate({
      username: usernameNew,
      email: emailNew,
      password: passwordNew,
      role: roleNew,
    });
  };

  // handle delete account confirmation modals
  const [selectedDeleteAcc, setSelectedDeleteAcc] = useState<Account | null>(
    null,
  );
  const handleModalDelete = (account: Account) => {
    setSelectedDeleteAcc(account);
    openDelete();
  };
  const navigate = useNavigate();
  const [filters, setFilters] = useState<{
    searchValue: string | undefined;
    sortValue: string | null;
    roleValue: string | null;
    statusValue: string | null;
  }>({ searchValue: "", sortValue: null, roleValue: null, statusValue: null });
  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const { data: accounts = [] as Account[], isLoading: isAccountsLoading } =
    useQuery<Account[]>({
      queryKey: ["accounts"],
      queryFn: getAllAccounts,
    });
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
        <Table.Tr
          style={{
            cursor: "pointer",
          }}
          key={account.id}
          onClick={() => {
            navigate(PATHS.ADMIN.USERS + "/" + account.id);
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
            {dayjs(account.last_active).format("DD/MM/YYYY - HH:mm")}
          </Table.Td>
          <Table.Td ta="center">
            <Button variant="edit" me="sm" size="xs">
              Edit
            </Button>
            <Button
              disabled={account.role === "admin"}
              variant="delete"
              size="xs"
              onClick={() => handleModalDelete(account)}
            >
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

  const deleteMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: (response) => {
      if (response.status === 204) {
        showSuccessNotification(
          "Account deleted",
          "Account deleted successfully.",
        );
        closeDelete();
        queryClient.invalidateQueries({ queryKey: ["accounts"] });
      } else {
        showErrorNotification("Account deletion failed", response.data.error);
      }
    },
    onError: (error: any) => {
      showErrorNotification("Account deletion failed", error);
    },
  });

  const handleDeleteAccount = async () => {
    if (selectedDeleteAcc?.id) {
      deleteMutation.mutate(selectedDeleteAcc.id);
    }
  };
  return (
    <Container px="md" size="xl">
      <Title order={2} mt="lg" mb="xl">
        User Management
      </Title>

      <Stack gap="md" mb="xl">
        <Group justify="space-between" align="flex-end">
          <div>
            <Title c="dimmed" order={3}>
              Manage users and their permissions
            </Title>
          </div>

          <Modal
            opened={openedCreate}
            onClose={closeCreate}
            title="New Account"
            centered
          >
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
          <Button
            variant="primary"
            leftSection={<IconPlus size={16} />}
            onClick={openCreate}
          >
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
        loading={isAccountsLoading}
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
            onClick={() => {
              handleDeleteAccount();
            }}
            variant="delete"
            loading={deleteMutation.isPending}
          >
            Delete
          </Button>
        </Group>
      </Modal>
    </Container>
  );
}
