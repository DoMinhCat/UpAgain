import {
  Container,
  Group,
  Stack,
  Box,
  Paper,
  Title,
  Text,
  Badge,
  Divider,
  Grid,
  Avatar,
  Button,
  useComputedColorScheme,
} from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import {
  IconMapPin,
  IconChevronRight,
  IconWeight,
  IconBox,
  IconClock,
  IconCircleCheck,
  IconInfoCircle,
  IconLeaf,
  IconTrash,
} from "@tabler/icons-react";
import MyBreadcrumbs from "../../../components/nav/MyBreadcrumbs";
import { useTranslation } from "react-i18next";
import { PATHS } from "../../../routes/paths";
import { useAuth } from "../../../context/AuthContext";
import { useParams } from "react-router-dom";
import { PhotosCarousel } from "../../../components/photo/PhotosCarousel";
import { useState } from "react";
import { resolveUrl } from "../../../utils/imageUtils";
import { useGetItemDetails, useDeleteItem } from "../../../hooks/itemHooks";
import FullScreenLoader from "../../../components/common/FullScreenLoader";
import { getTimeAgo } from "../../../utils/timeUtils";
import DOMPurify from "dompurify";
import { useGetListingDetails } from "../../../hooks/listingHooks";
import { useGetDepositDetails } from "../../../hooks/depositHooks";
import { showInfoNotification } from "../../../components/common/NotificationToast";
import { NotFoundPage } from "../../error/404";
import { useDisclosure } from "@mantine/hooks";
import { EditItemModal } from "../../../components/marketplace/EditItemModal";
import { useNavigate } from "react-router-dom";
import { Modal } from "@mantine/core";
import { useTransferDepositContainer } from "../../../hooks/depositHooks";
import { TransferContainerModal } from "../../../components/market/TransferContainerModal";

