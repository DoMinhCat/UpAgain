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
  Skeleton,
  Loader,
  TextInput,
  HoverCard,
  UnstyledButton,
  Grid,
  Badge,
  Divider,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { PATHS } from "../../../routes/paths";
import MyBreadcrumbs from "../../../components/nav/MyBreadcrumbs";
import { ScoreRing } from "../../../components/score/ScoreRing";
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

import FullScreenSkeleton from "../../../components/common/FullScreenSkeleton";
import dayjs from "dayjs";
import PasswordStrengthInput from "../../../components/input/PasswordStrengthInput";
import {
  IconLock,
  IconInfoCircleFilled,
  IconUser,
  IconMail,
  IconPhone,
  IconCalendar,
  IconClock,
  IconCrownFilled,
  IconPackage,
  IconBox,
  IconCash,
  IconCalendarStats,
  IconFileText,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { useAuth } from "../../../context/AuthContext";
import {
  validateConfirmPassword,
  validateEmail,
  validatePassword,
  validatePhone,
  validateUsername,
} from "../../../utils/validations/accountValidation";
import { resolveUrl } from "../../../utils/imageUtils";

export default function AdminUserDetails() {
  const { t } = useTranslation("admin");
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
  const handleValidatePassword = (val: string) => {
    const error = validatePassword(val, t);
    setPasswordError(error);
    return error === null;
  };

  const handleValidateConfirmPassword = (val: string) => {
    const error = validateConfirmPassword(val, password, t);
    setConfirmPasswordError(error);
    return error === null;
  };

  const handleValidateUsernameEdit = (val: string) => {
    const error = validateUsername(val, t);
    setUsernameEditError(error);
    return error === null;
  };

  const handleValidateEmailEdit = (val: string) => {
    const error = validateEmail(val, t);
    setEmailEditError(error);
    return error === null;
  };

  const handleValidatePhoneEdit = (val: string) => {
    const error = validatePhone(val, t);
    setPhoneEditError(error);
    return error === null;
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
  const isOnline = accountDetails?.last_active
    ? dayjs().diff(dayjs(accountDetails.last_active), "minute") < 3
    : false;

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

  const handleChangePassword = (
    e: React.MouseEvent<HTMLButtonElement> | React.SubmitEvent,
  ) => {
    e.preventDefault();
    if (
      !handleValidatePassword(password) ||
      !handleValidateConfirmPassword(confirmPassword)
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
  const handleEditAccount = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (
      !handleValidateUsernameEdit(usernameEdit) ||
      !handleValidateEmailEdit(emailEdit) ||
      !handleValidatePhoneEdit(phoneEdit)
    )
      return;
    if (accountId) {
      editMutation.mutate(
        {
          id: accountId,
          username: usernameEdit,
          email: emailEdit,
          phone: phoneEdit,
        },
        {
          onSuccess: () => {
            closeEdit();
          },
        },
      );
    }
  };

  // CALENDAR MODAL
  const [openedCalendar, { open: openCalendar, close: closeCalendar }] =
    useDisclosure(false);

  if (isAccountDetailsLoading) {
    return <FullScreenSkeleton />;
  }
  if (errorAccountDetails) {
    return <Navigate to={PATHS.ADMIN.USERS.ALL} replace />;
  }

  return (
    <Container px="md" size="xl">
      <Group justify="space-between" align="center" mt="lg">
        <Stack gap="xs">
          <Title order={2}>{t("users.details.title")}</Title>
          <MyBreadcrumbs
            breadcrumbs={[
              ...(origin === "allUsers"
                ? [{ title: t("users.title"), href: PATHS.ADMIN.USERS.ALL }]
                : origin === "deletedList"
                  ? [
                      { title: t("users.title"), href: PATHS.ADMIN.USERS.ALL },
                      {
                        title: t("users.deleted.title"),
                        href: PATHS.ADMIN.USERS.DELETED,
                      },
                    ]
                  : origin?.from === "eventDetails"
                    ? [
                        {
                          title: t("events.title"),
                          href: PATHS.ADMIN.EVENTS.ALL,
                        },
                        {
                          title: t("events.details.title"),
                          href: PATHS.ADMIN.EVENTS.ALL + "/" + origin?.id_event,
                        },
                      ]
                    : origin?.from === "postDetails"
                      ? [
                          {
                            title: t("posts.title"),
                            href: PATHS.ADMIN.POSTS,
                          },
                          {
                            title: t("posts.details.title", {
                              defaultValue: "Post's Details",
                            }),
                            href: PATHS.ADMIN.POSTS + "/" + origin?.id_post,
                          },
                        ]
                      : origin?.from === "historyDetails"
                        ? [
                            {
                              title: t("history.title"),
                              href:
                                PATHS.ADMIN.HISTORY.ALL +
                                "/" +
                                origin?.id_history,
                            },
                          ]
                        : origin?.from === "listingDetail"
                          ? [
                              {
                                title: t("listings.title"),
                                href: PATHS.ADMIN.LISTINGS,
                              },
                              {
                                title: t("listings.details.title"),
                                href:
                                  PATHS.ADMIN.LISTINGS +
                                  "/" +
                                  origin?.listingId,
                              },
                            ]
                          : origin?.from === "SubscriptionDetails"
                            ? [
                                {
                                  title: t("subscription.title", {
                                    defaultValue: "Subscription Management",
                                  }),
                                  href: PATHS.ADMIN.SUBSCRIPTIONS.ALL,
                                },
                                {
                                  title: t("subscription.details.title", {
                                    defaultValue: "Subscription's Details",
                                  }),
                                  href:
                                    PATHS.ADMIN.SUBSCRIPTIONS.ALL +
                                    "/" +
                                    origin?.id_sub,
                                },
                              ]
                            : origin?.from === "finance"
                              ? [
                                  {
                                    title: t("finance.title"),
                                    href: PATHS.ADMIN.FINANCE.ALL,
                                  },
                                ]
                              : [
                                  {
                                    title: t("users.title"),
                                    href: PATHS.ADMIN.USERS.ALL,
                                  },
                                ]),
              { title: t("users.details.title"), href: "#" },
            ]}
          />
        </Stack>
      </Group>

      <Grid gap="md" mt="xl">
        {/* Left Column: Hero Header + Account Info + Danger Zone */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack gap="md">
            {/* Hero Header Card */}
            <Paper variant="primary" p="lg" radius="md">
              <Flex
                direction={{ base: "column", sm: "row" }}
                gap="md"
                justify="space-between"
                align={{ base: "flex-start", sm: "center" }}
              >
                <Group gap="md" align="center">
                  <Indicator
                    inline
                    size={16}
                    offset={6}
                    position="bottom-end"
                    color={
                      accountDetails?.deleted_at || accountDetails?.is_banned
                        ? "red"
                        : isOnline
                          ? "green"
                          : "gray"
                    }
                    withBorder
                  >
                    <Avatar
                      src={resolveUrl(accountDetails?.avatar || "")}
                      name={accountDetails?.username || "User"}
                      color="initials"
                      size="lg"
                    />
                  </Indicator>
                  <Stack gap={4}>
                    <Group gap="xs" align="center">
                      <Title order={3}>{accountDetails?.username}</Title>
                      {accountDetails?.is_premium && (
                        <Tooltip label={t("users.details.fields.premium")}>
                          <IconCrownFilled
                            size={20}
                            color="var(--upagain-yellow)"
                          />
                        </Tooltip>
                      )}
                    </Group>
                    <Group gap="xs">
                      {/* Role badge */}
                      {accountDetails?.role === "user" ? (
                        <Badge color="blue" variant="light">
                          {t("users.roles.user")}
                        </Badge>
                      ) : accountDetails?.role === "pro" ? (
                        <Badge color="yellow" variant="light">
                          {t("users.roles.pro")}
                        </Badge>
                      ) : accountDetails?.role === "employee" ? (
                        <Badge color="green" variant="light">
                          {t("users.roles.employee")}
                        </Badge>
                      ) : (
                        <Badge color="red" variant="light">
                          {t("users.roles.admin")}
                        </Badge>
                      )}

                      {/* Status badge */}
                      {accountDetails?.deleted_at ? (
                        <Badge color="red">
                          {t("users.details.fields.deleted")}
                        </Badge>
                      ) : accountDetails?.is_banned ? (
                        <Badge color="red">
                          {t("users.details.fields.banned")}
                        </Badge>
                      ) : (
                        <Badge color="green">
                          {t("users.details.fields.active")}
                        </Badge>
                      )}
                    </Group>
                  </Stack>
                </Group>

                {accountDetails?.role === "user" && (
                  <Group gap="xs" align="center">
                    <Text size="sm" c="dimmed" fw={600}>
                      {t("fields.upcycling_score", {
                        defaultValue: "Upcycling Score",
                      })}
                      :
                    </Text>
                    <ScoreRing score={accountDetails?.score || 0} size={80} />
                  </Group>
                )}
              </Flex>
            </Paper>

            {/* General & Contact Info Card */}
            <Paper variant="primary" p="lg" radius="md">
              <Title order={4} mb="md">
                {t("users.details.general_info")}
              </Title>
              <Grid gap="md">
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Stack gap="sm">
                    <Group gap="xs" wrap="nowrap">
                      <IconUser size={18} color="var(--mantine-color-dimmed)" />
                      <Box>
                        <Text size="xs" c="dimmed" fw={600}>
                          {t("users.details.fields.username")}
                        </Text>
                        <Text size="sm">{accountDetails?.username}</Text>
                      </Box>
                    </Group>
                    <Group gap="xs" wrap="nowrap">
                      <IconMail size={18} color="var(--mantine-color-dimmed)" />
                      <Box>
                        <Text size="xs" c="dimmed" fw={600}>
                          {t("users.details.fields.email")}
                        </Text>
                        <Text size="sm">{accountDetails?.email}</Text>
                      </Box>
                    </Group>
                    <Group gap="xs" wrap="nowrap">
                      <IconPhone
                        size={18}
                        color="var(--mantine-color-dimmed)"
                      />
                      <Box>
                        <Text size="xs" c="dimmed" fw={600}>
                          {t("users.details.fields.phone")}
                        </Text>
                        <Text size="sm">
                          {accountDetails?.phone ||
                            t("users.details.fields.n_a")}
                        </Text>
                      </Box>
                    </Group>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Stack gap="sm">
                    <Group gap="xs" wrap="nowrap">
                      <IconCalendar
                        size={18}
                        color="var(--mantine-color-dimmed)"
                      />
                      <Box>
                        <Text size="xs" c="dimmed" fw={600}>
                          {t("users.details.fields.registered_on")}
                        </Text>
                        <Text size="sm">
                          {dayjs(accountDetails?.created_at).format(
                            "DD/MM/YYYY - HH:mm",
                          )}
                        </Text>
                      </Box>
                    </Group>
                    <Group gap="xs" wrap="nowrap">
                      <IconClock
                        size={18}
                        color="var(--mantine-color-dimmed)"
                      />
                      <Box>
                        <Text size="xs" c="dimmed" fw={600}>
                          {t("users.details.fields.last_active")}
                        </Text>
                        <Text size="sm">
                          {accountDetails?.last_active
                            ? dayjs(accountDetails?.last_active).format(
                                "DD/MM/YYYY - HH:mm",
                              )
                            : t("users.details.fields.n_a")}
                        </Text>
                      </Box>
                    </Group>
                    <Group gap="xs" wrap="nowrap">
                      <IconCrownFilled
                        size={18}
                        color="var(--mantine-color-dimmed)"
                      />
                      <Box>
                        <Text size="xs" c="dimmed" fw={600}>
                          {t("users.details.fields.subscription")}
                        </Text>
                        <Text size="sm">
                          {accountDetails?.is_premium
                            ? t("users.details.fields.premium")
                            : t("users.details.fields.freemium")}
                        </Text>
                      </Box>
                    </Group>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Paper>

            {/* Danger Zone Card */}
            <Paper
              variant="primary"
              p="lg"
              radius="md"
              style={{ borderColor: "var(--mantine-color-red-light)" }}
            >
              <Title order={4} c="red" mb="md">
                {t("users.details.danger_zone")}
              </Title>

              {accountDetails?.deleted_at ? (
                <Box>
                  <Text size="sm" c="dimmed" mb="sm">
                    {t("users.details.modals.recover_text")}
                  </Text>
                  <Button
                    variant="primary"
                    onClick={openRecover}
                    loading={isPendingRecover}
                  >
                    {t("users.details.actions.recover")}
                  </Button>
                </Box>
              ) : (
                <Stack gap="md">
                  {/* Edit Info */}
                  <Group justify="space-between" align="center" wrap="nowrap">
                    <Box>
                      <Text size="sm" fw={600}>
                        {t("users.details.actions.edit")}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {t("users.edit_modal.title", {
                          defaultValue:
                            "Modify account's username, contact information, etc.",
                        })}
                      </Text>
                    </Box>
                    <Group gap="xs" wrap="nowrap">
                      {role === "admin" && accountId != user?.id && (
                        <Tooltip label={t("users.details.tooltips.edit_admin")}>
                          <IconInfoCircleFilled
                            size={16}
                            color="var(--mantine-color-dimmed)"
                          />
                        </Tooltip>
                      )}
                      <Button
                        variant="edit"
                        onClick={openEdit}
                        disabled={role === "admin" && accountId != user?.id}
                      >
                        {t("users.details.actions.edit")}
                      </Button>
                    </Group>
                  </Group>

                  <Divider />

                  {/* Change Password */}
                  <Box>
                    <Group justify="space-between" align="center" mb="sm">
                      <Box>
                        <Text size="sm" fw={600}>
                          {t("users.details.actions.change_password")}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {t("users.details.modals.password_title")}
                        </Text>
                      </Box>
                      {role === "admin" && accountId != user?.id && (
                        <Tooltip
                          label={t("users.details.tooltips.password_admin")}
                        >
                          <IconInfoCircleFilled
                            size={16}
                            color="var(--mantine-color-dimmed)"
                          />
                        </Tooltip>
                      )}
                    </Group>
                    <form
                      onSubmit={(e: React.FormEvent) => {
                        e.preventDefault();
                        openChangePassword();
                      }}
                    >
                      <Flex
                        gap="xs"
                        direction={{ base: "column", sm: "row" }}
                        align="flex-start"
                      >
                        <PasswordStrengthInput
                          style={{ flex: 1, width: "100%" }}
                          variant="body-color"
                          placeholder={t(
                            "users.details.modals.password_placeholder",
                          )}
                          value={password}
                          disabled={
                            isPendingPasswordUpdate ||
                            (role === "admin" && accountId != user?.id)
                          }
                          leftSection={<IconLock size={14} />}
                          onChange={(event) => {
                            const value = event.currentTarget.value;
                            setPassword(value);
                            handleValidatePassword(value);
                          }}
                          error={passwordError}
                          required
                        />
                        <PasswordInput
                          leftSection={<IconLock size={14} />}
                          variant="body-color"
                          style={{ flex: 1, width: "100%" }}
                          value={confirmPassword}
                          placeholder={t(
                            "users.details.modals.password_confirm_placeholder",
                          )}
                          onChange={(event) => {
                            const value = event.currentTarget.value;
                            setConfirmPassword(value);
                            handleValidateConfirmPassword(value);
                          }}
                          disabled={
                            isPendingPasswordUpdate ||
                            (role === "admin" && accountId != user?.id)
                          }
                          error={confirmPasswordError}
                          required
                        />
                      </Flex>
                      <Button
                        variant="edit"
                        mt="sm"
                        onClick={openChangePassword}
                        loading={isPendingPasswordUpdate}
                        disabled={
                          (role === "admin" && accountId != user?.id) ||
                          !password ||
                          !confirmPassword ||
                          !!passwordError ||
                          !!confirmPasswordError
                        }
                      >
                        {t("users.details.actions.change_password")}
                      </Button>
                      <Modal
                        opened={openedChangePassword}
                        onClose={closeChangePassword}
                        title={t("users.details.modals.password_title")}
                      >
                        {t("users.details.modals.password_text", {
                          defaultValue:
                            "Are you sure you change password for this account? The old password will be replaced by the new one.",
                        })}
                        <Group mt="lg" justify="flex-end">
                          <Button onClick={closeChangePassword} variant="grey">
                            {t("common:actions.cancel", {
                              defaultValue: "Cancel",
                            })}
                          </Button>
                          <Button
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                              handleChangePassword(e)
                            }
                            variant="edit"
                            loading={isPendingPasswordUpdate}
                          >
                            {t("users.details.actions.change_password")}
                          </Button>
                        </Group>
                      </Modal>
                    </form>
                  </Box>

                  <Divider />

                  {/* Ban Account */}
                  <Group justify="space-between" align="center" wrap="nowrap">
                    <Box>
                      <Text size="sm" fw={600}>
                        {is_banned
                          ? t("users.details.actions.unban")
                          : t("users.details.actions.ban")}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {is_banned
                          ? t("users.details.modals.unban_text")
                          : t("users.details.modals.ban_text")}
                      </Text>
                    </Box>
                    <Group gap="xs" wrap="nowrap">
                      {role === "admin" &&
                        accountId != user?.id &&
                        !is_banned && (
                          <Tooltip
                            label={t("users.details.tooltips.ban_admin", {
                              defaultValue: "Cannot ban an admin",
                            })}
                          >
                            <IconInfoCircleFilled
                              size={16}
                              color="var(--mantine-color-dimmed)"
                            />
                          </Tooltip>
                        )}
                      <Button
                        variant={!is_banned ? "delete" : "primary"}
                        onClick={openBan}
                        disabled={role === "admin" || isPendingToggleBan}
                      >
                        {!is_banned
                          ? t("users.details.actions.ban")
                          : t("users.details.actions.unban")}
                      </Button>
                    </Group>
                  </Group>

                  <Divider />

                  {/* Delete Account */}
                  <Group justify="space-between" align="center" wrap="nowrap">
                    <Box>
                      <Text size="sm" fw={600}>
                        {t("users.details.actions.delete")}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {t("users.details.modals.delete_text")}
                      </Text>
                    </Box>
                    <Button
                      variant="delete"
                      onClick={openDelete}
                      disabled={role === "admin" && accountId != user?.id}
                    >
                      {t("users.details.actions.delete")}
                    </Button>
                  </Group>
                </Stack>
              )}
            </Paper>
          </Stack>
        </Grid.Col>

        {/* Right Column: Statistics & Activities */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="md">
            {!accountDetails?.deleted_at && (
              <Paper variant="primary" p="lg" radius="md">
                <Title order={4} mb="md">
                  {t("users.details.activities")}
                </Title>

                <Stack gap="md">
                  {role === "user" && (
                    <>
                      <Paper
                        withBorder
                        p="sm"
                        radius="md"
                        style={{
                          backgroundColor: "var(--mantine-color-default-hover)",
                        }}
                      >
                        <Group justify="space-between">
                          <Group gap="xs">
                            <IconPackage
                              size={20}
                              color="var(--upagain-neutral-green)"
                            />
                            <Text size="sm" fw={600}>
                              {t("users.details.fields.total_deposits")}
                            </Text>
                          </Group>
                          {isAccountStatsLoading ? (
                            <Skeleton height={20} width={40} />
                          ) : (
                            <Text size="lg" fw={700}>
                              {accountStats?.total_deposits}
                            </Text>
                          )}
                        </Group>
                      </Paper>

                      <Paper
                        withBorder
                        p="sm"
                        radius="md"
                        style={{
                          backgroundColor: "var(--mantine-color-default-hover)",
                        }}
                      >
                        <Group justify="space-between">
                          <Group gap="xs">
                            <IconBox
                              size={20}
                              color="var(--upagain-neutral-green)"
                            />
                            <Text size="sm" fw={600}>
                              {t("users.details.fields.total_listings")}
                            </Text>
                          </Group>
                          {isAccountStatsLoading ? (
                            <Skeleton height={20} width={40} />
                          ) : (
                            <Text size="lg" fw={700}>
                              {accountStats?.total_listings}
                            </Text>
                          )}
                        </Group>
                      </Paper>

                      <Paper
                        withBorder
                        p="sm"
                        radius="md"
                        style={{
                          backgroundColor: "var(--mantine-color-default-hover)",
                        }}
                      >
                        <Group justify="space-between">
                          <Group gap="xs">
                            <IconCash
                              size={20}
                              color="var(--upagain-neutral-green)"
                            />
                            <Text size="sm" fw={600}>
                              Total spendings
                            </Text>
                          </Group>
                          {isAccountStatsLoading ? (
                            <Skeleton height={20} width={40} />
                          ) : (
                            <Text size="lg" fw={700}>
                              {accountStats?.total_spendings} €
                            </Text>
                          )}
                        </Group>
                      </Paper>
                    </>
                  )}

                  {role === "employee" && (
                    <>
                      <Paper
                        withBorder
                        p="sm"
                        radius="md"
                        style={{
                          backgroundColor: "var(--mantine-color-default-hover)",
                        }}
                      >
                        <Group justify="space-between">
                          <Group gap="xs">
                            <IconCalendarStats
                              size={20}
                              color="var(--upagain-neutral-green)"
                            />
                            <Text size="sm" fw={600}>
                              {t("users.details.fields.total_events")}
                            </Text>
                          </Group>
                          {isAccountStatsLoading ? (
                            <Skeleton height={20} width={40} />
                          ) : (
                            <Text size="lg" fw={700}>
                              {accountStats?.total_events}
                            </Text>
                          )}
                        </Group>
                      </Paper>

                      <Paper
                        withBorder
                        p="sm"
                        radius="md"
                        style={{
                          backgroundColor: "var(--mantine-color-default-hover)",
                        }}
                      >
                        <Group justify="space-between">
                          <Group gap="xs">
                            <IconFileText
                              size={20}
                              color="var(--upagain-neutral-green)"
                            />
                            <Text size="sm" fw={600}>
                              {t("users.details.fields.total_posts")}
                            </Text>
                          </Group>
                          {isAccountStatsLoading ? (
                            <Skeleton height={20} width={40} />
                          ) : (
                            <Text size="lg" fw={700}>
                              {accountStats?.total_posts}
                            </Text>
                          )}
                        </Group>
                      </Paper>

                      <Box mt="xs">
                        <Button
                          fullWidth
                          variant="primary"
                          size="sm"
                          onClick={openCalendar}
                        >
                          Show current tasks
                        </Button>
                      </Box>
                    </>
                  )}

                  {role === "pro" && (
                    <>
                      <Paper
                        withBorder
                        p="sm"
                        radius="md"
                        style={{
                          backgroundColor: "var(--mantine-color-default-hover)",
                        }}
                      >
                        <Group justify="space-between">
                          <Group gap="xs">
                            <IconPackage
                              size={20}
                              color="var(--upagain-neutral-green)"
                            />
                            <Text size="sm" fw={600}>
                              {t(
                                "users.details.fields.total_listings_purchased",
                              )}
                            </Text>
                          </Group>
                          {isAccountStatsLoading ? (
                            <Skeleton height={20} width={40} />
                          ) : (
                            <Text size="lg" fw={700}>
                              {accountStats?.total_listings}
                            </Text>
                          )}
                        </Group>
                      </Paper>

                      <Paper
                        withBorder
                        p="sm"
                        radius="md"
                        style={{
                          backgroundColor: "var(--mantine-color-default-hover)",
                        }}
                      >
                        <Group justify="space-between">
                          <Group gap="xs">
                            <IconBox
                              size={20}
                              color="var(--upagain-neutral-green)"
                            />
                            <Text size="sm" fw={600}>
                              {t(
                                "users.details.fields.total_deposits_purchased",
                              )}
                            </Text>
                          </Group>
                          {isAccountStatsLoading ? (
                            <Skeleton height={20} width={40} />
                          ) : (
                            <Text size="lg" fw={700}>
                              {accountStats?.total_deposits}
                            </Text>
                          )}
                        </Group>
                      </Paper>

                      <Paper
                        withBorder
                        p="sm"
                        radius="md"
                        style={{
                          backgroundColor: "var(--mantine-color-default-hover)",
                        }}
                      >
                        <Group justify="space-between">
                          <Group gap="xs">
                            <IconFileText
                              size={20}
                              color="var(--upagain-neutral-green)"
                            />
                            <Text size="sm" fw={600}>
                              {t("users.details.fields.total_projects")}
                            </Text>
                          </Group>
                          {isAccountStatsLoading ? (
                            <Skeleton height={20} width={40} />
                          ) : (
                            <Text size="lg" fw={700}>
                              {accountStats?.total_projects}
                            </Text>
                          )}
                        </Group>
                      </Paper>

                      <Paper
                        withBorder
                        p="sm"
                        radius="md"
                        style={{
                          backgroundColor: "var(--mantine-color-default-hover)",
                        }}
                      >
                        <Group justify="space-between">
                          <Group gap="xs">
                            <IconCash
                              size={20}
                              color="var(--upagain-neutral-green)"
                            />
                            <Text size="sm" fw={600}>
                              Total spendings
                            </Text>
                          </Group>
                          {isAccountStatsLoading ? (
                            <Skeleton height={20} width={40} />
                          ) : (
                            <Text size="lg" fw={700}>
                              {accountStats?.total_spendings} €
                            </Text>
                          )}
                        </Group>
                      </Paper>
                    </>
                  )}
                </Stack>
              </Paper>
            )}
          </Stack>
        </Grid.Col>
      </Grid>
      {/* // modal delete */}
      <Modal
        opened={openedDelete}
        onClose={closeDelete}
        title={t("users.details.modals.delete_title")}
      >
        {t("users.details.modals.delete_text")}
        <Group mt="lg" justify="flex-end">
          <Button onClick={closeDelete} variant="grey">
            {t("common:actions.cancel", { defaultValue: "Cancel" })}
          </Button>
          <Button
            onClick={() => {
              handleDeleteAccount();
            }}
            variant="delete"
            loading={deletionMutation.isPending}
          >
            {t("users.details.actions.delete")}
          </Button>
        </Group>
      </Modal>

      {/* // modal ban */}
      <Modal
        opened={openedBan}
        onClose={closeBan}
        title={
          !is_banned
            ? t("users.details.modals.ban_title")
            : t("users.details.modals.unban_title")
        }
      >
        {!is_banned
          ? t("users.details.modals.ban_text")
          : t("users.details.modals.unban_text")}
        <Group mt="lg" justify="flex-end">
          <Button onClick={closeBan} variant="grey">
            {t("common:actions.cancel", { defaultValue: "Cancel" })}
          </Button>
          <Button
            onClick={handleBan}
            variant={!is_banned ? "delete" : "primary"}
            loading={isPendingToggleBan}
          >
            {!is_banned
              ? t("users.details.actions.ban")
              : t("users.details.actions.unban")}
          </Button>
        </Group>
      </Modal>

      {/* // modal recover */}
      <Modal
        opened={openedRecover}
        onClose={closeRecover}
        title={t("users.details.modals.recover_title")}
      >
        {t("users.details.modals.recover_text")}
        <Group mt="lg" justify="flex-end">
          <Button onClick={closeRecover} variant="grey">
            {t("common:actions.cancel", { defaultValue: "Cancel" })}
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

      {/* edit modal */}
      <Modal
        title={t("users.edit_modal.title")}
        opened={openedEdit}
        onClose={closeEdit}
        centered
      >
        <Stack>
          <TextInput
            data-autofocus
            withAsterisk
            label={t("users.edit_modal.username")}
            value={usernameEdit}
            placeholder={t("users.edit_modal.username")}
            onChange={(e) => {
              setUsernameEdit(e.target.value);
              handleValidateUsernameEdit(e.target.value);
            }}
            onBlur={() => handleValidateUsernameEdit(usernameEdit)}
            error={usernameEditError}
            required
          />
          <TextInput
            withAsterisk
            label={t("users.edit_modal.email")}
            value={emailEdit}
            placeholder={t("users.edit_modal.email")}
            onChange={(e) => {
              setEmailEdit(e.target.value);
              handleValidateEmailEdit(e.target.value);
            }}
            onBlur={() => handleValidateEmailEdit(emailEdit)}
            error={emailEditError}
            required
          />
          <TextInput
            label={t("users.edit_modal.phone")}
            value={phoneEdit}
            placeholder={t("users.edit_modal.phone")}
            onChange={(e) => {
              setPhoneEdit(e.target.value);
              handleValidatePhoneEdit(e.target.value);
            }}
            onBlur={() => handleValidatePhoneEdit(phoneEdit)}
            error={phoneEditError}
            disabled={disablePhoneEdit}
          />
        </Stack>
        <Group mt="lg" justify="center">
          <Button onClick={closeEdit} variant="grey">
            {t("users.edit_modal.cancel")}
          </Button>
          <Button
            onClick={(e) => {
              handleEditAccount(e);
            }}
            variant="primary"
            loading={editMutation.isPending}
          >
            {t("users.edit_modal.submit")}
          </Button>
        </Group>
      </Modal>

      {/* // calendar modal */}
      <Modal
        size="lg"
        title={
          <Text fw={700}>
            {t("users.details.modals.calendar_title", {
              username: accountDetails?.username,
              defaultValue: `${accountDetails?.username}'s work schedule`,
            })}
          </Text>
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
                      return (
                        eventStartVal >= dayStartVal &&
                        eventStartVal <= dayEndVal
                      );
                    }
                    return (
                      eventStartVal <= dayEndVal && eventEndVal > dayStartVal
                    );
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
                          allTasksInPast
                            ? "red"
                            : "var(--upagain-neutral-green)"
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
