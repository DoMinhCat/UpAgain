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
  Box,
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
  IconDownload,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import AdminTable from "../../../components/admin/AdminTable";
import {
  useGetItemDetails,
  useGetItemTransactions,
  useUpdateItemStatus,
} from "../../../hooks/itemHooks";
import { ConfirmCancelReservationModal } from "../../../components/market/ConfirmCancelReservationModal";
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
import FullScreenSkeleton from "../../../components/common/FullScreenSkeleton";
import PaginationFooter from "../../../components/common/PaginationFooter";
import { useProcessValidation } from "../../../hooks/validationHooks";
import { RefuseItemModal } from "../../../components/admin/RefuseItemModal";
import { TransferContainerModal } from "../../../components/market/TransferContainerModal";
import type { Transaction } from "../../../api/interfaces/transaction";
import type { Barcode } from "../../../api/interfaces/barcode";
import PhotoModal from "../../../components/photo/PhotoModal";
import { EditItemModal } from "../../../components/marketplace/EditItemModal";
import { DeleteItemModal } from "../../../components/marketplace/DeleteItemModal";
import EmbeddedMap from "../../../components/common/EmbeddedMap";

export default function AdminListingDetails() {
  const { t } = useTranslation([
    "admin",
    "create_item",
    "common",
    "marketplace",
  ]);
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
  const [
    openedDeleteModal,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);

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
  const [openedCancel, { open: openCancel, close: closeCancel }] =
    useDisclosure(false);

  // DEPOSIT CODES
  const [
    openedCodeCarousel,
    { open: openCodeCarousel, close: closeCodeCarousel },
  ] = useDisclosure(false);
  const [chosenCode, setChosenCode] = useState<string[]>([]);
  const { data: depositCodesData, isLoading: isLoadingDepositCodes } =
    useGetDepositCodesOfLatestTransaction(id_item, isValidId);

  const depositCodes = depositCodesData || [];
  let userCode: Barcode | undefined;
  let proCode: Barcode | undefined;
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

  const handleDownloadBarcode = (barcodeBase64: string, userType: string) => {
    const link = document.createElement("a");
    link.href = barcodeBase64;
    link.download = `barcode-${userType}-${transactionsData?.transactions?.[0]?.id_transaction || "code"}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderAccessCard = (code: Barcode, userType: "owner" | "buyer") => {
    const isOwner = userType === "owner";
    return (
      <Paper variant="primary" p="lg" radius="lg" withBorder shadow="sm">
        <Stack gap="sm">
          <Group justify="space-between">
            <Group gap="sm">
              <ThemeIcon
                variant="light"
                size="md"
                color={isOwner ? "var(--upagain-neutral-green)" : "blue"}
              >
                {isOwner ? (
                  <IconUserShield size={18} />
                ) : (
                  <IconBasketCheck size={18} />
                )}
              </ThemeIcon>
              <Text fw={700}>
                {isOwner
                  ? t("listings.details.owner")
                  : t("listings.details.buyer")}
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

          <Stack gap={4} align="center" mt="xs">
            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
              {t("listings.details.six_digits_code")}
            </Text>
            <Group gap="xs" justify="center">
              <Title order={3} ta="center">
                {code.code.slice(0, 3)} {code.code.slice(3)}
              </Title>
              <CopyButton value={code.code} timeout={3000}>
                {({ copied, copy }) => (
                  <Tooltip
                    label={
                      copied
                        ? t("common:actions.copied", { defaultValue: "Copied" })
                        : t("common:actions.copy", {
                            defaultValue: "Copy code",
                          })
                    }
                    withArrow
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
              src={`${import.meta.env.VITE_API_BASE_URL}/${code.path}`}
              radius="md"
              alt={`${isOwner ? "Owner" : "Buyer"}'s access code`}
              fallbackSrc="https://placehold.co/400x200?text=Barcode"
              style={{ cursor: "pointer", width: "100%", maxWidth: "300px" }}
              mt="md"
              onClick={() => handleCodeClick([code.path || ""])}
            />

            <Divider my="sm" style={{ width: "100%" }} />

            <Group justify="space-between" style={{ width: "100%" }} gap="xs">
              <Text size="xs" c="dimmed">
                {t("listings.details.valid_from")}{" "}
                <Text span fw={600}>
                  {dayjs(code.valid_from).format("DD/MM/YYYY HH:mm A")}
                </Text>
              </Text>
              <Text size="xs" c="dimmed">
                {t("listings.details.valid_to")}{" "}
                <Text span fw={600}>
                  {dayjs(code.valid_to).format("DD/MM/YYYY HH:mm A")}
                </Text>
              </Text>
            </Group>

            {code.barcode_base64 && (
              <Button
                variant="cta"
                size="xs"
                mt="sm"
                fullWidth
                leftSection={<IconDownload size={14} />}
                onClick={() =>
                  handleDownloadBarcode(code.barcode_base64, userType)
                }
              >
                {t("marketplace:my_item_detail.download_barcode")}
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>
    );
  };

  if (
    isDepositDetailsLoading ||
    isListingDetailsLoading ||
    isItemDetailsLoading
  )
    return <FullScreenSkeleton />;
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

              {((isListing && listingDetails?.lat && listingDetails?.lng) ||
                (isDeposit && depositDetails?.lat && depositDetails?.lng)) && (
                <Box mt="xl">
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
                          ? t("listings.details.location")
                          : t("common:container") +
                            ` #${depositDetails?.container_id}`,
                      },
                    ]}
                    centerOnId={id_item}
                    zoom={15}
                  />
                </Box>
              )}
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
                  <Center py="xl">
                    <Loader />
                  </Center>
                )}
                {!userCode && !proCode && !isLoadingDepositCodes && (
                  <Text c="dimmed" mt="lg">
                    {t("listings.details.no_access_code")}
                  </Text>
                )}
                <SimpleGrid cols={{ base: 1, md: 2 }} mt="md" spacing="lg">
                  {userCode && renderAccessCard(userCode, "owner")}
                  {proCode && renderAccessCard(proCode, "buyer")}
                  {userCode && !proCode && (
                    <Paper
                      variant="primary"
                      p="xl"
                      radius="lg"
                      withBorder
                      shadow="sm"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Stack justify="center" align="center" gap="xs">
                        <ThemeIcon
                          color="blue"
                          size="xl"
                          radius="md"
                          variant="light"
                        >
                          <IconBasketCheck size={24} />
                        </ThemeIcon>
                        <Text fw={700} size="sm" ta="center">
                          {t("listings.details.buyer")}
                        </Text>
                        <Text
                          size="xs"
                          c="dimmed"
                          ta="center"
                          style={{ maxWidth: "200px" }}
                        >
                          {t("listings.details.buyer_code_waiting")}
                        </Text>
                      </Stack>
                    </Paper>
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
                        onClick={
                          ["pending", "refused"].includes(
                            itemDetails?.status ?? "",
                          )
                            ? openUpdateStatusModal
                            : openDeleteModal
                        }
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
                  {transaction?.action === "reserved" && (
                    <Button
                      variant="delete"
                      size="xs"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        openCancel();
                      }}
                    >
                      {t("common:actions.cancel")}
                    </Button>
                  )}
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

      <DeleteItemModal
        opened={openedDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={() => {
          handleUpdateItemStatus("deleted");
          closeDeleteModal();
        }}
        loading={updateItemStatus.isPending}
        title={t("listings.details.status_modal.delete")}
      />

      <ConfirmCancelReservationModal
        opened={openedCancel}
        onClose={closeCancel}
        idItem={id_item}
      />

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
