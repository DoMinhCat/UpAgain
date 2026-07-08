import AdminTable from "../../../components/admin/AdminTable";
import {
  Container,
  Group,
  Stack,
  Box,
  Paper,
  Title,
  Text,
  Badge,
  Avatar,
  Divider,
  Grid,
  Alert,
  Table,
  Image,
  CopyButton,
  Tooltip,
  ActionIcon,
  ThemeIcon,
  Loader,
  Center,
  Button,
  SimpleGrid,
  PinInput,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconHistory,
  IconKey,
  IconUserShield,
  IconCheck,
  IconCopy,
  IconChecklist,
  IconInfoCircle,
  IconWeight,
  IconBox,
  IconLeaf,
  IconMapPin,
  IconEdit,
  IconCalendar,
  IconCircleCheck,
  IconPackage,
  IconBuildingStore,
  IconTrash,
  IconChevronRight,
  IconDownload,
} from "@tabler/icons-react";
import MyBreadcrumbs from "../../../components/nav/MyBreadcrumbs";
import { useTranslation } from "react-i18next";
import { PATHS } from "../../../routes/paths";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { PhotosCarousel } from "../../../components/photo/PhotosCarousel";
import { useState } from "react";
import { resolveUrl } from "../../../utils/imageUtils";
import {
  useConfirmItemRetrieval,
  useGetItemDetails,
  useGetItemTransactions,
  useGetLatestTransactionOfPro,
} from "../../../hooks/itemHooks";
import FullScreenSkeleton from "../../../components/common/FullScreenSkeleton";
import DOMPurify from "dompurify";
import { useGetListingDetails } from "../../../hooks/listingHooks";
import {
  useGetDepositCodesOfLatestTransaction,
  useGetDepositDetails,
} from "../../../hooks/depositHooks";
import { useDisclosure } from "@mantine/hooks";
import { EditItemModal } from "../../../components/marketplace/EditItemModal";
import { DeleteItemModal } from "../../../components/marketplace/DeleteItemModal";
import { TransferContainerModal } from "../../../components/market/TransferContainerModal";
import { ConfirmCancelReservationModal } from "../../../components/market/ConfirmCancelReservationModal";
import { ConfirmPurchaseModal } from "../../../components/market/ConfirmPurchaseModal";
import { useDeleteItem } from "../../../hooks/itemHooks";
import { useTransferDepositContainer } from "../../../hooks/depositHooks";
import dayjs from "dayjs";
import PaginationFooter from "../../../components/common/PaginationFooter";
import type { Barcode } from "../../../api/interfaces/barcode";
import { NotFoundPage } from "../../error/404";
import { useContainerDetails } from "../../../hooks/containerHooks";
import EmbeddedMap from "../../../components/common/EmbeddedMap";
import { useHandleVerifyItemPurchase } from "../../../hooks/stripeHooks";