export default function ItemDetailPage() {
  const { t } = useTranslation(["marketplace", "home", "common"]);
  const theme = useComputedColorScheme("light");
  const { user } = useAuth();
  const role = user?.role;
  const navigate = useNavigate();
  const params = useParams();
  const id = params.id;
  const id_item = Number(id);
  const isValidId = !isNaN(id_item) && id_item > 0;

  // PHOTO CAROUSEL MODAL
  const [lightboxOpened, setLightboxOpened] = useState(false);
  const [lightboxSlide, setLightboxSlide] = useState(0);

  // GET ITEM COMMON DETAILS
  const { data: item, isLoading: isLoadingItem } = useGetItemDetails(
    id_item,
    isValidId,
  );

  // GET LISTING/DEPOSIT DETAILS
  const isListing = item?.category === "listing";
  const isDeposit = item?.category === "deposit";
  const { data: listingDetails, isLoading: isListingDetailsLoading } =
    useGetListingDetails(id_item, isValidId && isListing);
  const { data: depositDetails, isLoading: isDepositDetailsLoading } =
    useGetDepositDetails(id_item, isValidId && isDeposit);

  const [openedEdit, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);
  const [openedDelete, { open: openDelete, close: closeDelete }] =
    useDisclosure(false);
  const [openedTransfer, { open: openTransfer, close: closeTransfer }] =
    useDisclosure(false);

  const deleteItemMutation = useDeleteItem();
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

  const handleDelete = () => {
    deleteItemMutation.mutate(id_item, {
      onSuccess: () => {
        navigate(PATHS.MARKETPLACE.HOME);
      },
    });
  };

  const handleAction = () => {
    showInfoNotification(
      t("marketplace:detail.not_implemented_title", {
        defaultValue: "Feature coming soon",
      }),
      t("marketplace:detail.not_implemented_msg", {
        defaultValue: "This action will be available in the next update.",
      }),
    );
  };

  if (isLoadingItem || isListingDetailsLoading || isDepositDetailsLoading) {
    return <FullScreenLoader />;
  }

  if (!item) {
    return <NotFoundPage />;
  }

  return (
    <>
      <Container size="xl" pb={120} pt={24}>
        <Stack gap="lg">
          <MyBreadcrumbs
            mb="xl"
            mt="md"
            breadcrumbs={[
              { title: t("home:title"), href: PATHS.HOME },
              { title: t("marketplace:market"), href: PATHS.MARKETPLACE.HOME },
              { title: item.title, href: "#" },
            ]}
          />

          <Grid gap="xl">
            {/* LEFT COLUMN */}
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Stack gap="lg">
                {/* 1. PHOTO SECTION */}
                <Box pos="relative">
                  {item.images && item.images.length > 0 ? (
                    <Carousel
                      withIndicators
                      emblaOptions={{
                        loop: true,
                        dragFree: false,
                        align: "center",
                      }}
                      height={500}
                      styles={{
                        root: {
                          borderRadius: "var(--mantine-radius-xl)",
                          overflow: "hidden",
                        },
                        indicator: {
                          width: 12,
                          height: 4,
                          transition: "width 250ms ease",
                          "&[dataActive]": { width: 40 },
                        },
                      }}
                    >
                      {item.images.map((url, index) => (
                        <Carousel.Slide key={index}>
                          <Box
                            h="100%"
                            style={{
                              backgroundImage: `url("${resolveUrl(url)}")`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              cursor: "zoom-in",
                            }}
                            onClick={() => {
                              setLightboxSlide(index);
                              setLightboxOpened(true);
                            }}
                          >
                            <Box
                              pos="absolute"
                              inset={0}
                              style={{
                                background:
                                  "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.3) 100%)",
                                pointerEvents: "none",
                              }}
                            />
                          </Box>
                        </Carousel.Slide>
                      ))}
                    </Carousel>
                  ) : (
                    <Box
                      h={500}
                      style={{
                        backgroundImage: `url("/banners/user-banner1-${theme}.png")`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        borderRadius: "var(--mantine-radius-xl)",
                      }}
                    />
                  )}

                  {/* 2. OVERLAY PAPER (Title zone) */}
                  <Paper
                    variant="primary"
                    p="xl"
                    radius="xl"
                    shadow="xl"
                    mx="xl"
                    withBorder
                    style={{
                      marginTop: -60,
                      position: "relative",
                      zIndex: 10,
                    }}
                  >
                    <Stack gap="xs">
                      <Group justify="space-between" align="flex-start">
                        <Title order={1}>{item.title}</Title>
                        <Badge
                          size="lg"
                          variant={
                            item.material === "wood"
                              ? "blue"
                              : item.material === "metal"
                                ? "green"
                                : item.material === "textile"
                                  ? "yellow"
                                  : item.material === "glass"
                                    ? "red"
                                    : item.material === "plastic"
                                      ? "violet"
                                      : item.material === "other"
                                        ? "gray"
                                        : "cyan"
                          }
                        >
                          {t(`common:materials.${item.material}`).toUpperCase()}
                        </Badge>
                      </Group>
                      <Group gap="md">
                        <Group gap={6} c="dimmed">
                          <IconClock size={16} />
                          <Text size="sm" fw={600}>
                            {getTimeAgo(item.created_at, t)}
                          </Text>
                        </Group>
                        <Text c="dimmed" size="sm">
                          •
                        </Text>
                        <Text
                          size="sm"
                          fw={700}
                          c="var(--upagain-neutral-green)"
                        >
                          {t(`common:states.${item.state}`, {
                            defaultValue: item.state,
                          })}
                        </Text>
                      </Group>
                    </Stack>
                  </Paper>
                </Box>

                {/* 3. KEY INFO ZONE */}
                <Stack gap="md" mt={20}>
                  <Title order={3}>{t("marketplace:detail.key_info")}</Title>
                  <Grid>
                    <Grid.Col span={{ base: 6, sm: 3 }}>
                      <Paper
                        p="md"
                        radius="lg"
                        withBorder
                        variant="primary"
                        h="100%"
                        style={{
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Group gap="sm" wrap="nowrap" align="center">
                          <IconWeight
                            size={24}
                            color="var(--upagain-neutral-green)"
                          />
                          <Stack gap={0}>
                            <Text size="xs" c="dimmed">
                              {t("marketplace:detail.weight")}
                            </Text>
                            <Text fw={700}>{item.weight} kg</Text>
                          </Stack>
                        </Group>
                      </Paper>
                    </Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}>
                      <Paper
                        p="md"
                        radius="lg"
                        withBorder
                        variant="primary"
                        h="100%"
                        style={{
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Group gap="sm" wrap="nowrap" align="center">
                          <IconCircleCheck
                            size={24}
                            color="var(--upagain-neutral-green)"
                          />
                          <Stack gap={0}>
                            <Text size="xs" c="dimmed">
                              {t("marketplace:detail.state")}
                            </Text>
                            <Text fw={700}>
                              {t(`common:states.${item.state}`)}
                            </Text>
                          </Stack>
                        </Group>
                      </Paper>
                    </Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}>
                      <Paper
                        p="md"
                        radius="lg"
                        withBorder
                        variant="primary"
                        h="100%"
                        style={{
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Group gap="sm" wrap="nowrap" align="center">
                          <IconBox
                            size={24}
                            color="var(--upagain-neutral-green)"
                          />
                          <Stack gap={0}>
                            <Text size="xs" c="dimmed">
                              {t("marketplace:detail.retrieval.title")}
                            </Text>
                            <Text fw={700} size="sm">
                              {item.category === "listing"
                                ? t("marketplace:detail.retrieval.listing")
                                : t("marketplace:detail.retrieval.deposit")}
                            </Text>
                          </Stack>
                        </Group>
                      </Paper>
                    </Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}>
                      <Paper
                        p="md"
                        radius="lg"
                        withBorder
                        variant="primary"
                        h="100%"
                        style={{
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Group gap="sm" wrap="nowrap" align="center">
                          <IconLeaf
                            size={24}
                            color="var(--upagain-neutral-green)"
                          />
                          <Stack gap={0}>
                            <Text size="xs" c="dimmed">
                              Upcycling Score
                            </Text>
                            <Text fw={700}>{item.score}</Text>
                          </Stack>
                        </Group>
                      </Paper>
                    </Grid.Col>
                  </Grid>
                </Stack>

                <Divider />

                {/* 4. DESCRIPTION ZONE */}
                <Stack gap="md">
                  <Title order={3}>{t("marketplace:detail.about")}</Title>
                  <Text
                    style={{ lineHeight: 1.6, fontSize: "1.05rem" }}
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(item.description || ""),
                    }}
                  />
                </Stack>

                <Divider />

                {/* 5. LOCATION ZONE */}
                <Stack gap="xl">
                  <Stack gap="xs">
                    <Title order={3}>{t("marketplace:detail.location")}</Title>
                    <Group gap={8}>
                      <IconMapPin
                        size={20}
                        color="var(--upagain-neutral-green)"
                      />
                      <Text size="lg" fw={500}>
                        {isListing
                          ? `${listingDetails?.city || ""}, ${listingDetails?.postal_code || ""}`
                          : t("marketplace:detail.retrieval.deposit")}
                      </Text>
                    </Group>
                  </Stack>

                  {/* Google Maps Placeholder */}
                  <Box
                    h={300}
                    bg="var(--mantine-color-gray-1)"
                    style={{
                      borderRadius: "var(--mantine-radius-lg)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "2px dashed var(--mantine-color-gray-3)",
                    }}
                  >
                    <IconMapPin size={48} color="var(--mantine-color-gray-4)" />
                    <Text c="dimmed" fw={600} mt="sm">
                      {t("marketplace:detail.map_placeholder")}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {t("marketplace:detail.map_api_note")}
                    </Text>
                  </Box>
                </Stack>
              </Stack>
            </Grid.Col>

            {/* 6. STICKY CARD (Right Side) */}
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Box style={{ position: "sticky", top: 100 }}>
                <Paper
                  variant="primary"
                  shadow="xl"
                  p="xl"
                  radius="lg"
                  withBorder
                >
                  <Stack gap="lg">
                    {/* Price and Status */}
                    <Group justify="space-between" align="center">
                      <Stack gap={0}>
                        <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                          {t("marketplace:detail.price")}
                        </Text>
                        <Title order={2} c="var(--upagain-neutral-green)">
                          {item.price > 0 ? `${item.price}€` : t("common:free")}
                        </Title>
                      </Stack>
                      <Badge
                        size="lg"
                        variant="light"
                        color="var(--upagain-neutral-green)"
                      >
                        {item.status.toUpperCase()}
                      </Badge>
                    </Group>

                    <Divider />

                    {/* Poster info */}
                    <Stack gap="xs">
                      <Text c="dimmed" size="xs" fw={700} tt="uppercase">
                        {t("marketplace:detail.posted_by")}
                      </Text>
                      <Group gap="sm">
                        <Avatar
                          radius="xl"
                          name={item.username}
                          color="initials"
                          size="md"
                        />
                        <Text fw={700} size="sm">
                          {item.username}
                        </Text>
                      </Group>
                    </Stack>

                    <Divider />

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
                        {item.category === "listing"
                          ? t("marketplace:detail.retrieval.listing")
                          : t("marketplace:detail.retrieval.deposit")}
                      </Text>
                    </Stack>

                    <Stack gap="sm">
                      {/* Buy and reserve for pro */}
                      {role === "pro" && (
                        <>
                          <Button
                            size="lg"
                            variant="secondary"
                            fullWidth
                            color="var(--upagain-neutral-green)"
                            onClick={handleAction}
                            rightSection={<IconChevronRight size={18} />}
                          >
                            {t("marketplace:detail.reserve_now", {
                              defaultValue: "Reserve now",
                            })}
                          </Button>
                          <Button
                            size="lg"
                            radius="md"
                            variant="cta-reverse"
                            fullWidth
                            color="var(--upagain-neutral-green)"
                            rightSection={<IconChevronRight size={18} />}
                            onClick={handleAction}
                          >
                            {t("marketplace:detail.buy")}
                          </Button>
                        </>
                      )}

                      {/* Admin see in back office */}
                      {role === "admin" && (
                        <Button
                          size="lg"
                          radius="md"
                          variant="secondary"
                          fullWidth
                          color="var(--upagain-neutral-green)"
                          onClick={() =>
                            navigate(PATHS.ADMIN.LISTINGS_DETAILS(id_item))
                          }
                        >
                          {t("marketplace:detail.see_back_office", {
                            defaultValue: "See in back office",
                          })}
                        </Button>
                      )}

                      {/* Edit and delete for user */}
                      {user?.id === item?.id_user && (
                        <>
                          <Button
                            size="lg"
                            variant="secondary"
                            fullWidth
                            color="var(--upagain-neutral-green)"
                            onClick={openEdit}
                          >
                            {t("marketplace:detail.edit")}
                          </Button>
                          {item.category === "deposit" && (
                            <Button
                              size="lg"
                              variant="secondary"
                              fullWidth
                              color="var(--upagain-neutral-green)"
                              onClick={openTransfer}
                            >
                              {t("marketplace:detail.transfer_container", {
                                defaultValue: "Transfer container",
                              })}
                            </Button>
                          )}
                          <Button
                            size="lg"
                            radius="md"
                            variant="delete"
                            fullWidth
                            color="var(--upagain-neutral-green)"
                            rightSection={<IconTrash size={18} />}
                            onClick={openDelete}
                          >
                            {t("marketplace:detail.delete")}
                          </Button>
                        </>
                      )}
                    </Stack>

                    {role === "pro" && (
                      <Text size="xs" c="dimmed" ta="center">
                        {t("marketplace:detail.secure_transaction_note", {
                          defaultValue:
                            "Secure transaction guaranteed by UpAgain",
                        })}
                      </Text>
                    )}
                  </Stack>
                </Paper>
              </Box>
            </Grid.Col>
          </Grid>
        </Stack>
      </Container>

      <PhotosCarousel
        photos={item.images || []}
        opened={lightboxOpened}
        onClose={() => setLightboxOpened(false)}
        defaultActiveSlide={lightboxSlide}
      />

      {item && (
        <EditItemModal
          opened={openedEdit}
          onClose={closeEdit}
          item={item}
          listingDetails={listingDetails}
        />
      )}

      <Modal
        opened={openedDelete}
        onClose={closeDelete}
        title={t("marketplace:detail.delete_confirm_title", {
          defaultValue: "Confirm Delete",
        })}
        centered
      >
        <Stack>
          <Text>
            {t("marketplace:detail.delete_confirm_msg", {
              defaultValue:
                "Are you sure you want to delete this item? This action is irreversible.",
            })}
          </Text>
          <Group justify="center" mt="md">
            <Button variant="grey" onClick={closeDelete}>
              {t("common:actions.cancel")}
            </Button>
            <Button
              variant="delete"
              onClick={handleDelete}
              loading={deleteItemMutation.isPending}
            >
              {t("common:actions.confirm")}
            </Button>
          </Group>
        </Stack>
      </Modal>

      <TransferContainerModal
        opened={openedTransfer}
        onClose={closeTransfer}
        onConfirm={handleTransfer}
        isLoading={transferMutation.isPending}
        currentContainerId={depositDetails?.container_id}
      />
    </>
  );
}
