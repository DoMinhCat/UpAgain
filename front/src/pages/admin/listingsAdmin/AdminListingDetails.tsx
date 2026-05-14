import {
  Container,
  Title,
  Group,
  Grid,
  Table,
  Badge,
  Button,
  Stack,
  Card,
  Text,
  Divider,
  Modal,
  Image,
  CopyButton,
  Tooltip,
  ActionIcon,
  Anchor,
  ThemeIcon,
  Paper,
  SimpleGrid,
  Loader,
  Center,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import DOMPurify from "dompurify";
import MyBreadcrumbs from "../../../components/nav/MyBreadcrumbs";
import { PATHS } from "../../../routes/paths";
import {
  IconPhoto,
  IconWood,
  IconWeight,
  IconCheck,
  IconCopy,
  IconCoinEuro,
  IconMagnet,
  IconSock,
  IconGlass,
  IconRecycle,
  IconQuestionMark,
  IconArrowsShuffle,
  IconStars,
  IconBox,
  IconMapPin,
  IconKey,
  IconUserShield,
  IconBasketCheck,
  IconX,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import AdminTable from "../../../components/admin/AdminTable";
import {
  useCancelTransaction,
  useGetItemDetails,
  useGetItemTransactions,
  useUpdateItemStatus,
} from "../../../hooks/itemHooks";
import dayjs from "dayjs";
import { PhotosCarousel } from "../../../components/photo/PhotosCarousel";
import { useState } from "react";
import { CardStatsItem } from "../../../components/dashboard/CardStatsItem";
import { showSuccessNotification } from "../../../components/common/NotificationToast";
import { useGetListingDetails } from "../../../hooks/listingHooks";
import {
  useGetDepositCodesOfLatestTransaction,
  useGetDepositDetails,
  useTransferDepositContainer,
} from "../../../hooks/depositHooks";
import FullScreenLoader from "../../../components/common/FullScreenLoader";
import PaginationFooter from "../../../components/common/PaginationFooter";
import { useProcessValidation } from "../../../hooks/validationHooks";
import { RefuseItemModal } from "../../../components/admin/RefuseItemModal";
import { TransferContainerModal } from "../../../components/market/TransferContainerModal";
import type { Transaction } from "../../../api/interfaces/transaction";
import type { CodeForAdmin } from "../../../api/interfaces/barcode";
import PhotoModal from "../../../components/photo/PhotoModal";
import { EditItemModal } from "../../../components/marketplace/EditItemModal";

export default function AdminListingDetails() {
  const { t } = useTranslation(["admin", "create_item", "common"]);
  const location = useLocation();
  const origin = location.state;
  const navigate = useNavigate();
  const params = useParams();
  const id = params.id;
  const id_item = Number(id);
  const isValidId = !isNaN(id_item) && id_item > 0;

  // DETAILS

  // GET COMMON ITEM ATTRIBUTES
  const { data: itemDetails, isLoading: isItemDetailsLoading } =
    useGetItemDetails(id_item, isValidId);

  // GET LISTING/DEPOSIT DETAILS
  const isListing = itemDetails?.category === "listing";
  const isDeposit = itemDetails?.category === "deposit";
  const { data: listingDetails, isLoading: isListingDetailsLoading } =
    useGetListingDetails(id_item, isValidId && isListing);
  const { data: depositDetails, isLoading: isDepositDetailsLoading } =
    useGetDepositDetails(id_item, isValidId && isDeposit);

  // UPDATE STATUS
  const [
    openedUpdateStatusModal,
    { open: openUpdateStatusModal, close: closeUpdateStatusModal },
  ] = useDisclosure(false);

  const updateItemStatus = useUpdateItemStatus(id_item);
  const processMutation = useProcessValidation();
  const [openedRefuse, { open: openRefuse, close: closeRefuse }] =
    useDisclosure(false);

  const handleConfirmRefuse = (reason: string) => {
    const category = itemDetails?.category;
    if (!category) return;
    const entityType = (category + "s") as "listings" | "deposits";
    processMutation.mutate(
      {
        entityType,
        id: id_item,
        action: "refuse",
        reason,
      },
      {
        onSuccess: () => {
          closeRefuse();
          navigate(PATHS.ADMIN.LISTINGS);
        },
      },
    );
  };

  const handleUpdateItemStatus = (status: string) => {
    updateItemStatus.mutate(status, {
      onSuccess: () => {
        status === "deleted"
          ? showSuccessNotification(
              t("listings.details.status_modal.delete"),
              t("common:notifications.success", {
                defaultValue: "Item deleted successfully",
              }),
            )
          : showSuccessNotification(
              t("listings.details.status_modal.approve"),
              t("common:notifications.success", {
                defaultValue: "Item status updated successfully",
              }),
            );
        navigate(PATHS.ADMIN.LISTINGS);
      },
    });
  };

  // EDIT MODAL
  const [openedEdit, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);

  // TRANSACTIONS
  const [activePage, setPage] = useState(1);
  const limit = 5;
  const {
    data: transactionsData,
    isLoading: isLoadingTransactions,
    error: errorTransactions,
  } = useGetItemTransactions(id_item, isValidId, activePage, limit);

  const transactions = transactionsData?.transactions || [];

  // FORCE CANCEL TRANSACTION
  const [cancelTransactionId, setCancelTransactionId] =
    useState<Transaction | null>(null);
  const [
    openedCancelModal,
    { open: openCancelModal, close: closeCancelModal },
  ] = useDisclosure(false);

  const handleOpenCancelModal = (transaction: Transaction) => {
    setCancelTransactionId(transaction);
    openCancelModal();
  };

  const cancelTransactionMutation = useCancelTransaction(id_item);

  const handleCancelTransaction = () => {
    cancelTransactionMutation.mutate(
      cancelTransactionId?.id_transaction || "",
      {
        onSuccess: () => {
          closeCancelModal();
        },
        onError: () => {
          closeCancelModal();
        },
      },
    );
  };

  // DEPOSIT CODES
  const [
    openedCodeCarousel,
    { open: openCodeCarousel, close: closeCodeCarousel },
  ] = useDisclosure(false);
  const [chosenCode, setChosenCode] = useState<string[]>([]);
  const { data: depositCodesData, isLoading: isLoadingDepositCodes } =
    useGetDepositCodesOfLatestTransaction(id_item, isValidId);

  const depositCodes = depositCodesData || [];
  let userCode: CodeForAdmin | undefined;
  let proCode: CodeForAdmin | undefined;
  // user code will always be generated first then pro (based on workflow I defined)
  if (depositCodes.length > 0) {
    userCode = depositCodes.find((code) => code.user_type === "user");
    if (depositCodes.length > 1) {
      proCode = depositCodes.find((code) => code.user_type === "pro");
    }
  }
  const handleCodeClick = (path: string[]) => {
    setChosenCode(path);
    openCodeCarousel();
  };
  const [
    openedTransferContainerModal,
    { open: openTransferContainerModal, close: closeTransferContainerModal },
  ] = useDisclosure(false);
  const transferContainerMutation = useTransferDepositContainer(id_item);

  const handleTransferContainer = (id_new_container: number) => {
    transferContainerMutation.mutate(
      {
        id_new_container,
        id_current_container: depositDetails?.container_id || 0,
      },
      {
        onSuccess: () => {
          closeTransferContainerModal();
        },
      },
    );
  };

  if (
    isDepositDetailsLoading ||
    isListingDetailsLoading ||
    isItemDetailsLoading
  )
    return <FullScreenLoader />;
  return (
    <Container px="md" size="xl">
      <Title order={2} mt="lg">
        {t("listings.details.title")}
      </Title>
      <MyBreadcrumbs
        mt="md"
        mb="md"
        breadcrumbs={[
          ...(origin?.from === "historyDetails"
            ? [
                {
                  title: t("history.details.title"),
                  href: PATHS.ADMIN.HISTORY.ALL + "/" + origin.id_history,
                },
              ]
            : origin?.from === "postDetails"
              ? [
                  {
                    title: t("posts.title"),
                    href: PATHS.ADMIN.POSTS,
                  },
                  {
                    title: t("posts.details.title"),
                    href: PATHS.ADMIN.POSTS + "/" + origin.id_post,
                  },
                ]
              : origin?.from === "containerDetails"
                ? [
                    {
                      title: t("containers.title"),
                      href: PATHS.ADMIN.CONTAINERS,
                    },
                    {
                      title: t("containers.details.title"),
                      href: PATHS.ADMIN.CONTAINERS + "/" + origin.idContainer,
                    },
                  ]
                : origin?.from === "validationDetail"
                  ? [
                      {
                        title: t("validations.title"),
                        href: PATHS.ADMIN.VALIDATIONS.ALL,
                      },
                      {
                        title:
                          t("validations.details.title") +
                          " #" +
                          origin.item.id_item,
                        href:
                          "/" +
                          PATHS.ADMIN.VALIDATIONS.ALL +
                          "/" +
                          origin.type +
                          "/" +
                          origin.item.id_item,
                        state: { item: origin.item, type: origin.type },
                      },
                    ]
                  : [
                      {
                        title: t("listings.title"),
                        href: PATHS.ADMIN.LISTINGS,
                      },
                    ]),
          {
            title: t("listings.details.title"),
            href: PATHS.ADMIN.LISTINGS + "/" + id,
          },
        ]}
      />

      <Container p="lg" size="xl">
        <Grid gap="xl" align="flex-start" mb="xl">
          {/* LEFT SECTION */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap={0} style={{ width: "100%" }}>
              <Group>
                <Badge
                  variant={origin?.category === "listing" ? "green" : "blue"}
                >
                  {origin?.category ?? itemDetails?.category}
                </Badge>
                <Badge
                  variant={
                    itemDetails?.status === "pending"
                      ? "yellow"
                      : itemDetails?.status === "approved"
                        ? "green"
                        : itemDetails?.status === "refused"
                          ? "red"
                          : "gray"
                  }
                >
                  {t(`status.${itemDetails?.status}` as any, {
                    defaultValue: itemDetails?.status,
                  })}
                </Badge>
              </Group>

              <Title order={2} mt="lg" mb="xs">
                {itemDetails?.title}
              </Title>
              <Text c="dimmed" size="xs" mb="xl">
                {t("listings.details.submitted_on", {
                  date: dayjs(itemDetails?.created_at).format(
                    "DD/MM/YYYY HH:mm A",
                  ),
                })}
              </Text>
              <div
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(itemDetails?.description ?? ""),
                }}
              />
            </Stack>
            {itemDetails?.images && itemDetails.images.length > 0 && (
              <>
                <Divider my="xl" />
                <Group gap="sm">
                  <IconPhoto color="var(--mantine-color-blue-6)" size={32} />
                  <Title order={3}>{t("listings.details.photos")}</Title>
                </Group>
                <div style={{ marginTop: "16px" }}>
                  <PhotosCarousel
                    photos={itemDetails?.images || []}
                    initialSlide={0}
                  />
                </div>
              </>
            )}

            {itemDetails?.category === "deposit" && (
              <>
                <Divider my="xl" />
                <Group>
                  <IconKey color="var(--mantine-color-yellow-6)" size={32} />
                  <Title order={3}>{t("listings.details.access_info")}</Title>
                </Group>
                {isLoadingDepositCodes && (
                  <Center>
                    <Loader />
                  </Center>
                )}
                {!userCode && !proCode && (
                  <Text c="dimmed" mt="lg">
                    {t("listings.details.no_access_code")}
                  </Text>
                )}
                {/* User code */}
                <SimpleGrid cols={{ base: 1, md: 2 }} mt="md" spacing={"lg"}>
                  {userCode && (
                    <Group gap="sm">
                      <Stack>
                        <Group justify="space-between">
                          <Group gap="sm">
                            <ThemeIcon>
                              <IconUserShield />
                            </ThemeIcon>
                            <Text>
                              <strong>{t("listings.details.owner")}</strong>
                            </Text>
                          </Group>
                          <Badge
                            variant={
                              userCode?.status === "used"
                                ? "gray"
                                : userCode?.status === "expired"
                                  ? "red"
                                  : "green"
                            }
                          >
                            {userCode?.status.toUpperCase()}
                          </Badge>
                        </Group>
                        <Paper variant="primary" p="lg">
                          <Title order={5} c="dimmed" ta="center">
                            {t("listings.details.six_digits_code")}
                          </Title>
                          <Group gap={"xs"} justify="center">
                            <Title order={3} ta="center" my="md">
                              {userCode?.code.slice(0, 3)}{" "}
                              {userCode?.code.slice(3)}
                            </Title>
                            <CopyButton value={userCode?.code} timeout={3000}>
                              {({ copied, copy }) => (
                                <Tooltip
                                  label={
                                    copied
                                      ? t("common:actions.copied", {
                                          defaultValue: "Copied",
                                        })
                                      : t("common:actions.copy", {
                                          defaultValue: "Copy code",
                                        })
                                  }
                                  withArrow
                                  position="right"
                                >
                                  <ActionIcon
                                    color={copied ? "teal" : "gray"}
                                    variant="subtle"
                                    onClick={copy}
                                  >
                                    {copied ? (
                                      <IconCheck size={16} />
                                    ) : (
                                      <IconCopy size={16} />
                                    )}
                                  </ActionIcon>
                                </Tooltip>
                              )}
                            </CopyButton>
                          </Group>
                          <Image
                            src={`${import.meta.env.VITE_API_BASE_URL}/${userCode?.path}`}
                            radius="md"
                            alt={"Owner's access code"}
                            fallbackSrc="https://placehold.co/600x400?text=Image+not+found"
                            style={{ cursor: "pointer" }}
                            onClick={() =>
                              handleCodeClick([userCode?.path || ""])
                            }
                          />
                          <Divider my="md" />
                          <Text c="dimmed">
                            {t("listings.details.valid_from")}
                            {dayjs(userCode?.valid_from).format(
                              "DD/MM/YYYY HH:mm A",
                            )}
                          </Text>
                          <Text c="dimmed">
                            {t("listings.details.valid_to")}
                            {dayjs(userCode?.valid_to).format(
                              "DD/MM/YYYY HH:mm A",
                            )}
                          </Text>
                        </Paper>
                      </Stack>
                    </Group>
                  )}

                  {/* Pro code */}
                  {proCode && (
                    <Group gap="sm">
                      <Stack>
                        <Group justify="space-between">
                          <Group gap="sm">
                            <ThemeIcon color="blue">
                              <IconBasketCheck />
                            </ThemeIcon>
                            <Text>
                              <strong>{t("listings.details.buyer")}</strong>
                            </Text>
                          </Group>
                          <Badge
                            variant={
                              proCode?.status === "used"
                                ? "gray"
                                : proCode?.status === "expired"
                                  ? "red"
                                  : "green"
                            }
                          >
                            {proCode?.status.toUpperCase()}
                          </Badge>
                        </Group>
                        <Paper variant="primary" p="lg">
                          <Title order={5} c="dimmed" ta="center">
                            {t("listings.details.six_digits_code")}
                          </Title>
                          <Group gap={"xs"} justify="center">
                            <Title order={3} ta="center" my="md">
                              {proCode?.code.slice(0, 3)}{" "}
                              {proCode?.code.slice(3)}
                            </Title>
                            <CopyButton value={proCode?.code} timeout={3000}>
                              {({ copied, copy }) => (
                                <Tooltip
                                  label={
                                    copied
                                      ? t("common:actions.copied", {
                                          defaultValue: "Copied",
                                        })
                                      : t("common:actions.copy", {
                                          defaultValue: "Copy code",
                                        })
                                  }
                                  withArrow
                                  position="right"
                                >
                                  <ActionIcon
                                    color={copied ? "teal" : "gray"}
                                    variant="subtle"
                                    onClick={copy}
                                  >
                                    {copied ? (
                                      <IconCheck size={16} />
                                    ) : (
                                      <IconCopy size={16} />
                                    )}
                                  </ActionIcon>
                                </Tooltip>
                              )}
                            </CopyButton>
                          </Group>
                          <Image
                            src={`${import.meta.env.VITE_API_BASE_URL}/${proCode?.path}`}
                            radius="md"
                            alt={"Buyer's access code"}
                            fallbackSrc="https://placehold.co/600x400?text=Image+not+found"
                            style={{ cursor: "pointer" }}
                            onClick={() =>
                              handleCodeClick([proCode?.path || ""])
                            }
                          />
                          <Divider my="md" />
                          <Text c="dimmed">
                            {t("listings.details.valid_from")}
                            {dayjs(userCode?.valid_from).format(
                              "DD/MM/YYYY HH:mm A",
                            )}
                          </Text>
                          <Text c="dimmed">
                            {t("listings.details.valid_to")}
                            {dayjs(userCode?.valid_to).format(
                              "DD/MM/YYYY HH:mm A",
                            )}
                          </Text>
                        </Paper>
                      </Stack>
                    </Group>
                  )}
                  {userCode && !proCode && (
                    <Stack justify="center">
                      <Text c="dimmed" mt="lg" ta="center">
                        {t("listings.details.buyer_code_waiting")}
                      </Text>
                    </Stack>
                  )}
                </SimpleGrid>
              </>
            )}
          </Grid.Col>

          {/* RIGHT SECTION */}
          <Grid.Col
            span={{ base: 12, md: 4 }}
            style={{ position: "sticky", top: "5px" }}
          >
            <Card withBorder shadow="sm" radius="md" padding="lg">
              <Card.Section withBorder inheritPadding py="xs">
                <Group justify="space-between">
                  <Text>
                    {t("listings.details.posted_by")}{" "}
                    <Anchor
                      style={{ cursor: "pointer" }}
                      c="var(--component-color-primary)"
                      onClick={() =>
                        navigate(`/admin/users/${itemDetails?.id_user}`, {
                          state: {
                            from: "listingDetail",
                            listingId: itemDetails?.id,
                          },
                        })
                      }
                    >
                      {itemDetails?.username}
                    </Anchor>
                  </Text>
                </Group>
              </Card.Section>

              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" mt="md">
                <CardStatsItem
                  icon={<IconCoinEuro size={18} />}
                  label={t("validations.table.price")}
                  color="yellow"
                  value={
                    <Text
                      span
                      c={!itemDetails?.price ? "green" : "inherit"}
                      fw={!itemDetails?.price ? 700 : 600}
                    >
                      {itemDetails?.price
                        ? `${itemDetails.price} €`
                        : t("common:free", { defaultValue: "Free" })}
                    </Text>
                  }
                />

                <CardStatsItem
                  icon={<IconWeight size={18} />}
                  label={t("listings.filters.weight")}
                  color="blue"
                  value={`${itemDetails?.weight} kg`}
                />

                <CardStatsItem
                  icon={
                    itemDetails?.material === "wood" ? (
                      <IconWood size={18} />
                    ) : itemDetails?.material === "metal" ? (
                      <IconMagnet size={18} />
                    ) : itemDetails?.material === "textile" ? (
                      <IconSock size={18} />
                    ) : itemDetails?.material === "glass" ? (
                      <IconGlass size={18} />
                    ) : itemDetails?.material === "plastic" ? (
                      <IconRecycle size={18} />
                    ) : itemDetails?.material === "other" ? (
                      <IconQuestionMark size={18} />
                    ) : (
                      <IconArrowsShuffle size={18} />
                    )
                  }
                  label={t("listings.filters.material")}
                  color="brown"
                  value={t(`common:materials.${itemDetails?.material}` as any, {
                    defaultValue:
                      itemDetails?.material.charAt(0).toUpperCase() +
                      (itemDetails?.material.slice(1) ?? ""),
                  })}
                />

                <CardStatsItem
                  icon={<IconStars size={18} />}
                  label={t("listings.filters.state")}
                  color={
                    itemDetails?.state === "new"
                      ? "green"
                      : itemDetails?.state === "very_good"
                        ? "yellow"
                        : itemDetails?.state === "good"
                          ? "orange"
                          : "red"
                  }
                  value={t(`common:states.${itemDetails?.state}` as any, {
                    defaultValue:
                      itemDetails?.state.charAt(0).toUpperCase() +
                      (itemDetails?.state.slice(1).replace(/_/g, " ") ?? ""),
                  })}
                />

                {itemDetails?.category === "listing" ? (
                  <CardStatsItem
                    icon={<IconMapPin size={18} />}
                    label={t("containers.details.location")}
                    color="white"
                    value={`${listingDetails?.street}, ${listingDetails?.city} ${listingDetails?.postal_code}`}
                  />
                ) : (
                  <CardStatsItem
                    icon={<IconBox size={18} />}
                    label={t("common:container", { defaultValue: "Container" })}
                    color="green"
                    value={
                      <Anchor
                        onClick={() =>
                          navigate(
                            `/admin/containers/${depositDetails?.container_id}`,
                            {
                              state: {
                                from: "listingDetails",
                                id_listing: itemDetails?.id,
                              },
                            },
                          )
                        }
                        style={{ cursor: "pointer" }}
                        c="var(--component-color-primary)"
                      >
                        {t("common:container", { defaultValue: "Container" })} #
                        {depositDetails?.container_id}
                      </Anchor>
                    }
                  />
                )}
              </SimpleGrid>

              {/* Footer Actions */}
              {itemDetails?.status !== "completed" && (
                <>
                  <Stack mt="xl">
                    <Group grow>
                      <Button
                        variant="edit"
                        onClick={openEdit}
                        loading={
                          isItemDetailsLoading || updateItemStatus.isPending
                          // ||
                          // updateDepositMutation.isPending ||
                          // updateListingMutation.isPending
                        }
                        disabled={
                          itemDetails?.status == "completed" ||
                          (transactions?.length > 0 &&
                            (transactions[0].action === "reserved" ||
                              transactions[0].action === "purchased"))
                        }
                        fullWidth
                      >
                        {t("listings.details.edit_item")}
                      </Button>

                      <Button
                        fullWidth
                        variant={
                          ["pending", "refused"].includes(
                            itemDetails?.status ?? "",
                          )
                            ? "primary"
                            : "delete"
                        }
                        onClick={openUpdateStatusModal}
                        disabled={
                          itemDetails?.status !== "refused" &&
                          itemDetails?.status !== "pending" &&
                          transactions?.length > 0 &&
                          (transactions[0].action === "reserved" ||
                            transactions[0].action === "purchased")
                        }
                        loading={updateItemStatus.isPending}
                      >
                        {itemDetails?.status === "refused"
                          ? t("listings.details.reopen_item")
                          : itemDetails?.status === "pending"
                            ? t("listings.details.approve_item")
                            : t("listings.details.delete_item")}
                      </Button>
                      {itemDetails?.status === "pending" && (
                        <Button
                          fullWidth
                          variant="delete"
                          leftSection={<IconX size={16} />}
                          onClick={openRefuse}
                          loading={
                            processMutation.isPending &&
                            processMutation.variables?.action === "refuse"
                          }
                        >
                          {t("admin:validations.details.actions.refuse", {
                            defaultValue: "Refuse",
                          })}
                        </Button>
                      )}
                    </Group>
                    {itemDetails?.category === "deposit" && (
                      <Button
                        fullWidth
                        variant="secondary"
                        onClick={openTransferContainerModal}
                      >
                        {t("listings.details.transfer_container")}
                      </Button>
                    )}
                  </Stack>
                </>
              )}

              {itemDetails && (
                <EditItemModal
                  opened={openedEdit}
                  onClose={closeEdit}
                  item={itemDetails}
                  listingDetails={listingDetails}
                />
              )}
            </Card>
          </Grid.Col>
        </Grid>

        <Divider my="xl" />
        <Group justify="space-between">
          <Title order={3} mb="lg">
            {t("listings.details.transactions.title")}
          </Title>
        </Group>
        <AdminTable
          loading={isLoadingTransactions}
          error={errorTransactions}
          header={[
            t("validations.table.executed_on"),
            t("history.table.transaction_id"),
            t("listings.details.buyer_username"),
            t("users.details.fields.status"),
            t("common:actions.title", { defaultValue: "Actions" }),
          ]}
        >
          {transactions && transactions.length > 0 ? (
            transactions.map((transaction: Transaction) => (
              <Table.Tr key={transaction?.id}>
                <Table.Td ta="center">
                  {dayjs(transaction?.created_at).format("DD/MM/YYYY HH:mm A")}
                </Table.Td>
                <Table.Td ta="center">{transaction?.id_transaction}</Table.Td>
                <Table.Td ta="center">
                  <Anchor
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      navigate(`/admin/users/${transaction?.id_pro}`, {
                        state: {
                          from: "listingDetail",
                          listingId: itemDetails?.id,
                        },
                      });
                    }}
                    style={{ cursor: "pointer" }}
                    c="var(--component-color-primary)"
                  >
                    {transaction?.username_pro}
                  </Anchor>
                </Table.Td>
                <Table.Td ta="center">
                  <Badge
                    color={
                      transaction?.action === "purchased"
                        ? "green"
                        : transaction?.action === "cancelled"
                          ? "red"
                          : transaction?.action === "expired"
                            ? "yellow"
                            : "blue"
                    }
                  >
                    {t(`status.${transaction?.action}` as any, {
                      defaultValue:
                        transaction?.action.charAt(0).toUpperCase() +
                        transaction?.action.slice(1),
                    })}
                  </Badge>
                </Table.Td>
                <Table.Td ta="center">
                  <Button
                    variant="delete"
                    size="xs"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      handleOpenCancelModal(transaction);
                    }}
                  >
                    {t("common:actions.cancel")}
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))
          ) : (
            <Table.Tr>
              <Table.Td ta="center" colSpan={5}>
                {t("listings.details.transactions.no_transactions")}
              </Table.Td>
            </Table.Tr>
          )}
        </AdminTable>
        {transactionsData && transactionsData.total_transactions > 0 && (
          <PaginationFooter
            activePage={activePage}
            setPage={setPage}
            total_records={transactionsData.total_transactions}
            last_page={transactionsData.last_page}
            limit={limit}
            unit="transactions"
          />
        )}
      </Container>

      <Modal
        opened={openedUpdateStatusModal}
        onClose={closeUpdateStatusModal}
        title={
          itemDetails?.status === "refused"
            ? t("listings.details.status_modal.reopen")
            : itemDetails?.status === "pending"
              ? t("listings.details.status_modal.approve")
              : t("listings.details.status_modal.delete")
        }
      >
        <Text>
          {t("listings.details.status_modal.confirm", {
            action:
              itemDetails?.status === "refused"
                ? t("common:actions.reopen", { defaultValue: "reopen" })
                : itemDetails?.status === "pending"
                  ? t("common:actions.approve", { defaultValue: "approve" })
                  : t("common:actions.delete", { defaultValue: "delete" }),
          })}
        </Text>
        <Group mt="lg" justify="end">
          <Button onClick={closeUpdateStatusModal} variant="grey">
            {t("common:actions.cancel")}
          </Button>
          <Button
            onClick={() => {
              handleUpdateItemStatus(
                itemDetails?.status === "refused" ||
                  itemDetails?.status === "pending"
                  ? "approved"
                  : "deleted",
              );
            }}
            variant={
              itemDetails?.status === "refused" ||
              itemDetails?.status === "pending"
                ? "primary"
                : "delete"
            }
            loading={updateItemStatus.isPending}
          >
            {t("common:actions.confirm")}
          </Button>
        </Group>
      </Modal>

      <Modal
        opened={openedCancelModal}
        onClose={closeCancelModal}
        title={t("listings.details.transactions.cancel_modal_title")}
        size="lg"
      >
        <Text>
          {t("listings.details.transactions.cancel_confirm", {
            id: cancelTransactionId?.id_transaction,
          })}
        </Text>
        <Group mt="lg" justify="end">
          <Button onClick={closeCancelModal} variant="grey">
            {t("common:actions.cancel")}
          </Button>
          <Button
            onClick={() => {
              handleCancelTransaction();
            }}
            variant="delete"
            loading={cancelTransactionMutation.isPending}
          >
            {t("common:actions.confirm")}
          </Button>
        </Group>
      </Modal>

      <PhotoModal
        opened={openedCodeCarousel}
        setOpened={closeCodeCarousel}
        photos={chosenCode}
        baseUrl={import.meta.env.VITE_API_BASE_URL}
        activeSlide={0}
      />

      <TransferContainerModal
        opened={openedTransferContainerModal}
        onClose={closeTransferContainerModal}
        onConfirm={handleTransferContainer}
        isLoading={transferContainerMutation.isPending}
        currentContainerId={depositDetails?.container_id}
      />

      <RefuseItemModal
        opened={openedRefuse}
        onClose={closeRefuse}
        onConfirm={handleConfirmRefuse}
        loading={
          processMutation.isPending &&
          processMutation.variables?.action === "refuse"
        }
      />
    </Container>
  );
}

// TODO: show specific details for deposit: code (click to reveal modal, copy button) and barcode (direct)
