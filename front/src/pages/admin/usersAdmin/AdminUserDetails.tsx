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

import FullScreenLoader from "../../../components/common/FullScreenLoader";
import InfoField from "../../../components/common/InfoField";
import dayjs from "dayjs";
import PasswordStrengthInput, {
  requirements,
} from "../../../components/input/PasswordStrengthInput";
import { IconLock, IconInfoCircleFilled } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { useAuth } from "../../../context/AuthContext";

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
  const validatePassword = (val: string) => {
    if (!val) {
      setPasswordError(t("users.errors.password_required"));
      return false;
    }
    if (val.length < 12) {
      setPasswordError(t("users.errors.password_min"));
      return false;
    }
    if (val.length > 60) {
      setPasswordError(t("users.errors.password_max"));
      return false;
    }
    if (!requirements.every((requirement) => requirement.re.test(val))) {
      setPasswordError(t("users.errors.password_complexity"));
      return false;
    }
    setPasswordError(null);
    return true;
  };

  const validateConfirmPassword = (val: string) => {
    if (!val) {
      setConfirmPasswordError(t("users.errors.confirm_required"));
      return false;
    } else if (val !== password) {
      setConfirmPasswordError(t("users.errors.confirm_mismatch"));
      return false;
    }
    setConfirmPasswordError(null);
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
    <Container px="md" size="xl">
      <Title order={2} mt="lg">
        {t("users.details.title")}
      </Title>
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
                    { title: t("events.title"), href: PATHS.ADMIN.EVENTS.ALL },
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
                        title: t("posts.details.title", { defaultValue: "Post's Details" }),
                        href: PATHS.ADMIN.POSTS + "/" + origin?.id_post,
                      },
                    ]
                  : origin?.from === "historyDetails"
                    ? [
                        {
                          title: t("history.title"),
                          href:
                            PATHS.ADMIN.HISTORY.ALL + "/" + origin?.id_history,
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
                              PATHS.ADMIN.LISTINGS + "/" + origin?.listingId,
                          },
                        ]
                      : origin?.from === "SubscriptionDetails"
                        ? [
                            {
                              title: t("subscription.title", { defaultValue: "Subscription Management" }),
                              href: PATHS.ADMIN.SUBSCRIPTIONS.ALL,
                            },
                            {
                              title: t("subscription.details.title", { defaultValue: "Subscription's Details" }),
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
      <Container px="md" size="sm" mt="xl">
        {accountDetails?.role === "user" && (
          <Flex align="flex-start" justify="flex-end">
            <ScoreRing score={accountDetails.score} size={90} />
          </Flex>
        )}

        <Stack justify="center" align="center">
          <Avatar
            src={accountDetails?.avatar}
            name="User's name"
            color="initials"
            size="100"
          />
          <Title order={3}>{accountDetails?.username}</Title>
        </Stack>
        <Title order={3} ta="left" mt="xl">
          {t("users.details.general_info")}
        </Title>

        <Paper variant="primary" px="lg" py="md" mt="sm" radius="lg">
          <InfoField label={t("users.details.fields.username")}>
            <Text ps="sm" mt="xs" mb="xl">
              {accountDetails?.username}
            </Text>
          </InfoField>
          <InfoField label={t("users.details.fields.registered_on")}>
            <Text ps="sm" mt="xs" mb="xl">
              {dayjs(accountDetails?.created_at).format("DD/MM/YYYY - HH:mm")}
            </Text>
          </InfoField>
          <InfoField label={t("users.details.fields.role")}>
            {accountDetails?.role === "user" ? (
              <Text ps="sm" mt="xs" mb="xl" c="blue">
                {t("users.roles.user")}
              </Text>
            ) : accountDetails?.role === "pro" ? (
              <Text ps="sm" mt="xs" mb="xl" c="yellow">
                {t("users.roles.pro")}
              </Text>
            ) : accountDetails?.role === "employee" ? (
              <Text ps="sm" mt="xs" mb="xl" c="green">
                {t("users.roles.employee")}
              </Text>
            ) : (
              <Text ps="sm" mt="xs" mb="xl" c="red">
                {t("users.roles.admin")}
              </Text>
            )}
          </InfoField>
          <InfoField label={t("users.details.fields.status")}>
            {accountDetails?.deleted_at ? (
              <Text ps="sm" mt="xs" mb="xl" c="red">
                {t("users.details.fields.deleted")}
              </Text>
            ) : accountDetails?.is_banned ? (
              <Text ps="sm" mt="xs" mb="xl" c="red">
                {t("users.details.fields.banned")}
              </Text>
            ) : (
              <Text ps="sm" mt="xs" mb="xl" c="green">
                {t("users.details.fields.active")}
              </Text>
            )}
          </InfoField>
          <InfoField label={t("users.details.fields.subscription")}>
            {accountDetails?.is_premium ? (
              <Text
                ps="sm"
                mt="xs"
                mb="xl"
                fw={700}
                variant="gradient"
                gradient={{
                  from: "rgba(199, 165, 70, 1)",
                  to: "rgba(230, 225, 188, 1)",
                  deg: 90,
                }}
              >
                {t("users.details.fields.premium")}
              </Text>
            ) : (
              <Text ps="sm" mt="xs" mb="xl">
                {t("users.details.fields.freemium")}
              </Text>
            )}
          </InfoField>
        </Paper>

        <Title order={3} ta="left" mt="xl">
          {t("users.details.contact")}
        </Title>
        <Paper variant="primary" px="lg" py="md" mt="sm" radius="lg">
          <InfoField label={t("users.details.fields.email")}>
            <Text ps="sm" mt="xs" mb="xl">
              {accountDetails?.email}
            </Text>
          </InfoField>
          <InfoField label={t("users.details.fields.phone")}>
            <Text ps="sm" mt="xs" mb="xl">
              {accountDetails?.phone ? accountDetails?.phone : t("users.details.fields.n_a")}
            </Text>
          </InfoField>
        </Paper>

        {!accountDetails?.deleted_at && (
          <>
            <Title order={3} ta="left" mt="xl">
              {t("users.details.activities")}
            </Title>
            <Paper variant="primary" px="lg" py="md" mt="sm" radius="lg">
              <InfoField label={t("users.details.fields.last_active")}>
                <Text ps="sm" mt="xs">
                  {accountDetails?.last_active
                    ? dayjs(accountDetails?.last_active).format(
                        "DD/MM/YYYY - HH:mm",
                      )
                    : t("users.details.fields.n_a")}
                </Text>
              </InfoField>
              {role == "user" && (
                <>
                  <InfoField label={t("users.details.fields.total_deposits")} mt="xl">
                    {isAccountStatsLoading ? (
                      <Loader mb="xl" size="sm" />
                    ) : (
                      <Text ps="sm" mt="xs" mb="xl">
                        {!errorAccountDetails
                          ? accountStats?.total_deposits +
                            " " +
                            (accountStats?.total_deposits === 1
                              ? t("users.details.fields.deposit_singular")
                              : t("users.details.fields.deposit_plural")) +
                            " " +
                            t("users.details.fields.posted")
                          : t("users.details.fields.stats_error")}
                      </Text>
                    )}
                  </InfoField>
                  <InfoField label={t("users.details.fields.total_listings")}>
                    {isAccountStatsLoading ? (
                      <Loader mb="xl" size="sm" />
                    ) : (
                      <Text ps="sm" mt="xs" mb="xl">
                        {!errorAccountDetails
                          ? accountStats?.total_listings +
                            " " +
                            (accountStats?.total_listings === 1
                              ? t("users.details.fields.listing_singular")
                              : t("users.details.fields.listing_plural")) +
                            " " +
                            t("users.details.fields.posted")
                          : t("users.details.fields.stats_error")}
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
                  <InfoField label={t("users.details.fields.total_events")} mt="xl">
                    {isAccountStatsLoading ? (
                      <Loader mb="xl" size="sm" />
                    ) : (
                      <Text ps="sm" mt="xs" mb="xl">
                        {!errorAccountDetails
                          ? accountStats?.total_events +
                            " " +
                            (accountStats?.total_events === 1
                              ? t("users.details.fields.event_singular")
                              : t("users.details.fields.event_plural")) +
                            " " +
                            t("users.details.fields.assigned")
                          : t("users.details.fields.stats_error")}
                      </Text>
                    )}
                  </InfoField>
                  <InfoField label={t("users.details.fields.total_posts")}>
                    {isAccountStatsLoading ? (
                      <Loader mb="xl" size="sm" />
                    ) : (
                      <Text ps="sm" mt="xs" mb="xl">
                        {!errorAccountDetails
                          ? accountStats?.total_posts +
                            " " +
                            (accountStats?.total_posts === 1
                              ? t("users.details.fields.article_singular")
                              : t("users.details.fields.article_plural")) +
                            " " +
                            t("users.details.fields.posted")
                          : t("users.details.fields.stats_error")}
                      </Text>
                    )}
                  </InfoField>
                  <InfoField label={t("users.details.fields.current_tasks")}>
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
                  <InfoField label={t("users.details.fields.total_listings_purchased")} mt="xl">
                    {isAccountStatsLoading ? (
                      <Loader mb="xl" size="sm" />
                    ) : (
                      <Text ps="sm" mt="xs" mb="xl">
                        {!errorAccountDetails
                          ? accountStats?.total_listings +
                            " " +
                            (accountStats?.total_listings === 1
                              ? t("users.details.fields.listing_singular")
                              : t("users.details.fields.listing_plural")) +
                            " " +
                            t("users.details.fields.purchased")
                          : t("users.details.fields.stats_error")}
                      </Text>
                    )}
                  </InfoField>
                  <InfoField label={t("users.details.fields.total_deposits_purchased")}>
                    {isAccountStatsLoading ? (
                      <Loader mb="xl" size="sm" />
                    ) : (
                      <Text ps="sm" mt="xs" mb="xl">
                        {!errorAccountDetails
                          ? accountStats?.total_deposits +
                            " " +
                            (accountStats?.total_deposits === 1
                              ? t("users.details.fields.deposit_singular")
                              : t("users.details.fields.deposit_plural")) +
                            " " +
                            t("users.details.fields.purchased")
                          : t("users.details.fields.stats_error")}
                      </Text>
                    )}
                  </InfoField>
                  <InfoField label={t("users.details.fields.total_projects")}>
                    {isAccountStatsLoading ? (
                      <Loader mb="xl" size="sm" />
                    ) : (
                      <Text ps="sm" mt="xs" mb="xl">
                        {!errorAccountDetails
                          ? accountStats?.total_projects +
                            " " +
                            (accountStats?.total_projects === 1
                              ? t("users.details.fields.project_singular")
                              : t("users.details.fields.project_plural")) +
                            " " +
                            t("users.details.fields.posted")
                          : t("users.details.fields.stats_error")}
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
          {t("users.details.danger_zone")}
        </Title>
        <Paper
          variant="primary"
          px="lg"
          py="md"
          mt="sm"
          radius="lg"
          style={{ border: "1px solid #ff000033" }}
        >
          {accountDetails?.deleted_at ? (
            <InfoField label={t("users.details.actions.recover")}>
              <Box ps="sm" mb="xl">
                <Text c="dimmed" my="xs">
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
            </InfoField>
          ) : (
            <>
              <InfoField label={t("users.details.actions.edit")}>
                <Box ps="sm" mb="xl">
                  <Group gap="xs">
                    <Text c="dimmed" my="xs">
                      {t("users.edit_modal.title", { defaultValue: "Modify account's username, contact information, etc." })}
                    </Text>
                    {role === "admin" && accountId != user?.id && (
                      <Tooltip
                        label={t("users.details.tooltips.edit_admin")}
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
                    {t("users.details.actions.edit")}
                  </Button>
                </Box>
              </InfoField>

              <InfoField label={t("users.details.actions.change_password")}>
                <Box ps="sm" mb="xl">
                  <Group gap="xs">
                    <Text mt="xs" mb="xs" c="dimmed">
                      {t("users.details.modals.password_title")}
                    </Text>
                    {role === "admin" && accountId != user?.id && (
                      <Tooltip
                        label={t("users.details.tooltips.password_admin")}
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
                      placeholder={t("users.details.modals.password_placeholder")}
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
                      placeholder={t("users.details.modals.password_confirm_placeholder")}
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
                      mt="xs"
                      onClick={openChangePassword}
                      disabled={
                        isPendingPasswordUpdate ||
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
                      {t("users.details.modals.password_text", { defaultValue: "Are you sure you change password for this account? The old password will be replaced by the new one." })}
                      <Group mt="lg" justify="flex-end">
                        <Button onClick={closeChangePassword} variant="grey">
                          {t("common:actions.cancel", { defaultValue: "Cancel" })}
                        </Button>
                        <Button
                          onClick={handleChangePassword}
                          variant="edit"
                          loading={isPendingPasswordUpdate}
                        >
                          {t("users.details.actions.change_password")}
                        </Button>
                      </Group>
                    </Modal>
                  </form>
                </Box>
              </InfoField>
              <InfoField label={is_banned ? t("users.details.actions.unban") : t("users.details.actions.ban")}>
                <Box ps="sm" mb="xl">
                  <Group gap="xs">
                    <Text c="dimmed" my="xs">
                      {is_banned
                        ? t("users.details.modals.unban_text")
                        : t("users.details.modals.ban_text")}
                    </Text>
                    {role === "admin" &&
                      accountId != user?.id &&
                      !is_banned && (
                        <Tooltip
                          label={t("users.details.tooltips.ban_admin", { defaultValue: "Cannot ban an admin" })}
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
                    {!is_banned ? t("users.details.actions.ban") : t("users.details.actions.unban")}
                  </Button>
                </Box>
              </InfoField>

              <InfoField label={t("users.details.actions.delete")}>
                <Box ps="sm" mb="xl">
                  <Group gap="xs">
                    <Text c="dimmed" my="xs">
                      {t("users.details.modals.delete_text")}
                    </Text>
                    {role === "admin" && accountId != user?.id && (
                      <Tooltip
                        label={t("users.details.tooltips.edit_admin")}
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
                    {t("users.details.actions.delete")}
                  </Button>
                </Box>
              </InfoField>
            </>
          )}
        </Paper>
      </Container>
      {/* // modal delete */}
      <Modal opened={openedDelete} onClose={closeDelete} title={t("users.details.modals.delete_title")}>
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
        title={!is_banned ? t("users.details.modals.ban_title") : t("users.details.modals.unban_title")}
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
            {!is_banned ? t("users.details.actions.ban") : t("users.details.actions.unban")}
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

      {/* // edit modal */}
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
              validateUsernameEdit(e.target.value);
            }}
            onBlur={() => validateUsernameEdit(usernameEdit)}
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
              validateEmailEdit(e.target.value);
            }}
            onBlur={() => validateEmailEdit(emailEdit)}
            error={emailEditError}
            required
          />
          <TextInput
            label={t("users.edit_modal.phone")}
            value={phoneEdit}
            placeholder={t("users.edit_modal.phone")}
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
            {t("users.details.modals.calendar_title", { username: accountDetails?.username, defaultValue: `${accountDetails?.username}'s work schedule` })}
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
