import {
  Container,
  Title,
  Group,
  Grid,
  TextInput,
  Select,
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
  NumberInput,
  ThemeIcon,
  Paper,
  SimpleGrid,
  Loader,
  Center,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
import {
  useGetListingDetails,
  useUpdateListing,
} from "../../../hooks/listingHooks";
import {
  useGetDepositCodesOfLatestTransaction,
  useGetDepositDetails,
  useTransferDepositContainer,
  useUpdateDeposit,
} from "../../../hooks/depositHooks";
import ImageDropzone from "../../../components/input/ImageDropzone";
import { TextEditor } from "../../../components/input/TextEditor";
import FullScreenLoader from "../../../components/common/FullScreenLoader";
import PaginationFooter from "../../../components/common/PaginationFooter";
import type { Transaction } from "../../../api/interfaces/transaction";
import type { CodeForAdmin } from "../../../api/interfaces/barcode";
import PhotoModal from "../../../components/photo/PhotoModal";
import { useGetAvailableContainers } from "../../../hooks/containerHooks";

export default function AdminListingDetails() {
  const { t } = useTranslation("admin");
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

  const handleUpdateItemStatus = (status: string) => {
    updateItemStatus.mutate(status, {
      onSuccess: () => {
        status === "deleted"
          ? showSuccessNotification(t("listings.details.status_modal.delete"), t("common:notifications.success", { defaultValue: "Item deleted successfully" }))
          : showSuccessNotification(
              t("listings.details.status_modal.approve"),
              t("common:notifications.success", { defaultValue: "Item status updated successfully" }),
            );
        navigate(PATHS.ADMIN.LISTINGS);
      },
    });
  };

  // EDIT MODAL
  const [openedEdit, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);
  const [titleEdit, setTitleEdit] = useState<string>(itemDetails?.title || "");
  const [descriptionEdit, setDescriptionEdit] = useState<string>(
    itemDetails?.description || "",
  );
  const [materialEdit, setMaterialEdit] = useState<string>(
    itemDetails?.material || "",
  );
  const [stateEdit, setStateEdit] = useState<string>(itemDetails?.state || "");
  const [weightEdit, setWeightEdit] = useState<number>(
    itemDetails?.weight || 0,
  );
  const [priceEdit, setPriceEdit] = useState<number>(itemDetails?.price || 0);
  const [cityEdit, setCityEdit] = useState<string>(listingDetails?.city || "");
  const [postalCodeEdit, setPostalCodeEdit] = useState<string>(
    listingDetails?.postal_code || "",
  );
  const [fileEdit, setFileEdit] = useState<any[]>([]);

  const [errorTitle, setErrorTitle] = useState("");
  const [errorDescription, setErrorDescription] = useState("");
  const [errorMaterial, setErrorMaterial] = useState("");
  const [errorState, setErrorState] = useState("");
  const [errorWeight, setErrorWeight] = useState("");
  const [errorCity, setErrorCity] = useState("");
  const [errorPostalCode, setErrorPostalCode] = useState("");
  const [errorPrice, setErrorPrice] = useState("");

  const handleOpenEdit = () => {
    if (itemDetails) {
      setTitleEdit(itemDetails?.title || "");
      setDescriptionEdit(itemDetails?.description || "");
      setMaterialEdit(itemDetails?.material || "");
      setStateEdit(itemDetails?.state || "");
      setWeightEdit(itemDetails?.weight || 0);
      setPriceEdit(itemDetails?.price || 0);
      const files = itemDetails?.images?.map((image) => {
        return {
          path: image,
        };
      });
      setFileEdit(files || []);
      if (isListing) {
        setCityEdit(listingDetails?.city || "");
        setPostalCodeEdit(listingDetails?.postal_code || "");
      }
    }
    openEdit();
  };

  const handleCloseEdit = () => {
    setErrorTitle("");
    setErrorDescription("");
    setErrorMaterial("");
    setErrorState("");
    setErrorWeight("");
    setErrorCity("");
    setErrorPostalCode("");

    if (isListing) {
      setCityEdit(listingDetails?.city || "");
      setPostalCodeEdit(listingDetails?.postal_code || "");
    }
    closeEdit();
  };

  const validateTitle = () => {
    if (!titleEdit) {
      setErrorTitle("Title is required");
      return false;
    } else {
      setErrorTitle("");
      return true;
    }
  };

  const validateDescription = () => {
    const stripped = descriptionEdit.replace(/<[^>]*>/g, "").trim();
    if (!descriptionEdit || stripped === "") {
      setErrorDescription("Post's content is required");
      return false;
    }
    setErrorDescription("");
    return true;
  };

  const validateMaterial = () => {
    if (!materialEdit) {
      setErrorMaterial("Material is required");
      return false;
    } else {
      setErrorMaterial("");
      return true;
    }
  };

  const validateState = () => {
    if (!stateEdit) {
      setErrorState("State is required");
      return false;
    } else {
      setErrorState("");
      return true;
    }
  };

  const validateWeight = () => {
    if (!weightEdit) {
      setErrorWeight("Weight is required");
      return false;
    } else {
      setErrorWeight("");
      return true;
    }
  };

  const validateCity = () => {
    if (!cityEdit) {
      setErrorCity("City is required");
      return false;
    } else {
      setErrorCity("");
      return true;
    }
  };

  const validatePostalCode = () => {
    if (!postalCodeEdit) {
      setErrorPostalCode("Postal code is required");
      return false;
    }
    if (!/^\d{5,9}$/.test(postalCodeEdit)) {
      setErrorPostalCode("Invalid postal code");
      return false;
    }
    setErrorPostalCode("");
    return true;
  };

  const validatePrice = () => {
    if (!priceEdit && priceEdit !== 0) {
      setErrorPrice("Price is required");
      return false;
    } else {
      setErrorPrice("");
      return true;
    }
  };

  // EDIT HANDLING
  const updateListingMutation = useUpdateListing(id_item);
  const updateDepositMutation = useUpdateDeposit(id_item);

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !validateTitle() ||
      !validateDescription() ||
      !validateMaterial() ||
      !validateState() ||
      !validateWeight() ||
      !validatePrice()
    ) {
      return;
    }

    if (itemDetails?.category === "listing") {
      if (!validateCity() || !validatePostalCode()) {
        return;
      }
    }

    const formData = new FormData();
    formData.append("title", titleEdit);
    formData.append("description", descriptionEdit);
    formData.append("material", materialEdit);
    formData.append("state", stateEdit);
    formData.append("weight", weightEdit.toString());
    formData.append("price", priceEdit.toString());
    if (isListing) {
      formData.append("city", cityEdit);
      formData.append("postal_code", postalCodeEdit);
    }
    fileEdit.forEach((obj) => {
      if (obj instanceof File) {
        formData.append("new_images", obj);
      } else if (obj.path) {
        formData.append("existing_images", obj.path);
      }
    });
    if (isListing) {
      updateListingMutation.mutate(formData, {
        onSuccess: () => {
          closeEdit();
        },
      });
    } else {
      updateDepositMutation.mutate(formData, {
        onSuccess: () => {
          closeEdit();
        },
      });
    }
  };

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

  // TRANSFER CONTAINER
  const {
    data: availableContainersData,
    isLoading: isLoadingAvailableContainers,
  } = useGetAvailableContainers();
  const availableContainers = availableContainersData || [];
  const [
    openedTransferContainerModal,
    { open: openTransferContainerModal, close: closeTransferContainerModal },
  ] = useDisclosure(false);
  const [transferContainer, setTransferContainer] = useState<string>(
    depositDetails?.container_id.toString() || "",
  );
  const transferContainerMutation = useTransferDepositContainer(id_item);

  const handleOpenTransferContainerModal = () => {
    setTransferContainer(depositDetails?.container_id.toString() || "");
    openTransferContainerModal();
  };

  const handleTransferContainer = () => {
    transferContainerMutation.mutate(
      {
        id_new_container: parseInt(transferContainer),
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
                : [{ title: t("listings.title"), href: PATHS.ADMIN.LISTINGS }]),
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
                  {t(`status.${itemDetails?.status}` as any, { defaultValue: itemDetails?.status })}
                </Badge>
              </Group>

              <Title order={2} mt="lg" mb="xs">
                {itemDetails?.title}
              </Title>
              <Text c="dimmed" size="xs" mb="xl">
                {t("listings.details.submitted_on", { date: dayjs(itemDetails?.created_at).format("DD/MM/YYYY HH:mm A") })}
              </Text>
              <div
                dangerouslySetInnerHTML={{
                  __html: itemDetails?.description ?? "",
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
                                  label={copied ? t("common:actions.copied", { defaultValue: "Copied" }) : t("common:actions.copy", { defaultValue: "Copy code" })}
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
                                  label={copied ? t("common:actions.copied", { defaultValue: "Copied" }) : t("common:actions.copy", { defaultValue: "Copy code" })}
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
                      {itemDetails?.price ? `${itemDetails.price} €` : t("common:free", { defaultValue: "Free" })}
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
                  value={
                    t(`common:materials.${itemDetails?.material}` as any, {
                      defaultValue:
                        itemDetails?.material.charAt(0).toUpperCase() +
                        (itemDetails?.material.slice(1) ?? ""),
                    })
                  }
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
                  value={
                    t(`common:states.${itemDetails?.state}` as any, {
                      defaultValue:
                        itemDetails?.state.charAt(0).toUpperCase() +
                        (itemDetails?.state.slice(1).replace(/_/g, " ") ?? ""),
                    })
                  }
                />

                {itemDetails?.category === "listing" ? (
                  <CardStatsItem
                    icon={<IconMapPin size={18} />}
                    label={t("containers.details.location")}
                    color="white"
                    value={`${listingDetails?.city} ${listingDetails?.postal_code}`}
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
                        {t("common:container", { defaultValue: "Container" })} #{depositDetails?.container_id}
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
                        onClick={handleOpenEdit}
                        loading={
                          isItemDetailsLoading ||
                          updateItemStatus.isPending ||
                          updateDepositMutation.isPending ||
                          updateListingMutation.isPending
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
                    </Group>
                    {itemDetails?.category === "deposit" && (
                      <Button
                        fullWidth
                        variant="secondary"
                        disabled={
                          updateDepositMutation.isPending ||
                          updateListingMutation.isPending ||
                          isLoadingAvailableContainers
                        }
                        onClick={handleOpenTransferContainerModal}
                      >
                        {t("listings.details.transfer_container")}
                      </Button>
                    )}
                  </Stack>
                </>
              )}

              {/* Edit Modal */}
              <Modal
                opened={openedEdit}
                onClose={handleCloseEdit}
                title={t("listings.details.edit_modal.title")}
                centered
                size="xl"
              >
                <Stack>
                  <TextInput
                    data-autofocus
                    withAsterisk
                    label={t("validations.table.title")}
                    value={titleEdit}
                    onChange={(e) => {
                      setTitleEdit(e.target.value);
                    }}
                    onBlur={() => validateTitle()}
                    error={errorTitle}
                    disabled={
                      updateDepositMutation.isPending ||
                      updateListingMutation.isPending
                    }
                    required
                  />
                  <NumberInput
                    min={0}
                    withAsterisk
                    label={t("validations.table.price")}
                    value={priceEdit}
                    onChange={(value) => {
                      setPriceEdit(Number(value));
                    }}
                    onBlur={() => validatePrice()}
                    error={errorPrice}
                    disabled={
                      updateDepositMutation.isPending ||
                      updateListingMutation.isPending
                    }
                    required
                  />
                  <NumberInput
                    min={0}
                    withAsterisk
                    label={t("listings.filters.weight")}
                    value={weightEdit}
                    onChange={(value) => {
                      setWeightEdit(Number(value));
                    }}
                    onBlur={() => validateWeight()}
                    error={errorWeight}
                    disabled={
                      updateDepositMutation.isPending ||
                      updateListingMutation.isPending
                    }
                    required
                  />
                  <Select
                    withAsterisk
                    label={t("listings.filters.material")}
                    value={materialEdit}
                    error={errorMaterial}
                    onBlur={() => validateMaterial()}
                    disabled={
                      updateDepositMutation.isPending ||
                      updateListingMutation.isPending
                    }
                    data={[
                      { value: "wood", label: t("common:materials.wood") },
                      { value: "glass", label: t("common:materials.glass") },
                      { value: "plastic", label: t("common:materials.plastic") },
                      { value: "metal", label: t("common:materials.metal") },
                      { value: "textile", label: t("common:materials.textile") },
                      { value: "mixed", label: t("common:materials.mixed") },
                      { value: "other", label: t("common:materials.other") },
                    ]}
                    onChange={(value) => {
                      setMaterialEdit(value as string);
                    }}
                  />
                  <Select
                    withAsterisk
                    label={t("listings.filters.state")}
                    value={stateEdit}
                    error={errorState}
                    onBlur={() => validateState()}
                    disabled={
                      updateDepositMutation.isPending ||
                      updateListingMutation.isPending
                    }
                    data={[
                      { value: "new", label: t("common:states.new") },
                      { value: "very_good", label: t("common:states.very_good") },
                      { value: "good", label: t("common:states.good") },
                      { value: "need_repair", label: t("common:states.need_repair") },
                    ]}
                    onChange={(value) => {
                      setStateEdit(value as string);
                    }}
                  />
                  {itemDetails?.category === "listing" && (
                    <SimpleGrid cols={2}>
                      <TextInput
                        withAsterisk
                        label={t("containers.create_modal.city")}
                        value={cityEdit}
                        error={errorCity}
                        onBlur={() => validateCity()}
                        onChange={(e) => {
                          setCityEdit(e.target.value);
                        }}
                        disabled={
                          updateDepositMutation.isPending ||
                          updateListingMutation.isPending
                        }
                        required
                      />
                      <TextInput
                        withAsterisk
                        label={t("containers.create_modal.postal_code")}
                        value={postalCodeEdit}
                        error={errorPostalCode}
                        onBlur={() => validatePostalCode()}
                        onChange={(e) => {
                          setPostalCodeEdit(e.target.value);
                        }}
                        disabled={
                          updateDepositMutation.isPending ||
                          updateListingMutation.isPending
                        }
                        required
                      />
                    </SimpleGrid>
                  )}

                  <TextEditor
                    label={t("listings.details.edit_modal.description_label")}
                    value={descriptionEdit}
                    error={errorDescription ?? ""}
                    onChange={(value) => {
                      setDescriptionEdit(value);
                    }}
                  />
                  <ImageDropzone
                    loading={
                      updateDepositMutation.isPending ||
                      updateListingMutation.isPending
                    }
                    files={fileEdit}
                    setFiles={setFileEdit}
                  />
                </Stack>
                <Group mt="lg" justify="center">
                  <Button onClick={handleCloseEdit} variant="grey">
                    {t("common:actions.cancel")}
                  </Button>
                  <Button
                    onClick={(e) => {
                      handleEdit(e);
                    }}
                    loading={
                      updateDepositMutation.isPending ||
                      updateListingMutation.isPending
                    }
                    variant="primary"
                  >
                    {t("common:actions.confirm")}
                  </Button>
                </Group>
              </Modal>
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
            t("listings.details.buyer"),
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
                    {t(`status.${transaction?.action}` as any, { defaultValue: transaction?.action.charAt(0).toUpperCase() + transaction?.action.slice(1) })}
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
          {t("listings.details.transactions.cancel_confirm", { id: cancelTransactionId?.id_transaction })}
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

      <Modal
        opened={openedTransferContainerModal}
        onClose={closeTransferContainerModal}
        title={t("listings.details.transfer_modal.title")}
        size="lg"
      >
        <Text mb="sm">{t("listings.details.transfer_modal.choose")}</Text>
        <Select
          withAsterisk
          value={transferContainer}
          disabled={
            updateDepositMutation.isPending ||
            updateListingMutation.isPending ||
            isLoadingAvailableContainers
          }
          data={availableContainers.map((container) => ({
            value: container.id.toString(),
            label: `${t("common:container", { defaultValue: "Container" })} #${container.id}`,
          }))}
          onChange={(value) => {
            setTransferContainer(value as string);
          }}
        />
        <Group mt="lg" justify="center">
          <Button onClick={closeTransferContainerModal} variant="grey">
            {t("common:actions.cancel")}
          </Button>
          <Button
            onClick={() => {
              handleTransferContainer();
            }}
            variant="primary"
            loading={transferContainerMutation.isPending}
          >
            {t("common:actions.confirm")}
          </Button>
        </Group>
      </Modal>
    </Container>
  );
}

// TODO: show specific details for deposit: code (click to reveal modal, copy button) and barcode (direct)
