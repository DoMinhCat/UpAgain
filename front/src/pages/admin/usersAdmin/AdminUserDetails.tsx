import {
  Avatar,
  Box,
  Container,
  Flex,
  Paper,
  PasswordInput,
  Stack,
  Group,
  Text,
  Title,
  Button,
  Tooltip,
  Modal,
  Loader,
  TextInput,
} from "@mantine/core";
import { PATHS } from "../../../routes/paths";
import AdminBreadcrumbs from "../../../components/admin/AdminBreadcrumbs";
import { ScoreRing } from "../../../components/user/ScoreRing";
import { useEffect, useState } from "react";

import {
  useAccountDetails,
  useDeleteAccount,
  useUpdatePassword,
  useToggleBanAccount,
  useRecoverAccount,
  useAccountStats,
  useUpdateAccount,
} from "../../../hooks/accountHooks";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import FullScreenLoader from "../../../components/FullScreenLoader";
import InfoField from "../../../components/InfoField";
import dayjs from "dayjs";
import PasswordStrengthInput, {
  requirements,
} from "../../../components/PasswordStrengthInput";
import { IconLock, IconInfoCircleFilled } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { useAuth } from "../../../context/AuthContext";

export default function AdminUserDetails() {
  // for breadcrumbs
  const location = useLocation();
  const origin = location.state;

  const { user } = useAuth();
  const navigate = useNavigate();
  // modal control
  const [openedEdit, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);
  const [openedDelete, { open: openDelete, close: closeDelete }] =
    useDisclosure(false);
  const [openedBan, { open: openBan, close: closeBan }] = useDisclosure(false);
  const [
    openedChangePassword,
    { open: openChangePassword, close: closeChangePassword },
  ] = useDisclosure(false);
  const [openedRecover, { open: openRecover, close: closeRecover }] =
    useDisclosure(false);

  // states for password form
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | null
  >(null);
  // states edit form
  const [usernameEdit, setUsernameEdit] = useState<string>("");
  const [emailEdit, setEmailEdit] = useState<string>("");
  const [phoneEdit, setPhoneEdit] = useState<string>("");
  const [usernameEditError, setUsernameEditError] = useState<string | null>(
    null,
  );
  const [emailEditError, setEmailEditError] = useState<string | null>(null);
  const [phoneEditError, setPhoneEditError] = useState<string | null>(null);
  const [disablePhoneEdit, setDisablePhoneEdit] = useState<boolean>(false);

  //validations
  const validatePassword = (val: string) => {
    if (!val) {
      setPasswordError("Password is required");
      return false;
    }
    if (val.length < 12) {
      setPasswordError("Password must be at least 12 characters long");
      return false;
    }
    if (val.length > 60) {
      setPasswordError("Password must be at most 60 characters long");
      return false;
    }
    if (!requirements.every((requirement) => requirement.re.test(val))) {
      setPasswordError(
        "Password must contain at least one number, one uppercase letter, and one special character",
      );
      return false;
    }
    setPasswordError(null);
    return true;
  };

  const validateConfirmPassword = (val: string) => {
    if (!val) {
      setConfirmPasswordError("You must confirm your password");
      return false;
    } else if (val !== password) {
      setConfirmPasswordError("Passwords do not match");
      return false;
    }
    setConfirmPasswordError(null);
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

  // Fetch account info to display
  const params = useParams();
  const accountId: number = params.id ? parseInt(params.id) : 0;
  const isValidId = !isNaN(accountId) && accountId > 0;
  const {
    data: accountDetails,
    isLoading: isAccountDetailsLoading,
    error: errorAccountDetails,
  } = useAccountDetails(accountId, isValidId);
  const role = accountDetails?.role;
  const is_banned = accountDetails?.is_banned;

  // insert values for edit form
  useEffect(() => {
    if (accountDetails) {
      setUsernameEdit(accountDetails.username || "");
      setEmailEdit(accountDetails.email || "");
      setPhoneEdit(accountDetails.phone || "");
      if (
        accountDetails.role === "admin" ||
        accountDetails.role === "employee"
      ) {
        setDisablePhoneEdit(true);
      } else {
        setDisablePhoneEdit(false);
      }
    }
  }, [accountDetails]);

  const { data: accountStats, isLoading: isAccountStatsLoading } =
    useAccountStats(
      accountId,
      isValidId && role != "admin" && !isAccountDetailsLoading,
    );

  // delete hook
  const deletionMutation = useDeleteAccount();
  const handleDeleteAccount = async () => {
    if (accountId) {
      deletionMutation.mutate(accountId, {
        onSuccess: (response) => {
          if (response?.status === 204) {
            closeDelete();
            navigate(PATHS.ADMIN.USERS.ALL);
          }
        },
      });
    }
  };

  // change pass hook
  const { mutate: mutatePasswordUpdate, isPending: isPendingPasswordUpdate } =
    useUpdatePassword();

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !validatePassword(password) ||
      !validateConfirmPassword(confirmPassword)
    )
      return;

    mutatePasswordUpdate(
      { id: accountId, newPassword: password },
      {
        onSuccess: (response) => {
          if (response?.status === 204) {
            closeChangePassword();
            setPassword("");
            setConfirmPassword("");
          }
        },
      },
    );
  };

  // ban hook
  const { mutate: mutateToggleBan, isPending: isPendingToggleBan } =
    useToggleBanAccount();

  const handleBan = (e: React.FormEvent) => {
    e.preventDefault();
    mutateToggleBan(
      { id: accountId, is_banned: is_banned ? true : false },
      {
        onSuccess: (response) => {
          if (response?.status === 204) {
            closeBan();
          }
        },
      },
    );
  };

  const { mutate: mutateRecover, isPending: isPendingRecover } =
    useRecoverAccount();

  const handleRecover = (e: React.FormEvent) => {
    e.preventDefault();
    if (accountId) {
      mutateRecover(accountId, {
        onSuccess: (response) => {
          if (response?.status === 204) {
            closeRecover();
          }
        },
      });
    }
  };

  const editMutation = useUpdateAccount();
  const handleEditAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !validateUsernameEdit(usernameEdit) ||
      !validateEmailEdit(emailEdit) ||
      !validatePhoneEdit(phoneEdit)
    )
      return;
    if (accountId) {
      editMutation.mutate(
        {
          id_account: accountId,
          username: usernameEdit,
          email: emailEdit,
          phone: phoneEdit,
        },
        {
          onSuccess: (response: any) => {
            if (response?.status === 204) {
              closeEdit();
            }
          },
        },
      );
    }
  };

  if (isAccountDetailsLoading) {
    return <FullScreenLoader />;
  }
  if (errorAccountDetails) {
    return <Navigate to={PATHS.ADMIN.USERS.ALL} replace />;
  }

  return (
    <Container px="md" size="xl">
      <Title order={2} mt="xs" mb="sm">
        User's Details
      </Title>
      <AdminBreadcrumbs
        breadcrumbs={[
          ...(origin === "allUsers"
            ? [{ title: "User Management", href: PATHS.ADMIN.USERS.ALL }]
            : origin === "deletedList"
              ? [
                  { title: "User Management", href: PATHS.ADMIN.USERS.ALL },
                  {
                    title: "Deleted Accounts",
                    href: PATHS.ADMIN.USERS.DELETED,
                  },
                ]
              : origin?.from === "eventDetails"
                ? [
                    { title: "Event Management", href: PATHS.ADMIN.EVENTS.ALL },
                    {
                      title: "Event's Details",
                      href: PATHS.ADMIN.EVENTS.ALL + "/" + origin?.id_event,
                    },
                  ]
                : origin?.from === "postDetails"
                  ? [
                      {
                        title: "Post Management",
                        href: PATHS.ADMIN.POSTS,
                      },
                      {
                        title: "Post's Details",
                        href: PATHS.ADMIN.POSTS + "/" + origin?.id_post,
                      },
                    ]
                  : origin?.from === "historyDetails"
                    ? [
                        {
                          title: "History's Details",
                          href:
                            PATHS.ADMIN.HISTORY.ALL + "/" + origin?.id_history,
                        },
                      ]
                    : []),
          { title: "User's Details", href: "#" },
        ]}
      />
      <Container px="md" size="sm" mt="xl">
        {accountDetails?.role === "user" && (
          <Flex align="flex-start" justify="flex-end">
            <ScoreRing score={accountDetails.score} size={90} />
          </Flex>
        )}

        <Stack justify="center" align="center">
          <Avatar
            // avatar must be in /src/assets/avatars
            src={accountDetails?.avatar}
            name="User's name"
            color="initials"
            size="100"
          />
          <Title order={3}>{accountDetails?.username}</Title>
        </Stack>
        <Title order={3} ta="left" mt="xl">
          General Information
        </Title>

        <Paper variant="primary" px="lg" py="md" mt="sm">
          <InfoField label="Username">
            <Text ps="sm" mt="xs" mb="xl">
              {accountDetails?.username}
            </Text>
          </InfoField>
          <InfoField label="Registered on">
            <Text ps="sm" mt="xs" mb="xl">
              {dayjs(accountDetails?.created_at).format("DD/MM/YYYY - HH:mm")}
            </Text>
          </InfoField>
          <InfoField label="Role">
            {accountDetails?.role === "user" ? (
              <Text ps="sm" mt="xs" mb="xl" c="blue">
                User
              </Text>
            ) : accountDetails?.role === "pro" ? (
              <Text ps="sm" mt="xs" mb="xl" c="yellow">
                Pro
              </Text>
            ) : accountDetails?.role === "employee" ? (
              <Text ps="sm" mt="xs" mb="xl" c="green">
                Employee
              </Text>
            ) : (
              <Text ps="sm" mt="xs" mb="xl" c="red">
                Admin
              </Text>
            )}
          </InfoField>
          <InfoField label="Status">
            {accountDetails?.deleted_at ? (
              <Text ps="sm" mt="xs" mb="xl" c="red">
                Deleted
              </Text>
            ) : accountDetails?.is_banned ? (
              <Text ps="sm" mt="xs" mb="xl" c="red">
                Banned
              </Text>
            ) : (
              <Text ps="sm" mt="xs" mb="xl" c="green">
                Active
              </Text>
            )}
          </InfoField>
          {accountDetails?.is_premium ??
            (accountDetails?.is_premium ? (
              <InfoField label="Subscription">
                <Text ps="sm" mt="xs" mb="xl">
                  Freemium
                </Text>
              </InfoField>
            ) : (
              <InfoField label="Subscription">
                <Text
                  ps="sm"
                  mt="xs"
                  mb="xl"
                  gradient={{
                    from: "rgba(199, 165, 70, 1)",
                    to: "rgba(230, 225, 188, 1)",
                    deg: 90,
                  }}
                >
                  Premium
                </Text>
              </InfoField>
            ))}
        </Paper>

        <Title order={3} ta="left" mt="xl">
          Contact
        </Title>
        <Paper variant="primary" px="lg" py="md" mt="sm">
          <InfoField label="Email">
            <Text ps="sm" mt="xs" mb="xl">
              {accountDetails?.email}
            </Text>
          </InfoField>
          <InfoField label="Phone number">
            <Text ps="sm" mt="xs" mb="xl">
              {accountDetails?.phone ? accountDetails?.phone : "N/A"}
            </Text>
          </InfoField>
        </Paper>

        {!accountDetails?.deleted_at && (
          <>
            <Title order={3} ta="left" mt="xl">
              Activities
            </Title>
            <Paper variant="primary" px="lg" py="md" mt="sm">
              <InfoField label="Last active on">
                <Text ps="sm" mt="xs">
                  {accountDetails?.last_active
                    ? dayjs(accountDetails?.last_active).format(
                        "DD/MM/YYYY - HH:mm",
                      )
                    : "N/A"}
                </Text>
              </InfoField>
              {role == "user" && (
                <>
                  <InfoField label="Total container deposits posted" mt="xl">
                    {isAccountStatsLoading ? (
                      <Loader mb="xl" size="sm" />
                    ) : (
                      <Text ps="sm" mt="xs" mb="xl">
                        {!errorAccountDetails
                          ? accountStats?.total_deposits +
                            (accountStats?.total_deposits === 1
                              ? " deposit"
                              : " deposits") +
                            " posted"
                          : "Failed to get account's stats"}
                      </Text>
                    )}
                  </InfoField>
                  <InfoField label="Total listings posted">
                    {isAccountStatsLoading ? (
                      <Loader mb="xl" size="sm" />
                    ) : (
                      <Text ps="sm" mt="xs" mb="xl">
                        {!errorAccountDetails
                          ? accountStats?.total_listings +
                            (accountStats?.total_listings === 1
                              ? " listing"
                              : " listings") +
                            " posted"
                          : "Failed to get account's stats"}
                      </Text>
                    )}
                  </InfoField>
                  <InfoField label="Total spendings">
                    {isAccountStatsLoading ? (
                      <Loader mb="xl" size="sm" />
                    ) : (
                      <Text ps="sm" mt="xs" mb="xl">
                        {!errorAccountDetails
                          ? accountStats?.total_spendings + " €"
                          : "Failed to get account's stats"}
                      </Text>
                    )}
                  </InfoField>
                </>
              )}

              {role == "employee" && (
                <>
                  <InfoField label="Total events/workshops assigned" mt="xl">
                    {isAccountStatsLoading ? (
                      <Loader mb="xl" size="sm" />
                    ) : (
                      <Text ps="sm" mt="xs" mb="xl">
                        {!errorAccountDetails
                          ? accountStats?.total_events +
                            (accountStats?.total_events === 1
                              ? " event/workshop"
                              : " events/workshops") +
                            " assigned"
                          : "Failed to get account's stats"}
                      </Text>
                    )}
                  </InfoField>
                  <InfoField label="Total articles posted">
                    {isAccountStatsLoading ? (
                      <Loader mb="xl" size="sm" />
                    ) : (
                      <Text ps="sm" mt="xs" mb="xl">
                        {!errorAccountDetails
                          ? accountStats?.total_posts +
                            (accountStats?.total_posts === 1
                              ? " article"
                              : " articles") +
                            " posted"
                          : "Failed to get account's stats"}
                      </Text>
                    )}
                  </InfoField>
                </>
              )}
              {role == "pro" && (
                <>
                  <InfoField label="Total listings purchased" mt="xl">
                    {isAccountStatsLoading ? (
                      <Loader mb="xl" size="sm" />
                    ) : (
                      <Text ps="sm" mt="xs" mb="xl">
                        {!errorAccountDetails
                          ? accountStats?.total_listings +
                            (accountStats?.total_listings === 1
                              ? " listing"
                              : " listings") +
                            " purchased"
                          : "Failed to get account's stats"}
                      </Text>
                    )}
                  </InfoField>
                  <InfoField label="Total container deposits purchased">
                    {isAccountStatsLoading ? (
                      <Loader mb="xl" size="sm" />
                    ) : (
                      <Text ps="sm" mt="xs" mb="xl">
                        {!errorAccountDetails
                          ? accountStats?.total_deposits +
                            (accountStats?.total_deposits === 1
                              ? " deposit"
                              : " deposits") +
                            " purchased"
                          : "Failed to get account's stats"}
                      </Text>
                    )}
                  </InfoField>
                  <InfoField label="Total projects posted">
                    {isAccountStatsLoading ? (
                      <Loader mb="xl" size="sm" />
                    ) : (
                      <Text ps="sm" mt="xs" mb="xl">
                        {!errorAccountDetails
                          ? accountStats?.total_projects +
                            (accountStats?.total_projects === 1
                              ? " project"
                              : " projects") +
                            " posted"
                          : "Failed to get account's stats"}
                      </Text>
                    )}
                  </InfoField>
                  <InfoField label="Total spendings">
                    {isAccountStatsLoading ? (
                      <Loader mb="xl" size="sm" />
                    ) : (
                      <Text ps="sm" mt="xs" mb="xl">
                        {!errorAccountDetails
                          ? accountStats?.total_spendings + " €"
                          : "Failed to get account's stats"}
                      </Text>
                    )}
                  </InfoField>
                </>
              )}
            </Paper>
          </>
        )}
        <Title order={3} ta="left" mt="xl" c="red">
          Danger zone
        </Title>
        <Paper variant="primary" px="lg" py="md" mt="sm">
          {accountDetails?.deleted_at ? (
            <InfoField label="Recover account">
              <Box ps="sm" mb="xl">
                <Text c="dimmed" my="xs">
                  Recover this deleted account
                </Text>
                <Button
                  variant="primary"
                  onClick={openRecover}
                  loading={isPendingRecover}
                >
                  Recover account
                </Button>
              </Box>
            </InfoField>
          ) : (
            <>
              <InfoField label="Edit account">
                <Box ps="sm" mb="xl">
                  <Group gap="xs">
                    <Text c="dimmed" my="xs">
                      Modify account's username, contact information, etc.
                    </Text>
                    {role === "admin" && accountId != user?.id && (
                      <Tooltip
                        label="Cannot edit another admin's account"
                        closeDelay={200}
                        transitionProps={{ transition: "pop", duration: 300 }}
                      >
                        <IconInfoCircleFilled size={14} />
                      </Tooltip>
                    )}
                  </Group>
                  <Button
                    variant="edit"
                    onClick={openEdit}
                    disabled={role === "admin" && accountId != user?.id}
                  >
                    Edit account
                  </Button>
                </Box>
              </InfoField>

              <InfoField label="Change password">
                <Box ps="sm" mb="xl">
                  <Group gap="xs">
                    <Text mt="xs" mb="xs" c="dimmed">
                      Assign a new password for this account
                    </Text>
                    {role === "admin" && accountId != user?.id && (
                      <Tooltip
                        label="Cannot change password of another admin"
                        closeDelay={200}
                        transitionProps={{ transition: "pop", duration: 300 }}
                      >
                        <IconInfoCircleFilled size={14} />
                      </Tooltip>
                    )}
                  </Group>
                  <form onSubmit={handleChangePassword}>
                    <PasswordStrengthInput
                      w="50%"
                      variant="body-color"
                      placeholder="New password"
                      value={password}
                      disabled={
                        isPendingPasswordUpdate ||
                        (role === "admin" && accountId != user?.id)
                      }
                      leftSection={<IconLock size={14} />}
                      onChange={(event) => {
                        const value = event.currentTarget.value;
                        setPassword(value);
                        validatePassword(value);
                      }}
                      error={passwordError}
                      required
                    />
                    <PasswordInput
                      leftSection={<IconLock size={14} />}
                      variant="body-color"
                      w="50%"
                      mt="xs"
                      value={confirmPassword}
                      placeholder="Confirm new password"
                      onChange={(event) => {
                        const value = event.currentTarget.value;
                        setConfirmPassword(value);
                        validateConfirmPassword(value);
                      }}
                      disabled={
                        isPendingPasswordUpdate ||
                        (role === "admin" && accountId != user?.id)
                      }
                      error={confirmPasswordError}
                      required
                    />
                    <Button
                      mt="md"
                      variant="edit"
                      onClick={() => {
                        if (
                          !validatePassword(password) ||
                          !validateConfirmPassword(confirmPassword)
                        )
                          return;
                        openChangePassword();
                      }}
                      loading={isPendingPasswordUpdate}
                      disabled={
                        isPendingPasswordUpdate ||
                        (role === "admin" && accountId != user?.id)
                      }
                    >
                      Change password
                    </Button>
                    {/* // modal change pass */}
                    <Modal
                      opened={openedChangePassword}
                      onClose={closeChangePassword}
                      title="Change password"
                    >
                      Are you sure you change password for this account? The old
                      password will be replaced by the new one.
                      <Group mt="lg" justify="flex-end">
                        <Button onClick={closeChangePassword} variant="grey">
                          Cancel
                        </Button>
                        <Button
                          onClick={handleChangePassword}
                          variant="edit"
                          loading={isPendingPasswordUpdate}
                        >
                          Change password
                        </Button>
                      </Group>
                    </Modal>
                  </form>
                </Box>
              </InfoField>
              <InfoField label={is_banned ? "Unban account" : "Ban account"}>
                <Box ps="sm" mb="xl">
                  <Group gap="xs">
                    <Text c="dimmed" my="xs">
                      {is_banned
                        ? "This account will regain access to UpAgain"
                        : "This account will not be able to access to UpAgain until an admin unbans it"}
                    </Text>
                    {role === "admin" &&
                      accountId != user?.id &&
                      !is_banned && (
                        <Tooltip
                          label="Cannot ban an admin"
                          closeDelay={200}
                          transitionProps={{ transition: "pop", duration: 300 }}
                        >
                          <IconInfoCircleFilled size={14} />
                        </Tooltip>
                      )}
                  </Group>
                  <Button
                    variant={!is_banned ? "delete" : "primary"}
                    onClick={openBan}
                    disabled={role === "admin" || isPendingToggleBan}
                  >
                    {!is_banned ? "Ban account" : "Unban account"}
                  </Button>
                </Box>
              </InfoField>

              <InfoField label="Delete account">
                <Box ps="sm" mb="xl">
                  <Group gap="xs">
                    <Text c="dimmed" my="xs">
                      This account will be soft deleted
                    </Text>
                    {role === "admin" && accountId != user?.id && (
                      <Tooltip
                        label="Cannot delete another admin's account"
                        closeDelay={200}
                        transitionProps={{ transition: "pop", duration: 300 }}
                      >
                        <IconInfoCircleFilled size={14} />
                      </Tooltip>
                    )}
                  </Group>
                  <Button
                    variant="delete"
                    onClick={openDelete}
                    disabled={role === "admin" && accountId != user?.id}
                  >
                    Delete account
                  </Button>
                </Box>
              </InfoField>
            </>
          )}
        </Paper>
      </Container>
      {/* // modal delete */}
      <Modal opened={openedDelete} onClose={closeDelete} title="Delete account">
        Are you sure you want to delete this account?
        <br />
        This account will be soft deleted.
        <Group mt="lg" justify="flex-end">
          <Button onClick={closeDelete} variant="grey">
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleDeleteAccount();
            }}
            variant="delete"
            loading={deletionMutation.isPending}
          >
            Delete
          </Button>
        </Group>
      </Modal>

      {/* // modal ban */}
      <Modal
        opened={openedBan}
        onClose={closeBan}
        title={!is_banned ? "Ban account" : "Unban account"}
      >
        {!is_banned
          ? "Are you sure you want to ban this account? This account will be banned."
          : "Are you sure you want to unban this account? This account will regain access."}
        <Group mt="lg" justify="flex-end">
          <Button onClick={closeBan} variant="grey">
            Cancel
          </Button>
          <Button
            onClick={handleBan}
            variant={!is_banned ? "delete" : "primary"}
            loading={isPendingToggleBan}
          >
            {!is_banned ? "Ban account" : "Unban account"}
          </Button>
        </Group>
      </Modal>

      {/* // modal recover */}
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

      {/* // edit modal */}
      <Modal
        title="Edit account"
        opened={openedEdit}
        onClose={closeEdit}
        centered
      >
        <Stack>
          <TextInput
            data-autofocus
            withAsterisk
            label="Username"
            value={usernameEdit}
            placeholder="Username"
            onChange={(e) => {
              setUsernameEdit(e.target.value);
              validateUsernameEdit(e.target.value);
            }}
            onBlur={() => validateUsernameEdit(usernameEdit)}
            error={usernameEditError}
            required
          />
          <TextInput
            withAsterisk
            label="Email"
            value={emailEdit}
            placeholder="Email"
            onChange={(e) => {
              setEmailEdit(e.target.value);
              validateEmailEdit(e.target.value);
            }}
            onBlur={() => validateEmailEdit(emailEdit)}
            error={emailEditError}
            required
          />
          <TextInput
            label="Phone"
            value={phoneEdit}
            placeholder="Phone"
            onChange={(e) => {
              setPhoneEdit(e.target.value);
              validatePhoneEdit(e.target.value);
            }}
            onBlur={() => validatePhoneEdit(phoneEdit)}
            error={phoneEditError}
            disabled={disablePhoneEdit}
          />
        </Stack>
        <Group mt="lg" justify="center">
          <Button onClick={closeEdit} variant="grey">
            Cancel
          </Button>
          <Button
            onClick={(e) => {
              handleEditAccount(e);
            }}
            variant="primary"
            loading={editMutation.isPending}
          >
            Confirm
          </Button>
        </Group>
      </Modal>
    </Container>
  );
}
