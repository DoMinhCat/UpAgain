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
import AdminBreadcrumbs from "../../../components/nav/AdminBreadcrumbs";
import { useLocation } from "react-router-dom";

export default function AdminSubscriptionDetails() {
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
        "Loading",
        "Invoices data is not yet available, please try again.",
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
        "Not Found",
        "No invoice found for this subscription.",
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
        Subscription Details
      </Title>
      <AdminBreadcrumbs
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
                  title: "Subscription Management",
                  href: PATHS.ADMIN.SUBSCRIPTIONS.ALL,
                },
              ]),
          {
            title: "Subscription Details",
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
            {sub?.is_active ? "Active" : "Canceled"}
          </Badge>
        </Stack>

        <Title order={3} ta="left" mt="xl">
          Subscription Information
        </Title>
        <Paper variant="primary" px="lg" py="md" mt="sm">
          <InfoField label="Type">
            <Text
              ps="sm"
              mt="xs"
              mb="xl"
              c={sub?.is_trial ? "dimmed" : "var(--upagain-yellow)"}
              fw={700}
            >
              {sub?.is_trial ? "Trial" : "Premium"}
            </Text>
          </InfoField>
          <InfoField label="Start Date">
            <Text ps="sm" mt="xs" mb="xl">
              {dayjs(sub?.sub_from).format("DD/MM/YYYY - HH:mm")}
            </Text>
          </InfoField>
          <InfoField label="End Date">
            <Text ps="sm" mt="xs" mb="xl">
              {dayjs(sub?.sub_to).format("DD/MM/YYYY - HH:mm")}
            </Text>
          </InfoField>
          {!sub?.is_active && sub?.cancel_reason && (
            <InfoField label="Cancel Reason">
              <Text ps="sm" mt="xs" c="dimmed">
                {sub.cancel_reason}
              </Text>
            </InfoField>
          )}
        </Paper>

        <Title order={3} ta="left" mt="xl">
          Invoice
        </Title>
        <Paper variant="primary" px="lg" py="md" mt="sm">
          <InfoField label="Invoice">
            <Button
              variant="primary"
              ps="sm"
              mt="xs"
              mb="xl"
              onClick={handleDownloadInvoice}
              loading={isLoadingInvoices}
            >
              Download invoice
            </Button>
          </InfoField>
        </Paper>

        {sub?.is_active && (
          <>
            <Title order={3} ta="left" mt="xl" c="red">
              Danger Zone
            </Title>
            <Paper
              variant="primary"
              px="lg"
              py="md"
              mt="sm"
              style={{ border: "1px solid #ff000033" }}
            >
              <InfoField label="Revoke Subscription">
                <Text c="dimmed" size="sm" mt="xs">
                  This will immediately cancel the user's premium access.
                </Text>
                <Button
                  mt="xs"
                  variant="delete"
                  leftSection={<IconX size={16} />}
                  onClick={openRevoke}
                >
                  Revoke Subscription
                </Button>
              </InfoField>
            </Paper>
          </>
        )}
      </Container>

      <Modal
        opened={openedRevoke}
        onClose={closeRevoke}
        title="Revoke Subscription"
        centered
      >
        <Textarea
          label="Cancel Reason"
          placeholder="Explain why the subscription is being revoked..."
          value={cancelReason}
          onChange={(e) => setCancelReason(e.currentTarget.value)}
          minRows={3}
        />
        <Group mt="xl" justify="flex-end">
          <Button variant="grey" onClick={closeRevoke}>
            Cancel
          </Button>
          <Button
            variant="delete"
            loading={revokeMutation.isPending}
            disabled={!cancelReason.trim()}
            onClick={handleRevoke}
          >
            Confirm Revoke
          </Button>
        </Group>
      </Modal>
    </Container>
  );
}
