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
  Center,
  Button,
  Tooltip,
  Modal,
  Indicator,
  Loader,
  TextInput,
  HoverCard,
  UnstyledButton,
} from "@mantine/core";
import { PATHS } from "../../../routes/paths";
import AdminBreadcrumbs from "../../../components/admin/AdminBreadcrumbs";
import { ScoreRing } from "../../../components/user/ScoreRing";
import { useEffect, useState } from "react";
import { Calendar } from "@mantine/dates";
import { useGetEmployeeSchedule } from "../../../hooks/employeeHooks";
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

import FullScreenLoader from "../../../components/common/FullScreenLoader";
import InfoField from "../../../components/common/InfoField";
import dayjs from "dayjs";
import PasswordStrengthInput, {
  requirements,
} from "../../../components/common/input/PasswordStrengthInput";
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

  const { data: employeeSchedule, isLoading: isEmployeeScheduleLoading } =
    useGetEmployeeSchedule(
      accountId,
      isValidId && role === "employee" && !isAccountDetailsLoading,
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

  // CALENDAR MODAL
  const [openedCalendar, { open: openCalendar, close: closeCalendar }] =
    useDisclosure(false);

  if (isAccountDetailsLoading) {
    return <FullScreenLoader />;
  }
  if (errorAccountDetails) {
    return <Navigate to={PATHS.ADMIN.USERS.ALL} replace />;
  }

  return (
    <Container px="md" size="xl" pb="xl">
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
                    : origin?.from === "listingDetail"
                      ? [
                          {
                            title: "Object Management",
                            href: PATHS.ADMIN.LISTINGS,
                          },
                          {
                            title: "Object's Details",
                            href:
                              PATHS.ADMIN.LISTINGS + "/" + origin?.listingId,
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
                  <InfoField label="Current tasks">
                    {/* TODO: Open modal showing calendar with filled occupied dates and
                      link to the event's details */}
                    <Button
                      mt="xs"
                      variant="primary"
                      size="sm"
                      onClick={openCalendar}
                    >
                      Show current tasks
                    </Button>
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

      {/* // calendar modal */}
      <Modal
        size="lg"
        title={
          <Text fw={700}>{`${accountDetails?.username}'s work schedule`}</Text>
        }
        opened={openedCalendar}
        onClose={closeCalendar}
        centered
        styles={{ body: { paddingBottom: "var(--mantine-spacing-xl)" } }}
      >
        <Center>
          {isEmployeeScheduleLoading ? (
            <Loader />
          ) : (
            <Calendar
              styles={{
                levelsGroup: { width: "100%" },
                month: { width: "100%" },
                weekday: { textAlign: "center" },
                day: { width: "100%" },
                calendarHeader: {
                  maxWidth: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "var(--mantine-spacing-md)",
                },
              }}
              static
              size="lg"
              renderDay={(date) => {
                const day = dayjs(date).date();
                const tasksOnDate =
                  employeeSchedule?.filter((event) => {
                    const eventStartVal = dayjs(event.start_at).valueOf();
                    const eventEndVal = dayjs(event.end_at).valueOf();
                    const dayStartVal = dayjs(date).valueOf();
                    const dayEndVal = dayjs(date).endOf("day").valueOf();

                    if (eventStartVal === eventEndVal) {
                      return eventStartVal >= dayStartVal && eventStartVal <= dayEndVal;
                    }
                    return eventStartVal <= dayEndVal && eventEndVal > dayStartVal;
                  }) || [];

                const hasTasks = tasksOnDate.length > 0;
                // Determine if all tasks on this date are completely in the past
                const allTasksInPast = tasksOnDate.every((event) => {
                  return dayjs().valueOf() > dayjs(event.end_at).valueOf();
                });

                return (
                  <HoverCard
                    shadow="xl"
                    disabled={!hasTasks}
                    withinPortal
                    withArrow
                    openDelay={100}
                    closeDelay={200}
                  >
                    <HoverCard.Target>
                      <Indicator
                        processing={hasTasks && !allTasksInPast}
                        size={hasTasks && tasksOnDate.length > 1 ? 18 : 10}
                        color={
                          allTasksInPast ? "red" : "var(--upagain-neutral-green)"
                        }
                        offset={tasksOnDate.length > 1 ? 4 : 0}
                        disabled={!hasTasks}
                        label={
                          tasksOnDate.length > 1
                            ? `+${tasksOnDate.length}`
                            : undefined
                        }
                        styles={{
                          indicator: {
                            fontSize: "10px",
                            fontWeight: 700,
                          },
                        }}
                        style={{ width: "100%", height: "100%" }}
                      >
                        <Center w="100%" h="100%">
                          <Text size="sm" fw={hasTasks ? 700 : 400}>
                            {day}
                          </Text>
                        </Center>
                      </Indicator>
                    </HoverCard.Target>

                    <HoverCard.Dropdown p="sm">
                      <Stack gap="xs">
                        {/* Header: Date with a subtle divider */}
                        <Box
                          style={{
                            borderBottom: "1px solid var(--border-color)",
                            paddingBottom: "4px",
                          }}
                        >
                          <Text size="xs" c="dimmed" tt="uppercase">
                            {dayjs(date).format("dddd")}
                          </Text>
                          <Text size="sm">
                            {dayjs(date).format("DD MMM YYYY")}
                          </Text>
                        </Box>

                        <Stack gap={4}>
                          {tasksOnDate.map((task) => (
                            <UnstyledButton
                              key={task.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                closeCalendar();
                                navigate(
                                  `${PATHS.ADMIN.EVENTS.ALL}/${task.id}`,
                                  {
                                    state: {
                                      from: "userDetails",
                                      id_user: accountDetails?.id,
                                    },
                                  },
                                );
                              }}
                              style={{
                                padding: "6px 8px",
                                borderRadius: "4px",
                                transition: "background 0.2s ease",
                              }}
                              // Hover effect
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "var(--upagain-neutral-green)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "transparent")
                              }
                            >
                              <Group gap="xs" wrap="nowrap">
                                <Text size="sm" truncate>
                                  {task.title}
                                </Text>
                              </Group>
                            </UnstyledButton>
                          ))}
                        </Stack>
                      </Stack>
                    </HoverCard.Dropdown>
                  </HoverCard>
                );
              }}
            />
          )}
        </Center>
      </Modal>
    </Container>
  );
}