// ── helpers ──────────────────────────────────────────────────────────────────
function AccessCodeCard({
  code,
  label,
  icon,
  onDownload,
}: {
  code: Barcode;
  label: string;
  icon: React.ReactNode;
  onDownload?: () => void;
}) {
  const { t } = useTranslation(["common", "marketplace"]);
  return (
    <Paper variant="primary" p="lg" radius="md" withBorder>
      <Stack gap="sm">
        <Group justify="space-between">
          <Group gap="xs">
            <ThemeIcon size="sm" variant="light">
              {icon}
            </ThemeIcon>
            <Text size="sm" fw={700}>
              {label}
            </Text>
          </Group>
          <Badge
            size="xs"
            variant="outline"
            color={
              code.status === "used"
                ? "gray"
                : code.status === "expired"
                  ? "red"
                  : "green"
            }
          >
            {code.status.toUpperCase()}
          </Badge>
        </Group>
        <Stack gap={4} align="center">
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
            6-DIGITS CODE
          </Text>
          <Group gap={4}>
            <Title order={3}>
              {code.code.slice(0, 3)} {code.code.slice(3)}
            </Title>
            <CopyButton value={code.code} timeout={3000}>
              {({ copied, copy }) => (
                <Tooltip
                  label={
                    copied
                      ? t("actions.copied", { defaultValue: "Copied" })
                      : t("actions.copy", { defaultValue: "Copy" })
                  }
                  withArrow
                >
                  <ActionIcon
                    color={copied ? "teal" : "gray"}
                    variant="subtle"
                    onClick={copy}
                  >
                    {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                  </ActionIcon>
                </Tooltip>
              )}
            </CopyButton>
          </Group>
          <Image
            src={resolveUrl(code.path)}
            radius="md"
            alt="Barcode"
            mt="xs"
            fallbackSrc="https://placehold.co/400x200?text=Barcode"
          />
          <Text size="xs" c="dimmed" ta="center">
            {t("valid_from", { defaultValue: "Valid from:" })}{" "}
            {dayjs(code.valid_from).format("DD/MM/YYYY HH:mm")}
          </Text>
          <Text size="xs" c="dimmed" ta="center">
            {t("valid_to", { defaultValue: "Valid to:" })}{" "}
            {dayjs(code.valid_to).format("DD/MM/YYYY HH:mm")}
          </Text>
          {onDownload && code.barcode_base64 && (
            <Button
              variant="cta"
              size="xs"
              mt="sm"
              fullWidth
              leftSection={<IconDownload size={14} />}
              onClick={onDownload}
            >
              {t("marketplace:my_item_detail.download_barcode")}
            </Button>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}

function TransactionTable({
  transactionsData,
  isLoading,
  activePage,
  setPage,
  limit,
}: {
  transactionsData: any;
  isLoading: boolean;
  activePage: number;
  setPage: (p: number) => void;
  limit: number;
}) {
  const { t } = useTranslation(["marketplace", "admin", "common"]);
  const txs = transactionsData?.transactions || [];
  return (
    <Stack gap="md">
      <Group gap="sm">
        <IconHistory size={20} color="var(--upagain-neutral-green)" />
        <Title order={4}>
          {t("admin:listings.details.transactions.title")}
        </Title>
      </Group>
      <AdminTable
        loading={isLoading}
        header={[
          t("admin:validations.table.executed_on"),
          t("admin:history.table.transaction_id"),
          t("marketplace:detail.buyer"),
          t("admin:users.details.fields.status"),
        ]}
        footer={
          transactionsData?.total_transactions > 0 ? (
            <PaginationFooter
              activePage={activePage}
              setPage={setPage}
              total_records={transactionsData?.total_transactions || 0}
              last_page={transactionsData?.last_page || 1}
              limit={limit}
              unit="transactions"
            />
          ) : undefined
        }
      >
        {txs.length > 0 ? (
          txs.map((trx: any) => (
            <Table.Tr key={trx.id}>
              <Table.Td ta="center">
                {dayjs(trx.created_at).format("DD/MM/YYYY HH:mm")}
              </Table.Td>
              <Table.Td ta="center">
                <Text size="xs" ff="monospace">
                  {trx.id_transaction}
                </Text>
              </Table.Td>
              <Table.Td ta="center">{trx.username_pro || "—"}</Table.Td>
              <Table.Td ta="center">
                <Badge
                  color={
                    trx.action === "purchased"
                      ? "green"
                      : trx.action === "cancelled"
                        ? "red"
                        : trx.action === "expired"
                          ? "yellow"
                          : "blue"
                  }
                >
                  {trx.action.charAt(0).toUpperCase() + trx.action.slice(1)}
                </Badge>
              </Table.Td>
            </Table.Tr>
          ))
        ) : (
          <Table.Tr>
            <Table.Td ta="center" colSpan={4}>
              {t("admin:listings.details.transactions.no_transactions")}
            </Table.Td>
          </Table.Tr>
        )}
      </AdminTable>
    </Stack>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function MyItemDetail() {
  const navigate = useNavigate();
  const { t } = useTranslation(["marketplace", "home", "common", "admin"]);
  const { user } = useAuth();
  const role = user?.role ?? "user"; // "user" | "pro"
  const params = useParams();
  const id_item = Number(params.id);
  const isValidId = !isNaN(id_item) && id_item > 0;

  // photo lightbox
  const [lightboxOpened, setLightboxOpened] = useState(false);
  const [lightboxSlide] = useState(0);

  const [openedEdit, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);
  const [openedDelete, { open: openDelete, close: closeDelete }] =
    useDisclosure(false);
  const [openedTransfer, { open: openTransfer, close: closeTransfer }] =
    useDisclosure(false);
  const [openedCancel, { open: openCancel, close: closeCancel }] =
    useDisclosure(false);
  const [openedPurchase, { open: openPurchase, close: closePurchase }] =
    useDisclosure(false);

  // VERIFY ITEM PURCHASE
  const { isVerifying } = useHandleVerifyItemPurchase(id_item);

  const deleteItemMutation = useDeleteItem();

  const handleDelete = () => {
    deleteItemMutation.mutate(id_item, {
      onSuccess: () => {
        closeDelete();
        navigate(PATHS.MARKETPLACE.ME);
      },
    });
  };

  const transferMutation = useTransferDepositContainer(id_item);

  const handleTransfer = (id_new_container: number) => {
    transferMutation.mutate(
      {
        id_new_container,
        id_current_container: depositDetails?.container_id || 0,
      },
      {
        onSuccess: () => {
          closeTransfer();
        },
      },
    );
  };

  // confirmation code input (user → submit 6-digit code to confirm retrieval)
  const [confirmCode, setConfirmCode] = useState("");
  const handleSetConfirmCode = (val: string) => {
    setConfirmCode(val.toUpperCase());
  };

  // transactions pagination
  const [activePage, setPage] = useState(1);
  const limit = 5;

  // ── data ──────────────────────────────────────────────────────────────────
  const {
    data: item,
    isLoading: isLoadingItem,
    isError: isItemError,
  } = useGetItemDetails(id_item, isValidId);
  const isListing = item?.category === "listing";
  const isDeposit = item?.category === "deposit";

  const { data: listingDetails, isLoading: isListingDetailsLoading } =
    useGetListingDetails(id_item, isValidId && isListing);
  const { data: depositDetails, isLoading: isDepositDetailsLoading } =
    useGetDepositDetails(id_item, isValidId && isDeposit);
  const { data: containerDetails, isLoading: isContainerDetailsLoading } =
    useContainerDetails(
      depositDetails?.container_id || 0,
      isValidId && isDeposit && !!depositDetails?.container_id,
    );

  // Only users see transaction history (pro role removed by backend)
  const { data: latestTx, isLoading: isLoadingProTransaction } =
    useGetLatestTransactionOfPro(id_item, isValidId && role === "pro");
  const { data: transactionsData, isLoading: isLoadingTransactions } =
    useGetItemTransactions(id_item, isValidId && role === "user");
  const hasActiveTransaction = !!(
    transactionsData?.transactions?.[0] &&
    (transactionsData.transactions[0].action === "reserved" ||
      transactionsData.transactions[0].action === "purchased")
  );

  // Deposit codes accessible to both roles now (backend updated)
  const { data: depositCodes, isLoading: isLoadingDepositCodes } =
    useGetDepositCodesOfLatestTransaction(id_item, isValidId && isDeposit);
  const handleDownloadBarcode = (barcodeBase64: string) => {
    const link = document.createElement("a");
    link.href = barcodeBase64;
    link.download = `barcode-${role === "pro" ? latestTx?.id_transaction : transactionsData?.transactions?.[0].id_transaction}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CONFIRM RETRIEVAL CODE
  const confirmRetrieval = useConfirmItemRetrieval(id_item);
  const handleConfirmRetrieval = () => {
    confirmRetrieval.mutate({ confirm_code: confirmCode });
  };

  if (
    isLoadingItem ||
    isListingDetailsLoading ||
    isDepositDetailsLoading ||
    isContainerDetailsLoading ||
    isLoadingProTransaction
  )
    return <FullScreenSkeleton />;

  if (isItemError || (role === "pro" && (!latestTx || latestTx.id_pro === 0))) {
    return <NotFoundPage />;
  }

  // deposit code helpers
  const userDepositCode = depositCodes?.find(
    (code) => code.user_type === "user",
  );
  const proDepositCode = depositCodes?.find((code) => code.user_type === "pro");
  // For pro, their code is the "pro" code; for user, it's the "user" code
  const myDepositCode: Barcode | undefined =
    role === "pro" ? proDepositCode : userDepositCode;

  // ── derived state flags ───────────────────────────────────────────────────
  const isPending = item?.status === "pending";
  const isRefused = item?.status === "refused";
  const isApproved = item?.status === "approved";
  const isCompleted = item?.status === "completed";

  const isReserved = latestTx?.action === "reserved";
  const isPurchased =
    role === "pro"
      ? latestTx?.action === "purchased" && !isCompleted
      : !!(
          transactionsData?.transactions?.[0] &&
          transactionsData?.transactions[0].action === "purchased"
        ) && !isCompleted; // bought but not completed
  const isCancelled = latestTx?.action === "cancelled";

  const renderLeftAccessInfoCard = () => {
    if (!isDeposit) return null;

    if (role === "pro") {
      if (isReserved || isPurchased) {
        return (
          <Paper p="xl" radius="lg" withBorder shadow="sm" variant="primary">
            <Stack gap="md">
              <Group gap="sm">
                <IconKey size={20} color="var(--upagain-neutral-green)" />
                <Title order={4}>
                  {t("admin:listings.details.access_info")}
                </Title>
              </Group>
              {isLoadingDepositCodes ? (
                <Center py="md">
                  <Loader size="sm" />
                </Center>
              ) : myDepositCode &&
                myDepositCode.code.length > 0 &&
                myDepositCode.path.length > 0 ? (
                <>
                  <AccessCodeCard
                    code={myDepositCode}
                    label={t("admin:listings.details.buyer")}
                    icon={<IconUserShield size={14} />}
                    onDownload={() =>
                      handleDownloadBarcode(myDepositCode.barcode_base64)
                    }
                  />
                  {myDepositCode.status === "used" ? (
                    <Alert
                      icon={<IconCircleCheck size={16} />}
                      color="teal"
                      variant="light"
                      mt="md"
                    >
                      {t(
                        "marketplace:my_item_detail.retrieved_from_container",
                        {
                          defaultValue:
                            "You have retrieved this item from the container.",
                        },
                      )}
                    </Alert>
                  ) : (
                    <Button
                      variant="primary"
                      size="lg"
                      mt="md"
                      fullWidth
                      disabled={dayjs().isBefore(
                        dayjs(myDepositCode.valid_from),
                      )}
                      onClick={() =>
                        navigate(PATHS.CONTAINERS.OPEN, {
                          state: {
                            id_container: depositDetails?.container_id,
                            item_title: item?.title,
                            item_id: item?.id,
                          },
                        })
                      }
                    >
                      {t("marketplace:open_container.open_now")}
                    </Button>
                  )}
                </>
              ) : isPurchased ? (
                <Text size="sm" c="dimmed" style={{ lineHeight: 1.5 }}>
                  {t("marketplace:my_item_detail.waiting_for_dropoff")}
                </Text>
              ) : (
                <Text size="sm" c="dimmed">
                  {t("admin:listings.details.no_access_code")}
                </Text>
              )}
            </Stack>
          </Paper>
        );
      }
    } else {
      if (isReserved || isPurchased) {
        return (
          <Paper p="xl" radius="lg" withBorder shadow="sm" variant="primary">
            <Stack gap="md">
              <Group gap="sm">
                <IconKey size={20} color="var(--upagain-neutral-green)" />
                <Title order={4}>
                  {t("admin:listings.details.access_info")}
                </Title>
              </Group>
              {isLoadingDepositCodes ? (
                <Center py="md">
                  <Loader size="sm" />
                </Center>
              ) : userDepositCode ? (
                <>
                  <AccessCodeCard
                    code={userDepositCode}
                    label={t("admin:listings.details.owner")}
                    icon={<IconUserShield size={14} />}
                    onDownload={() =>
                      handleDownloadBarcode(userDepositCode.barcode_base64)
                    }
                  />
                  {userDepositCode.status === "used" ? (
                    <Alert
                      icon={<IconCircleCheck size={16} />}
                      color="teal"
                      variant="light"
                    >
                      {t("marketplace:my_item_detail.deposit_in_container")}
                    </Alert>
                  ) : (
                    <>
                      <Alert
                        icon={<IconInfoCircle size={16} />}
                        color="blue"
                        variant="light"
                      >
                        {t("marketplace:my_item_detail.drop_off_reminder")}
                        {depositDetails && (
                          <Text fw={700} mt={4}>
                            Container #{depositDetails.container_id}
                          </Text>
                        )}
                      </Alert>
                      <Button
                        variant="primary"
                        size="lg"
                        disabled={dayjs().isBefore(
                          dayjs(userDepositCode.valid_from),
                        )}
                        onClick={() =>
                          navigate(PATHS.CONTAINERS.OPEN, {
                            state: {
                              id_container: depositDetails?.container_id,
                              item_title: item?.title,
                              item_id: item?.id,
                            },
                          })
                        }
                      >
                        {t("marketplace:open_container.open_now")}
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <Text size="sm" c="dimmed">
                  {t("admin:listings.details.no_access_code")}
                </Text>
              )}
            </Stack>
          </Paper>
        );
      }
    }
    return null;
  };

  /** PRO right panel */
  const ProRightPanel = () => {
    if (isReserved) {
      return (
        <Stack gap="lg">
          <Paper p="xl" radius="lg" withBorder shadow="sm" variant="primary">
            <Stack gap="md">
              <Group gap="sm">
                <IconCalendar size={20} color="var(--upagain-neutral-green)" />
                <Title order={4}>
                  {t("marketplace:my_item_detail.reservation_details")}
                </Title>
              </Group>
              <Alert icon={<IconInfoCircle size={16} />}>
                {t("marketplace:my_item_detail.pro_reserved_info")}
              </Alert>
              {latestTx && (
                <Stack gap={4}>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    {t("marketplace:my_item_detail.reserved_until")}
                  </Text>
                  <Text fw={700} size="lg" c="orange">
                    {dayjs(latestTx?.reservation_expiry).format(
                      "DD/MM/YYYY - HH:mm A",
                    )}
                  </Text>
                </Stack>
              )}
              <Button
                variant="primary"
                fullWidth
                size="md"
                rightSection={<IconChevronRight size={16} />}
                onClick={openPurchase}
              >
                {t("marketplace:detail.buy")}
              </Button>
              <Button variant="delete" fullWidth size="md" onClick={openCancel}>
                {t("marketplace:detail.cancel_reservation", {
                  defaultValue: "Cancel Reservation",
                })}
              </Button>
            </Stack>
          </Paper>
        </Stack>
      );
    }

    if (isCompleted) {
      return (
        <Paper p="xl" radius="lg" withBorder shadow="sm" variant="primary">
          <Stack gap="sm" align="center">
            <IconCircleCheck size={48} color="var(--mantine-color-teal-6)" />
            <Title order={4} ta="center">
              {t("marketplace:my_item_detail.completed_title")}
            </Title>
            {latestTx && (
              <Text size="sm" c="dimmed" ta="center">
                {t("marketplace:my_item_detail.completed_on", {
                  date: dayjs(latestTx.created_at).format(
                    "DD/MM/YYYY - HH:mm A",
                  ),
                })}
              </Text>
            )}
          </Stack>
        </Paper>
      );
    }

    if (isCancelled) {
      return (
        <Paper p="xl" radius="lg" withBorder shadow="sm" variant="primary">
          <Stack gap="sm" align="center">
            <IconAlertCircle size={48} color="var(--mantine-color-red-6)" />
            <Title order={4} ta="center" c="red.6">
              {t("marketplace:my_item_detail.cancelled_title", {
                defaultValue: "Reservation Cancelled",
              })}
            </Title>
            {latestTx && (
              <Text size="sm" c="dimmed" ta="center">
                {t("marketplace:my_item_detail.cancelled_on", {
                  date: dayjs(latestTx.created_at).format(
                    "DD/MM/YYYY - HH:mm A",
                  ),
                })}
              </Text>
            )}
          </Stack>
        </Paper>
      );
    }

    if (isPurchased || isReserved) {
      return (
        <Stack gap="lg">
          {isPurchased && (
            <Paper p="xl" radius="lg" withBorder shadow="sm" variant="primary">
              <Stack gap="md">
                <Group gap="sm">
                  <IconCircleCheck
                    size={20}
                    color="var(--upagain-neutral-green)"
                  />
                  <Title order={4}>
                    {t("marketplace:my_item_detail.purchase_details", {
                      defaultValue: "Purchase Details",
                    })}
                  </Title>
                </Group>

                {latestTx && (
                  <Stack gap={4}>
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                      {t("marketplace:my_item_detail.purchased_on_label", {
                        defaultValue: "Purchased On",
                      })}
                    </Text>
                    <Text fw={700}>
                      {dayjs(latestTx.created_at).format(
                        "DD/MM/YYYY - HH:mm A",
                      )}
                    </Text>
                  </Stack>
                )}
              </Stack>
            </Paper>
          )}

          {/* Location info */}
          <Paper p="xl" radius="lg" withBorder shadow="sm" variant="primary">
            <Stack gap="md">
              <Group gap="sm">
                <IconMapPin size={20} color="var(--upagain-neutral-green)" />
                <Title order={4}>
                  {t("marketplace:my_item_detail.retrieval_location")}
                </Title>
              </Group>
              {isListing && listingDetails && (
                <Stack gap={4}>
                  <Text size="sm" c="dimmed">
                    {t("marketplace:my_item_detail.meet_at")}
                  </Text>
                  <Text fw={700}>
                    {listingDetails.street}, {listingDetails.city}{" "}
                    {listingDetails.postal_code}
                  </Text>
                </Stack>
              )}
              {isDeposit && depositDetails && (
                <Stack gap={4}>
                  <Text size="sm" c="dimmed">
                    {t("marketplace:my_item_detail.container_id")} #
                    {depositDetails.container_id}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {`${containerDetails?.street}, ${containerDetails?.postal_code} ${containerDetails?.city_name}`}
                  </Text>
                </Stack>
              )}
            </Stack>
          </Paper>

          {/* Purchase confirmation for listing: pro gives code to user */}
          {isListing && (
            <Paper p="xl" radius="lg" withBorder shadow="sm" variant="primary">
              <Stack gap="md">
                <Group gap="sm">
                  <IconChecklist
                    size={20}
                    color="var(--upagain-neutral-green)"
                  />
                  <Title order={4}>
                    {t("marketplace:my_item_detail.confirmation_code_title")}
                  </Title>
                </Group>
                <Alert icon={<IconInfoCircle size={16} />}>
                  {t("marketplace:my_item_detail.pro_confirm_instructions")}
                </Alert>
                <Paper variant="primary" p="lg" radius="md" withBorder>
                  <Stack gap={4} align="center">
                    <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                      {t("marketplace:my_item_detail.confirmation_code_title")}
                    </Text>
                    <Title order={2} c="var(--upagain-neutral-green)">
                      {latestTx?.confirm_code}
                    </Title>
                  </Stack>
                </Paper>
              </Stack>
            </Paper>
          )}
        </Stack>
      );
    }

    return null;
  };

  /** USER right panel */
  const UserRightPanel = () => {
    const showActionButtons = !isCompleted;

    const ActionButtons = () =>
      showActionButtons ? (
        <>
          <Tooltip
            label={t("marketplace:my_item_detail.active_transaction_tooltip", {
              defaultValue:
                "This action is disabled because there is currently an active transaction.",
            })}
            disabled={!hasActiveTransaction}
          >
            <div>
              <Button
                variant="secondary"
                size="lg"
                disabled={hasActiveTransaction}
                fullWidth
                onClick={openEdit}
                leftSection={<IconEdit size={18} />}
              >
                {t("marketplace:detail.edit")}
              </Button>
            </div>
          </Tooltip>
          {isDeposit && (
            <Tooltip
              label={t(
                "marketplace:my_item_detail.active_transaction_tooltip",
                {
                  defaultValue:
                    "This action is disabled because there is currently an active transaction.",
                },
              )}
              disabled={!hasActiveTransaction}
            >
              <div>
                <Button
                  variant="secondary"
                  size="lg"
                  disabled={hasActiveTransaction}
                  fullWidth
                  onClick={openTransfer}
                  leftSection={<IconBox size={18} />}
                >
                  {t("marketplace:detail.transfer_container", {
                    defaultValue: "Transfer container",
                  })}
                </Button>
              </div>
            </Tooltip>
          )}
          <Tooltip
            label={t("marketplace:my_item_detail.active_transaction_tooltip", {
              defaultValue:
                "This action is disabled because there is currently an active transaction.",
            })}
            disabled={!hasActiveTransaction}
          >
            <div>
              <Button
                variant="delete"
                disabled={hasActiveTransaction}
                size="lg"
                fullWidth
                onClick={openDelete}
                leftSection={<IconTrash size={18} />}
              >
                {t("marketplace:detail.delete")}
              </Button>
            </div>
          </Tooltip>
        </>
      ) : null;

    if (isPending) {
      return (
        <Stack gap="md">
          <Alert
            icon={<IconInfoCircle size={18} />}
            color="yellow"
            variant="light"
            title={t("marketplace:my_item_detail.pending_title")}
          >
            {t("marketplace:my_item_detail.pending_info")}
          </Alert>
          <ActionButtons />
        </Stack>
      );
    }

    if (isRefused) {
      return (
        <Stack gap="md">
          <Alert
            icon={<IconAlertCircle size={18} />}
            color="red"
            variant="light"
            title={t("marketplace:my_item_detail.refused_title")}
          >
            {item?.refuse_reason ||
              t("marketplace:my_item_detail.no_refuse_reason")}
          </Alert>
          <ActionButtons />
        </Stack>
      );
    }

    if (isReserved && isApproved) {
      // approved + reserved: show who reserved it and expiry
      return (
        <Stack gap="md">
          <Paper p="lg" radius="lg" withBorder shadow="sm" variant="primary">
            <Stack gap="sm">
              <Group gap="sm">
                <IconBuildingStore
                  size={20}
                  color="var(--upagain-neutral-green)"
                />
                <Title order={4}>
                  {t("marketplace:my_item_detail.reserved_by")}
                </Title>
              </Group>
              <Text fw={700}>{latestTx?.username_pro || "—"}</Text>
              <Text size="xs" c="dimmed">
                {dayjs(latestTx?.reservation_expiry).format("DD/MM/YYYY")}
              </Text>
            </Stack>
          </Paper>
          <ActionButtons />
        </Stack>
      );
    }

    if (isPurchased) {
      // bought but not completed
      return (
        <Stack gap="lg">
          <Paper p="lg" radius="lg" withBorder shadow="sm" variant="primary">
            <Stack gap="sm">
              <Group gap="sm">
                <IconPackage size={20} color="var(--upagain-neutral-green)" />
                <Title order={4}>{t("marketplace:detail.buyer")}</Title>
              </Group>
              <Text fw={700}>
                {transactionsData?.transactions?.[0]?.username_pro || "—"}
              </Text>
              {transactionsData?.transactions?.[0] && (
                <Text size="xs" c="dimmed">
                  {t("marketplace:my_item_detail.purchased_on", {
                    defaultValue: "Purchased on {{date}}",
                    date: dayjs(
                      transactionsData?.transactions?.[0].created_at,
                    ).format("DD/MM/YYYY - HH:mm A"),
                  })}
                </Text>
              )}
            </Stack>
          </Paper>

          {isListing && (
            <Paper p="xl" radius="lg" withBorder shadow="sm" variant="primary">
              <Stack gap="md">
                <Group gap="sm">
                  <IconChecklist
                    size={20}
                    color="var(--upagain-neutral-green)"
                  />
                  <Title order={4}>
                    {t("marketplace:my_item_detail.confirm_retrieval")}
                  </Title>
                </Group>
                <Text size="sm" c="dimmed">
                  {t("marketplace:my_item_detail.enter_code_instruction")}
                </Text>
                <PinInput
                  length={6}
                  type="alphanumeric"
                  size="lg"
                  placeholder="-"
                  oneTimeCode
                  disabled={confirmRetrieval.isPending}
                  value={confirmCode}
                  onChange={(val) => handleSetConfirmCode(val)}
                  aria-label="6-Digit Access Code"
                />
                <Button
                  variant="primary"
                  fullWidth
                  disabled={confirmCode.replace(" ", "").length < 6}
                  onClick={handleConfirmRetrieval}
                  loading={confirmRetrieval.isPending}
                >
                  {t("marketplace:my_item_detail.confirm_button")}
                </Button>
              </Stack>
            </Paper>
          )}

          <ActionButtons />
        </Stack>
      );
    }

    if (isCompleted) {
      return (
        <Paper p="xl" radius="lg" withBorder shadow="sm" variant="primary">
          <Stack gap="sm" align="center">
            <IconCircleCheck size={48} color="var(--mantine-color-teal-6)" />
            <Title order={4} ta="center">
              {t("marketplace:my_item_detail.completed_title")}
            </Title>
            <Text size="sm" c="dimmed" ta="center">
              {t("marketplace:detail.buyer")}:{" "}
              <strong>
                {transactionsData?.transactions[0].username_pro || "—"}
              </strong>
            </Text>
            {transactionsData && transactionsData.total_transactions > 0 && (
              <Text size="xs" c="dimmed">
                {t("marketplace:my_item_detail.completed_on", {
                  date: dayjs(
                    transactionsData?.transactions[0].created_at,
                  ).format("DD/MM/YYYY"),
                })}
              </Text>
            )}
          </Stack>
        </Paper>
      );
    }

    // approved (no transaction)
    return (
      <Stack gap="md">
        <ActionButtons />
      </Stack>
    );
  };

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <Container size="xl" pb={100} pt={24}>
      <Stack gap="lg">
        <MyBreadcrumbs
          mb="xl"
          mt="md"
          breadcrumbs={[
            { title: t("home:title"), href: PATHS.HOME },
            { title: t("marketplace:market"), href: PATHS.MARKETPLACE.HOME },
            { title: t("marketplace:my_listings"), href: PATHS.MARKETPLACE.ME },
            { title: item?.title || "Item details", href: "#" },
          ]}
        />

        <Grid gap="xl">
          {/* ── LEFT ── */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap="xl">
              {/* Status row */}
              <Group justify="flex-start" align="center" wrap="wrap">
                <Text size="sm" c="dimmed">
                  {t("marketplace:my_item_detail.posted_on", {
                    date: dayjs(item?.created_at).format("DD/MM/YYYY"),
                  })}
                </Text>
              </Group>

              {/* Photo carousel */}
              {item?.images && item?.images.length > 0 && (
                <Box>
                  <PhotosCarousel photos={item?.images} initialSlide={0} />
                </Box>
              )}

              <Title order={2}>{item?.title}</Title>

              {/* Seller details */}
              <Group gap="sm">
                <Avatar
                  src={resolveUrl(item?.creator_avatar || "")}
                  name={item?.username}
                  radius="xl"
                  size="md"
                />
                <Stack gap={2}>
                  <Text
                    size="xs"
                    c="dimmed"
                    fw={700}
                    tt="uppercase"
                    style={{ letterSpacing: "0.5px" }}
                  >
                    {t("marketplace:my_item_detail.seller", {
                      defaultValue: "Seller",
                    })}
                  </Text>
                  <Text fw={700} size="sm">
                    {item?.username || "—"}
                  </Text>
                </Stack>
              </Group>

              {/* Key info grid */}
              <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
                {[
                  {
                    icon: (
                      <IconWeight
                        size={20}
                        color="var(--upagain-neutral-green)"
                      />
                    ),
                    label: t("marketplace:detail.weight"),
                    value: `${item?.weight || ""} kg`,
                  },
                  {
                    icon: (
                      <IconLeaf
                        size={20}
                        color="var(--upagain-neutral-green)"
                      />
                    ),
                    label: "Score",
                    value: item?.score,
                  },
                  {
                    icon: (
                      <IconBox size={20} color="var(--upagain-neutral-green)" />
                    ),
                    label: t("marketplace:detail.state"),
                    value: t(`common:states.${item?.state || ""}`, {
                      defaultValue: item?.state,
                    }),
                  },
                  {
                    icon: (
                      <IconMapPin
                        size={20}
                        color="var(--upagain-neutral-green)"
                      />
                    ),
                    label: t("marketplace:detail.retrieval.title"),
                    value:
                      item?.category === "listing"
                        ? t("marketplace:detail.retrieval.listing")
                        : t("marketplace:detail.retrieval.deposit"),
                  },
                ].map(({ icon, label, value }) => (
                  <Paper
                    key={label}
                    p="md"
                    radius="md"
                    withBorder
                    variant="primary"
                  >
                    <Stack gap={4} align="center">
                      {icon}
                      <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                        {label}
                      </Text>
                      <Text fw={800} size="sm" ta="center">
                        {String(value)}
                      </Text>
                    </Stack>
                  </Paper>
                ))}
              </SimpleGrid>

              {renderLeftAccessInfoCard()}

              <Divider />

              {/* Description */}
              <Stack gap="sm">
                <Title order={4}>{t("marketplace:detail.about")}</Title>
                <Text
                  size="sm"
                  style={{ lineHeight: 1.6 }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(item?.description || ""),
                  }}
                />
              </Stack>

              <Divider />

              {/* Location */}
              <Stack gap="sm">
                <Title order={4}>{t("marketplace:detail.location")}</Title>
                <Group gap="sm" align="flex-start">
                  <IconMapPin size={20} color="var(--upagain-neutral-green)" />
                  <Stack gap={2}>
                    {isListing && listingDetails ? (
                      <Text size="sm" fw={700}>
                        {listingDetails.street}, {listingDetails.city}{" "}
                        {listingDetails.postal_code}
                      </Text>
                    ) : isDeposit && depositDetails ? (
                      <>
                        <Text size="sm" fw={700}>
                          {t("marketplace:my_item_detail.container_id")} #
                          {depositDetails.container_id}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {`${containerDetails?.street}, ${containerDetails?.postal_code} ${containerDetails?.city_name}`}
                        </Text>
                      </>
                    ) : (
                      <Text size="sm" c="dimmed">
                        {t("marketplace:detail.map_placeholder")}
                      </Text>
                    )}
                  </Stack>
                </Group>

                {((isListing && listingDetails?.lat && listingDetails?.lng) ||
                  (isDeposit &&
                    depositDetails?.lat &&
                    depositDetails?.lng)) && (
                  <EmbeddedMap
                    height={300}
                    locations={[
                      {
                        id: id_item,
                        lat: isListing
                          ? listingDetails!.lat
                          : depositDetails!.lat,
                        lng: isListing
                          ? listingDetails!.lng
                          : depositDetails!.lng,
                        label: isListing
                          ? t("marketplace:detail.location")
                          : t("marketplace:my_item_detail.container_id") +
                            ` #${depositDetails?.container_id}`,
                      },
                    ]}
                    centerOnId={id_item}
                    zoom={15}
                  />
                )}
              </Stack>

              <Divider />

              {/* Transaction history — user only, and only when relevant */}
              {role === "user" &&
                (isApproved || isReserved || isPurchased || isCompleted) && (
                  <TransactionTable
                    transactionsData={transactionsData}
                    isLoading={isLoadingTransactions}
                    activePage={activePage}
                    setPage={setPage}
                    limit={limit}
                  />
                )}
            </Stack>
          </Grid.Col>

          {/* ── RIGHT ── */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="lg" style={{ position: "sticky", top: 90 }}>
              {/* Price */}
              <Paper
                p="xl"
                radius="lg"
                withBorder
                shadow="sm"
                variant="primary"
              >
                <Stack gap="xs" align="center">
                  <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                    {t("marketplace:detail.price")}
                  </Text>
                  <Title order={1} c="var(--upagain-neutral-green)">
                    {item?.price && item.price > 0
                      ? `${item.price}€`
                      : t("common:free")}
                  </Title>
                </Stack>
              </Paper>

              {/* Role-specific panels */}
              {isDeposit && (
                <Paper
                  p="xl"
                  radius="lg"
                  withBorder
                  shadow="sm"
                  variant="primary"
                >
                  <Stack gap="sm">
                    <Group gap="sm">
                      <IconInfoCircle
                        size={18}
                        color="var(--upagain-neutral-green)"
                      />
                      <Text size="sm" fw={600}>
                        {t("marketplace:detail.retrieval.title")}
                      </Text>
                    </Group>
                    <Text size="sm" c="dimmed">
                      {t("marketplace:detail.retrieval.deposit")}
                    </Text>
                  </Stack>
                </Paper>
              )}
              {role === "pro" ? ProRightPanel() : UserRightPanel()}
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>

      {/* Lightbox — externally controlled */}
      <PhotosCarousel
        photos={item?.images || []}
        opened={lightboxOpened}
        onClose={() => setLightboxOpened(false)}
        defaultActiveSlide={lightboxSlide}
      />

      {role === "user" && item && (
        <EditItemModal
          opened={openedEdit}
          onClose={closeEdit}
          item={item!}
          listingDetails={listingDetails}
        />
      )}
      {role === "user" && (
        <>
          <DeleteItemModal
            opened={openedDelete}
            onClose={closeDelete}
            onConfirm={handleDelete}
            loading={deleteItemMutation.isPending}
            title={t("marketplace:detail.delete")}
          />
          <TransferContainerModal
            opened={openedTransfer}
            onClose={closeTransfer}
            onConfirm={handleTransfer}
            isLoading={transferMutation.isPending}
            currentContainerId={depositDetails?.container_id}
          />
        </>
      )}

      <ConfirmCancelReservationModal
        opened={openedCancel}
        onClose={closeCancel}
        idItem={id_item}
      />
      <ConfirmPurchaseModal
        opened={openedPurchase}
        onClose={closePurchase}
        idItem={id_item}
        itemTitle={item?.title}
        price={item?.price}
        isVerifying={isVerifying}
      />
    </Container>
  );
}
