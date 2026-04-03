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
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import AdminTable from "../../../components/admin/AdminTable";
import { useGetItemDetails } from "../../../hooks/itemHooks";
import dayjs from "dayjs";
import { PhotosCarousel } from "../../../components/PhotosCarousel";
import { useState } from "react";
import { CardStatsItem } from "../../../components/admin/CardStatsItem";

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

  // UPDATE STATUS
  const [
    openedUpdateStatusModal,
    { open: openUpdateStatusModal, close: closeUpdateStatusModal },
  ] = useDisclosure(false);

  return (
    <Container px="md" size="xl">
      <Title order={2} mt="lg">
        Listing Details
      </Title>
      <AdminBreadcrumbs
        breadcrumbs={[
          ...(origin?.from === "allItems"
            ? [
                { title: "Listing Management", href: PATHS.ADMIN.LISTINGS },
                {
                  title: "Listing Details",
                  href: PATHS.ADMIN.LISTINGS + "/" + id,
                },
              ]
            : [
                { title: "Listing Management", href: PATHS.ADMIN.LISTINGS },
                {
                  title: "Listing Details",
                  href: PATHS.ADMIN.LISTINGS + "/" + id,
                },
              ]),
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
              <div>Content</div>
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
                  color="green"
                  value={
                    itemDetails?.material.charAt(0).toUpperCase() +
                    (itemDetails?.material.slice(1) ?? "")
                  }
                />

                <CardStatsItem
                  icon={<IconStars size={18} />}
                  label="State"
                  color="white"
                  value={`${itemDetails?.state.charAt(0).toUpperCase() + (itemDetails?.state.slice(1).replace(/_/g, " ") ?? "")}`}
                />
              </SimpleGrid>

              {/* Footer Actions */}
              <Stack mt="xl">
                <Group grow>
                  <Button
                    variant="edit"
                    // onClick={handleOpenEdit}
                    fullWidth
                  >
                    Edit item
                  </Button>
                  <Button
                    disabled={itemDetails?.status === "completed"}
                    fullWidth
                    variant={
                      ["pending", "refused"].includes(itemDetails?.status ?? "")
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
              </Stack>

              {/* Edit Modal */}
              {/* <Modal
                opened={openedEdit}
                onClose={handleCloseEdit}
                title="Edit event"
                centered
                size="xl"
              >
                <Stack>
                  <TextInput
                    data-autofocus
                    withAsterisk
                    placeholder="Give the event a catchy title"
                    label="Title"
                    value={titleEdit}
                    onChange={(e) => {
                      setTitleEdit(e.target.value);
                    }}
                    onBlur={() => validateTitle()}
                    error={errorTitle}
                    disabled={updateEvent.isPending}
                    required
                  />
                  <NumberInput
                    label="Capacity"
                    placeholder="Maximum number of attendees"
                    min={0}
                    disabled={updateEvent.isPending}
                    value={capacityEdit ?? 0}
                    suffix=" people"
                    onChange={(value) => {
                      setCapacityEdit(Number(value));
                    }}
                    onBlur={() => validateCapacity()}
                    error={errorCapacity}
                  />
                  <NumberInput
                    withAsterisk
                    label="Price"
                    placeholder="Entry fee - (0 if free)"
                    min={0}
                    prefix="€"
                    value={priceEdit}
                    disabled={updateEvent.isPending}
                    onChange={(value) => {
                      setPriceEdit(Number(value));
                    }}
                    onBlur={() => validatePrice()}
                    error={errorPrice}
                    required
                  />
                  <Grid>
                    <Grid.Col span={{ base: 12, md: 9 }}>
                      <TextInput
                        withAsterisk
                        label="Street"
                        disabled={updateEvent.isPending}
                        value={streetEdit}
                        placeholder="21 Erard street"
                        onChange={(e) => {
                          setStreetEdit(e.target.value);
                        }}
                        onBlur={() => validateStreet()}
                        error={errorStreet}
                        required
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 3 }}>
                      <TextInput
                        withAsterisk
                        placeholder="Paris"
                        label="City"
                        value={cityEdit}
                        disabled={updateEvent.isPending}
                        onChange={(e) => {
                          setCityEdit(e.target.value);
                        }}
                        onBlur={() => validateCity()}
                        error={errorCity}
                        required
                      />
                    </Grid.Col>
                  </Grid>
                  <TextInput
                    label="Additional location details"
                    placeholder="Room 12, 2nd floor"
                    disabled={updateEvent.isPending}
                    value={locationDetailEdit}
                    onChange={(e) => {
                      setLocationDetailEdit(e.target.value);
                    }}
                  />
                  <Grid>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <DateTimePicker
                        clearable
                        withAsterisk
                        label="Start date"
                        placeholder="When does it start?"
                        value={dateEdit ? new Date(dateEdit) : null}
                        disabled={updateEvent.isPending}
                        onChange={(val) =>
                          setDateEdit(val ? dayjs(val).toISOString() : "")
                        }
                        required
                        onBlur={() => validateDate()}
                        error={errorDate}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <DateTimePicker
                        withAsterisk
                        clearable
                        label="End date"
                        placeholder="When does it end?"
                        onBlur={() => validateEndDate(endDateEdit)}
                        error={errorEndDate}
                        value={endDateEdit ? new Date(endDateEdit) : null}
                        disabled={updateEvent.isPending}
                        onChange={(val) =>
                          setEndDateEdit(val ? dayjs(val).toISOString() : "")
                        }
                        required
                      />
                    </Grid.Col>
                  </Grid>
                  <Select
                    withAsterisk
                    clearable
                    label="Category"
                    value={categoryEdit}
                    disabled={updateEvent.isPending}
                    placeholder="Select a category"
                    error={errorCategory}
                    onBlur={() => validateCategory()}
                    data={[
                      { value: "workshop", label: "Workshop" },
                      { value: "conference", label: "Conference" },
                      { value: "meetups", label: "Meetups" },
                      { value: "exposition", label: "Exposition" },
                      { value: "other", label: "Other" },
                    ]}
                    onChange={(value) => {
                      setCategoryEdit(value as string);
                    }}
                  />
                  <TextEditor
                    label="Event's description"
                    value={descriptionEdit}
                    placeholder="Write your event's description here..."
                    error={errorDescription ?? ""}
                    onChange={(value) => {
                      setDescriptionEdit(value);
                    }}
                  />
                  <ImageDropzone
                    loading={updateEvent.isPending}
                    files={fileEdit}
                    setFiles={setFileEdit}
                  />
                </Stack>
                <Group mt="lg" justify="center">
                  <Button onClick={handleCloseEdit} variant="grey">
                    Cancel
                  </Button>
                  <Button
                    onClick={(e) => {
                      handleEdit(e);
                    }}
                    variant="primary"
                    loading={updateEvent.isPending}
                  >
                    Confirm
                  </Button>
                </Group>
              </Modal> */}
            </Card>
          </Grid.Col>
        </Grid>

        <Divider my="xl" />
        <Group justify="space-between">
          <Title order={3} mb="lg">
            Transactions
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
            //   onClick={() => {
            //     handleUpdateEventStatus();
            //   }}
            variant={
              itemDetails?.status === "refused" ||
              itemDetails?.status === "pending"
                ? "primary"
                : "delete"
            }
            //   loading={cancelEvent.isPending}
          >
            Confirm
          </Button>
        </Group>
      </Modal>
    </Container>
  );
}
