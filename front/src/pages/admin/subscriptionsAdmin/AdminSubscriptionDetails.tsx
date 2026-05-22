import {
  Container,
  Title,
  Paper,
  Stack,
  Group,
  Text,
  Avatar,
  Badge,
  Button,
  Modal,
  Textarea,
  ThemeIcon,
  Anchor,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { IconCrown, IconX } from "@tabler/icons-react";
import dayjs from "dayjs";
import FullScreenLoader from "../../../components/common/FullScreenLoader";
import InfoField from "../../../components/common/InfoField";
import { PATHS } from "../../../routes/paths";
import {
  useGetSubscriptionByID,
  useRevokeSubscription,
} from "../../../hooks/subscriptionHooks";
import { useGetUserInvoices } from "../../../hooks/financeHooks";
import { generateInvoicePDF } from "../../../utils/invoiceUtils";
import { showErrorNotification } from "../../../components/common/NotificationToast";
import { useState } from "react";
import MyBreadcrumbs from "../../../components/nav/MyBreadcrumbs";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function AdminSubscriptionDetails() {
  const { t } = useTranslation("admin");
  const location = useLocation();
  const origin = location.state;

  const { id } = useParams();
  const navigate = useNavigate();
  const subscriptionId = id ? parseInt(id) : 0;
  const isValidId = !isNaN(subscriptionId) && subscriptionId > 0;

  const [openedRevoke, { open: openRevoke, close: closeRevoke }] =
    useDisclosure(false);
  const [cancelReason, setCancelReason] = useState("");

  const {
    data: sub,
    isLoading,
    isError,
  } = useGetSubscriptionByID(subscriptionId);
  const revokeMutation = useRevokeSubscription();

  const { data: invoicesData, isLoading: isLoadingInvoices } =
    useGetUserInvoices(sub?.id_pro ?? 0, !!sub?.id_pro);

  const handleDownloadInvoice = () => {
    if (!invoicesData || !invoicesData.invoices) {
      showErrorNotification(
        t("common:notifications.loading"),
        t("subscriptions.details.notifications.invoice_loading_error", {
          defaultValue: "Invoices data is not yet available, please try again.",
        }),
      );
      return;
    }
    const invoice = invoicesData.invoices.find(
      (i) => i.type === "subscription" && i.id === subscriptionId,
    );
    if (invoice) {
      generateInvoicePDF(invoice, invoicesData.username);
    } else {
      showErrorNotification(
        t("common:notifications.not_found"),
        t("subscriptions.details.notifications.invoice_not_found", {
          defaultValue: "No invoice found for this subscription.",
        }),
      );
    }
  };

  const handleRevoke = () => {
    revokeMutation.mutate(
      { id: subscriptionId, cancel_reason: cancelReason },
      {
        onSuccess: () => {
          closeRevoke();
          navigate(PATHS.ADMIN.SUBSCRIPTIONS.ALL);
        },
      },
    );
  };

  if (isLoading) return <FullScreenLoader />;
  if (!isValidId || isError)
    return <Navigate to={PATHS.ADMIN.SUBSCRIPTIONS.ALL} replace />;

  return (
    <Container px="md" size="xl">
      <Title order={2} mt="lg">
        {t("subscriptions.details.title")}
      </Title>
      <MyBreadcrumbs
        breadcrumbs={[
          ...(origin?.from === "ANYTHING YOU WANT TO REDIRECT FROM"
            ? [
                {
                  title: "History Details",
                  href: "#",
                },
              ]
            : [
                {
                  title: t("subscriptions.title"),
                  href: PATHS.ADMIN.SUBSCRIPTIONS.ALL,
                },
              ]),
          {
            title: t("subscriptions.details.title"),
            href: PATHS.ADMIN.SUBSCRIPTIONS.ALL + "/" + id,
          },
        ]}
      />

      <Container px="md" size="sm" mt="xl">
        <Stack justify="center" align="center" mb="xl">
          <div style={{ position: "relative", width: "fit-content" }}>
            {/* The Crown Container */}
            <ThemeIcon
              size={40}
              radius="xl"
              color={sub?.is_active ? "var(--upagain-yellow)" : "gray"}
              style={{
                position: "absolute",
                top: -15,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 2,
                border: "2px solid white",
              }}
            >
              <IconCrown size={24} />
            </ThemeIcon>

            {/* The Avatar */}
            <Avatar
              src={sub?.avatar}
              size="xl"
              radius="xl"
              name={sub?.username}
              color="initials"
            />
          </div>
          <Anchor
            onClick={() =>
              navigate(PATHS.ADMIN.USERS.ALL + "/" + sub?.id_pro, {
                state: { from: "SubscriptionDetails", id_sub: sub?.id },
              })
            }
            c="inherit"
          >
            <Title order={2}>{sub?.username}</Title>
          </Anchor>
          <Badge
            color={sub?.is_active ? "var(--upagain-neutral-green)" : "red"}
            size="lg"
          >
            {sub?.is_active
              ? t("subscriptions.tabs.active")
              : t("subscriptions.tabs.canceled")}
          </Badge>
        </Stack>

        <Title order={3} ta="left" mt="xl">
          {t("subscriptions.details.general_info")}
        </Title>
        <Paper variant="primary" px="lg" py="md" mt="sm" radius="lg">
          <InfoField label={t("common:actions.type")}>
            <Text
              ps="sm"
              mt="xs"
              mb="xl"
              c={sub?.is_trial ? "dimmed" : "var(--upagain-yellow)"}
              fw={700}
            >
              {sub?.is_trial
                ? t("subscriptions.filters.types.trial")
                : t("subscriptions.filters.types.premium")}
            </Text>
          </InfoField>
          <InfoField label={t("subscriptions.table.start_date")}>
            <Text ps="sm" mt="xs" mb="xl">
              {dayjs(sub?.sub_from).format("DD/MM/YYYY - HH:mm")}
            </Text>
          </InfoField>
          <InfoField label={t("subscriptions.table.end_date")}>
            <Text ps="sm" mt="xs" mb="xl">
              {dayjs(sub?.sub_to).format("DD/MM/YYYY - HH:mm")}
            </Text>
          </InfoField>
          {!sub?.is_active && sub?.cancel_reason && (
            <InfoField label={t("subscriptions.table.cancel_reason")}>
              <Text ps="sm" mt="xs" c="dimmed">
                {sub.cancel_reason}
              </Text>
            </InfoField>
          )}
        </Paper>

        <Title order={3} ta="left" mt="xl">
          {t("finance.invoices.title")}
        </Title>
        <Paper variant="primary" px="lg" py="md" mt="sm" radius="lg">
          <InfoField label={t("finance.invoices.title")}>
            <Button
              variant="primary"
              ps="sm"
              mt="xs"
              mb="xl"
              onClick={handleDownloadInvoice}
              loading={isLoadingInvoices}
            >
              {t("subscriptions.details.billing_info")}
            </Button>
          </InfoField>
        </Paper>

        {sub?.is_active && (
          <>
            <Title order={3} ta="left" mt="xl" c="red">
              {t("containers.details.danger_zone")}
            </Title>
            <Paper
              variant="primary"
              px="lg"
              py="md"
              mt="sm"
              radius="lg"
              style={{ border: "1px solid #ff000033" }}
            >
              <InfoField label={t("subscriptions.details.cancel_subscription")}>
                <Text c="dimmed" size="sm" mt="xs">
                  {t("subscriptions.details.cancel_subscription_desc")}
                </Text>
                <Button
                  mt="xs"
                  variant="delete"
                  leftSection={<IconX size={16} />}
                  onClick={openRevoke}
                >
                  {t("subscriptions.details.cancel_subscription")}
                </Button>
              </InfoField>
            </Paper>
          </>
        )}
      </Container>

      <Modal
        opened={openedRevoke}
        onClose={closeRevoke}
        title={t("subscriptions.details.cancel_modal.title")}
        centered
      >
        <Textarea
          label={t("subscriptions.details.cancel_modal.reason_label")}
          placeholder={t(
            "subscriptions.details.cancel_modal.reason_placeholder",
          )}
          value={cancelReason}
          onChange={(e) => setCancelReason(e.currentTarget.value)}
          minRows={3}
        />
        <Group mt="xl" justify="flex-end">
          <Button variant="grey" onClick={closeRevoke}>
            {t("common:actions.cancel")}
          </Button>
          <Button
            variant="delete"
            loading={revokeMutation.isPending}
            disabled={!cancelReason.trim()}
            onClick={handleRevoke}
          >
            {t("common:actions.confirm")}
          </Button>
        </Group>
      </Modal>
    </Container>
  );
}
