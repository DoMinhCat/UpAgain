import {
  Container,
  Title,
  Group,
  Grid,
  TextInput,
  SimpleGrid,
  Select,
  Table,
  Badge,
  Button,
  Stack,
  Card,
  Text,
  Divider,
  Loader,
  Modal,
  Image,
  Anchor,
  NumberInput,
} from "@mantine/core";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import AdminBreadcrumbs from "../../../components/admin/AdminBreadcrumbs";
import { PATHS } from "../../../routes/paths";
import {
  IconPhoto,
  IconWood,
  IconWeight,
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
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import AdminTable from "../../../components/admin/AdminTable";
import {
  useGetItemDetails,
  useUpdateItemStatus,
} from "../../../hooks/itemHooks";
import dayjs from "dayjs";
import { PhotosCarousel } from "../../../components/PhotosCarousel";
import { useState } from "react";
import { CardStatsItem } from "../../../components/admin/CardStatsItem";
import { showSuccessNotification } from "../../../components/NotificationToast";
import { useGetListingDetails } from "../../../hooks/listingHooks";
import { useGetDepositDetails } from "../../../hooks/depositHooks";
import ImageDropzone from "../../../components/ImageDropzone";
import { TextEditor } from "../../../components/TextEditor";

export default function AdminListingDetails() {
  const location = useLocation();
  const origin = location.state;
  const navigate = useNavigate();
  const params = useParams();
  const id = params.id;
  const id_event = Number(id);
  const isValidId = !isNaN(id_event) && id_event > 0;

  // DETAILS
  const [openedCarousel, { open: openCarousel, close: closeCarousel }] =
    useDisclosure(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const handleImageClick = (index: number) => {
    setActiveSlide(index);
    openCarousel();
  };

  // GET COMMON ITEM ATTRIBUTES
  const { data: itemDetails, isLoading: isItemDetailsLoading } =
    useGetItemDetails(id_event, isValidId);

  // GET LISTING/DEPOSIT DETAILS
  const isListing = itemDetails?.category === "listing";
  const isDeposit = itemDetails?.category === "deposit";
  const { data: listingDetails, isLoading: isListingDetailsLoading } =
    useGetListingDetails(id_event, isValidId && isListing);
  const { data: depositDetails, isLoading: isDepositDetailsLoading } =
    useGetDepositDetails(id_event, isValidId && isDeposit);

  // UPDATE STATUS
  const [
    openedUpdateStatusModal,
    { open: openUpdateStatusModal, close: closeUpdateStatusModal },
  ] = useDisclosure(false);

  const updateItemStatus = useUpdateItemStatus(id_event);

  const handleUpdateItemStatus = (status: string) => {
    updateItemStatus.mutate(status, {
      onSuccess: () => {
        status === "deleted"
          ? showSuccessNotification("Item deleted", "Item deleted successfully")
          : showSuccessNotification(
              "Item updated",
              "Item status updated successfully",
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
  // TODO: images
  //   const [fileEdit, setFileEdit] = useState<any[]>([]);

  const [errorTitle, setErrorTitle] = useState("");
  const [errorDescription, setErrorDescription] = useState("");
  const [errorMaterial, setErrorMaterial] = useState("");
  const [errorState, setErrorState] = useState("");
  const [errorWeight, setErrorWeight] = useState("");
  const [errorCity, setErrorCity] = useState("");
  const [errorPostalCode, setErrorPostalCode] = useState("");
  const [errorPrice, setErrorPrice] = useState("");

  const handleOpenEdit = () => {
    setTitleEdit(itemDetails?.title || "");
    setDescriptionEdit(itemDetails?.description || "");
    setMaterialEdit(itemDetails?.material || "");
    setStateEdit(itemDetails?.state || "");
    setWeightEdit(itemDetails?.weight || 0);
    setPriceEdit(itemDetails?.price || 0);
    if (isListing) {
      setCityEdit(listingDetails?.city || "");
      setPostalCodeEdit(listingDetails?.postal_code || "");
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

    setTitleEdit(itemDetails?.title || "");
    setDescriptionEdit(itemDetails?.description || "");
    setMaterialEdit(itemDetails?.material || "");
    setStateEdit(itemDetails?.state || "");
    setWeightEdit(itemDetails?.weight || 0);
    setPriceEdit(itemDetails?.price || 0);
    if (isListing) {
      setCityEdit(listingDetails?.city || "");
      setPostalCodeEdit(listingDetails?.postal_code || "");
    }
    // TODO: reset images
    // setFileEdit([]);

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
    } else {
      setErrorPostalCode("");
      return true;
    }
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

    // call edit mutate, on success close edit modal and show success notification
  };

  return (
    <Container px="md" size="xl">
      <Title order={2} mt="lg">
        Listing Details
      </Title>
      <AdminBreadcrumbs
        breadcrumbs={[
          ...(origin?.from === "allItems"
            ? [{ title: "Listing Management", href: PATHS.ADMIN.LISTINGS }]
            : [{ title: "Listing Management", href: PATHS.ADMIN.LISTINGS }]),
          {
            title: "Listing's Details",
            href: PATHS.ADMIN.LISTINGS + "/" + id,
          },
        ]}
      />

      <Container p="lg" size="xl">
        <Grid gutter="xl" align="flex-start" mb="xl">
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
                  {itemDetails?.status}
                </Badge>
              </Group>

              <Title order={2} mt="lg" mb="xs">
                {itemDetails?.title}
              </Title>
              <Text c="dimmed" size="xs" mb="xl">
                Created on{" "}
                {dayjs(itemDetails?.created_at).format("DD/MM/YYYY HH:mm A")}
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
                  <Title order={3}>Photos</Title>
                </Group>
                <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} mt="md">
                  {itemDetails.images.map((path, index) => (
                    <Image
                      key={index}
                      src={`${import.meta.env.VITE_API_BASE_URL}/${path}`}
                      radius="md"
                      alt={`Item photo ${index + 1}`}
                      fallbackSrc="https://placehold.co/600x400?text=Image+not+found"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleImageClick(index)}
                    />
                  ))}
                </SimpleGrid>

                <Modal
                  opened={openedCarousel}
                  onClose={closeCarousel}
                  size="xl"
                  centered
                  title="Event's gallery"
                  styles={{
                    root: {
                      zIndex: 1000,
                    },
                    body: {
                      padding: "xs",
                    },
                  }}
                >
                  <PhotosCarousel
                    photos={itemDetails?.images}
                    initialSlide={activeSlide}
                  />
                </Modal>
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
                    Created by{" "}
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
                  label="Price"
                  color="yellow"
                  value={
                    <Text
                      span
                      c={!itemDetails?.price ? "green" : "inherit"}
                      fw={!itemDetails?.price ? 700 : 600}
                    >
                      {itemDetails?.price ? `${itemDetails.price} €` : "Free"}
                    </Text>
                  }
                />

                <CardStatsItem
                  icon={<IconWeight size={18} />}
                  label="Weight"
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
                  label="Material"
                  color="brown"
                  value={
                    itemDetails?.material.charAt(0).toUpperCase() +
                    (itemDetails?.material.slice(1) ?? "")
                  }
                />

                <CardStatsItem
                  icon={<IconStars size={18} />}
                  label="State"
                  color="silver"
                  value={`${itemDetails?.state.charAt(0).toUpperCase() + (itemDetails?.state.slice(1).replace(/_/g, " ") ?? "")}`}
                />

                {itemDetails?.category === "listing" ? (
                  <CardStatsItem
                    icon={<IconMapPin size={18} />}
                    label="Location"
                    color="white"
                    value={`${listingDetails?.city} ${listingDetails?.postal_code}`}
                  />
                ) : (
                  <CardStatsItem
                    icon={<IconBox size={18} />}
                    label="Container"
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
                        Container #{depositDetails?.container_id}
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
                        disabled={isItemDetailsLoading}
                        fullWidth
                      >
                        Edit item
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
                      >
                        {itemDetails?.status === "refused"
                          ? "Reopen item"
                          : itemDetails?.status === "pending"
                            ? "Approve item"
                            : "Delete item"}
                      </Button>
                    </Group>
                    {itemDetails?.category === "deposit" && (
                      <Button
                        fullWidth
                        variant="secondary"
                        // onClick={openDeleteModal}
                      >
                        Transfer container
                      </Button>
                    )}
                  </Stack>
                </>
              )}

              {/* Edit Modal */}
              <Modal
                opened={openedEdit}
                onClose={handleCloseEdit}
                title="Edit item"
                centered
                size="xl"
              >
                <Stack>
                  <TextInput
                    data-autofocus
                    withAsterisk
                    placeholder="Give the item a catchy title"
                    label="Title"
                    value={titleEdit}
                    onChange={(e) => {
                      setTitleEdit(e.target.value);
                    }}
                    onBlur={() => validateTitle()}
                    error={errorTitle}
                    // disabled={updateItem.isPending}
                    required
                  />
                  <NumberInput
                    min={0}
                    withAsterisk
                    label="Price"
                    value={priceEdit}
                    onChange={(value) => {
                      setPriceEdit(Number(value));
                    }}
                    onBlur={() => validatePrice()}
                    error={errorPrice}
                    // disabled={updateItem.isPending}
                    required
                  />
                  <NumberInput
                    min={0}
                    withAsterisk
                    label="Weight"
                    value={weightEdit}
                    onChange={(value) => {
                      setWeightEdit(Number(value));
                    }}
                    onBlur={() => validateWeight()}
                    error={errorWeight}
                    // disabled={updateItem.isPending}
                    required
                  />
                  <Select
                    withAsterisk
                    label="Material"
                    value={materialEdit}
                    error={errorMaterial}
                    onBlur={() => validateMaterial()}
                    // disabled={updateEvent.isPending}
                    data={[
                      { value: "wood", label: "Wood" },
                      { value: "glass", label: "Glass" },
                      { value: "plastic", label: "Plastic" },
                      { value: "metal", label: "Metal" },
                      { value: "textile", label: "Textile" },
                      { value: "mixed", label: "Mixed" },
                      { value: "other", label: "Other" },
                    ]}
                    onChange={(value) => {
                      setMaterialEdit(value as string);
                    }}
                  />
                  <Select
                    withAsterisk
                    label="State"
                    value={stateEdit}
                    error={errorState}
                    onBlur={() => validateState()}
                    // disabled={updateEvent.isPending}
                    data={[
                      { value: "new", label: "New" },
                      { value: "very_good", label: "Very good" },
                      { value: "good", label: "Good" },
                      { value: "need_repair", label: "Need repair" },
                    ]}
                    onChange={(value) => {
                      setStateEdit(value as string);
                    }}
                  />
                  <TextEditor
                    label="Item's description"
                    placeholder="Write your item's description here..."
                    value={descriptionEdit}
                    error={errorDescription ?? ""}
                    onChange={(value) => {
                      setDescriptionEdit(value);
                    }}
                  />
                  {/* <ImageDropzone
                    loading={updateEvent.isPending}
                    files={fileEdit}
                    setFiles={setFileEdit}
                  /> */}
                </Stack>
                <Group mt="lg" justify="center">
                  <Button onClick={handleCloseEdit} variant="grey">
                    Cancel
                  </Button>
                  <Button
                    onClick={(e) => {
                      handleEdit(e);
                    }}
                    // loading={updateEvent.isPending}
                    variant="primary"
                  >
                    Confirm
                  </Button>
                </Group>
              </Modal>
            </Card>
          </Grid.Col>
        </Grid>

        <Divider my="xl" />
        <Group justify="space-between">
          <Title order={3} mb="lg">
            Transaction history
          </Title>
        </Group>
        <AdminTable
          //   loading={isLoadingAssignedEmployees}
          //   error={errorAssignedEmployees}
          header={["Started on", "TransactionID", "Buyer", "Status"]}
        >
          <Table.Tr>
            <Table.Td ta="center">20/02/2026</Table.Td>
            <Table.Td ta="center">123456789</Table.Td>
            <Table.Td ta="center">John Doe</Table.Td>
            <Table.Td ta="center">Completed</Table.Td>
          </Table.Tr>
        </AdminTable>
      </Container>

      <Modal
        opened={openedUpdateStatusModal}
        onClose={closeUpdateStatusModal}
        title={
          itemDetails?.status === "refused"
            ? "Reopen Item"
            : itemDetails?.status === "pending"
              ? "Approve Item"
              : "Delete Item"
        }
      >
        <Text>
          Are you sure you want to{" "}
          {itemDetails?.status === "refused"
            ? "reopen"
            : itemDetails?.status === "pending"
              ? "approve"
              : "delete"}{" "}
          this item?
        </Text>
        <Group mt="lg" justify="end">
          <Button onClick={closeUpdateStatusModal} variant="grey">
            Cancel
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
            Confirm
          </Button>
        </Group>
      </Modal>
    </Container>
  );
}

// TODO: show specific details for listing/deposit
