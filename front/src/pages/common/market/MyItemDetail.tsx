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
  Alert,
  Table,
  Image,
  CopyButton,
  Tooltip,
  ActionIcon,
  ThemeIcon,
  SimpleGrid,
  Loader,
  Center,
  useComputedColorScheme,
} from "@mantine/core";
import {
  IconMapPin,
  IconWeight,
  IconBox,
  IconClock,
  IconInfoCircle,
  IconLeaf,
  IconAlertCircle,
  IconHistory,
  IconKey,
  IconUserShield,
  IconBasketCheck,
  IconCheck,
  IconCopy,
  IconChecklist,
} from "@tabler/icons-react";
import MyBreadcrumbs from "../../../components/nav/MyBreadcrumbs";
import { useTranslation } from "react-i18next";
import { PATHS } from "../../../routes/paths";
import { useAuth } from "../../../context/AuthContext";
import { useParams } from "react-router-dom";
import { PhotosCarousel } from "../../../components/photo/PhotosCarousel";
import { useState } from "react";
import { resolveUrl } from "../../../utils/imageUtils";
import {
  useGetItemDetails,
  useGetItemTransactions,
} from "../../../hooks/itemHooks";
import FullScreenLoader from "../../../components/common/FullScreenLoader";
import { getTimeAgo } from "../../../utils/timeUtils";
import DOMPurify from "dompurify";
import { useGetListingDetails } from "../../../hooks/listingHooks";
import {
  useGetDepositCodesOfLatestTransaction,
  useGetDepositDetails,
} from "../../../hooks/depositHooks";
import dayjs from "dayjs";
import PaginationFooter from "../../../components/common/PaginationFooter";

export default function MyItemDetail() {
  const { t } = useTranslation(["marketplace", "home", "common", "admin"]);
  const theme = useComputedColorScheme("light");
  const { user } = useAuth();
  const params = useParams();
  const id = params.id;
  const id_item = Number(id);
  const isValidId = !isNaN(id_item) && id_item > 0;

  // PHOTO CAROUSEL
  const [lightboxOpened, setLightboxOpened] = useState(false);
  const [lightboxSlide, setLightboxSlide] = useState(0);

  // PAGINATION FOR TRANSACTIONS
  const [activePage, setPage] = useState(1);
  const limit = 5;

  // GET DATA
  const { data: item, isLoading: isLoadingItem } = useGetItemDetails(
    id_item,
    isValidId,
  );

  const isListing = item?.category === "listing";
  const isDeposit = item?.category === "deposit";

  const { data: listingDetails, isLoading: isListingDetailsLoading } =
    useGetListingDetails(id_item, isValidId && isListing);
  const { data: depositDetails, isLoading: isDepositDetailsLoading } =
    useGetDepositDetails(id_item, isValidId && isDeposit);

  const { data: transactionsData, isLoading: isLoadingTransactions } =
    useGetItemTransactions(id_item, isValidId, activePage, limit);

  const { data: depositCodes, isLoading: isLoadingDepositCodes } =
    useGetDepositCodesOfLatestTransaction(id_item, isValidId && isDeposit);

  if (
    isLoadingItem ||
    isListingDetailsLoading ||
    isDepositDetailsLoading ||
    isLoadingTransactions
  ) {
    return <FullScreenLoader />;
  }

  if (!item) {
    return (
      <Container size="xl" pt={100}>
        <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
          Item not found or you don't have access to it.
        </Alert>
      </Container>
    );
  }

  const transactions = transactionsData?.transactions || [];

  // Filter codes for the owner
  const myCode = depositCodes?.find((c) => c.id_account === user?.id);
  const buyerCodeExists = depositCodes?.some((c) => c.user_type === "pro");

  return (
    <Container size="xl" pb={100} pt={24}>
      <Stack gap="lg">
        <MyBreadcrumbs
          mb="xl"
          mt="md"
          breadcrumbs={[
            { title: t("home:title"), href: PATHS.HOME },
            { title: t("marketplace:my_listings"), href: PATHS.MARKETPLACE.ME },
            { title: item.title, href: "#" },
          ]}
        />

        <Grid gutter="xl">
          {/* LEFT SIDE - Details */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap="xl">
              {/* STATUS & REFUSAL INFO */}
              <Group justify="space-between" align="center">
                <Group gap="sm">
                  <Badge
                    size="xl"
                    radius="md"
                    variant="light"
                    color={
                      item.status === "approved"
                        ? "green"
                        : item.status === "refused"
                          ? "red"
                          : "yellow"
                    }
                  >
                    {item.status.toUpperCase()}
                  </Badge>
                  <Text size="sm" c="dimmed">
                    {t("marketplace:detail.submitted_on", {
                      date: dayjs(item.created_at).format("DD/MM/YYYY"),
                    })}
                  </Text>
                </Group>
              </Group>

              {item.status === "refused" && item.refuse_reason && (
                <Alert
                  variant="light"
                  color="red"
                  title={t("admin:validations.details.decision")}
                  icon={<IconAlertCircle size={18} />}
                >
                  <Text fw={600} size="sm" mb={4}>
                    {t("admin:validations.refuse_modal.label")}:
                  </Text>
                  <Text size="sm">{item.refuse_reason}</Text>
                </Alert>
              )}

              {/* PHOTO PREVIEW (Simpler than main detail page) */}
              <Box>
                {item.images && item.images.length > 0 ? (
                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    {item.images.slice(0, 4).map((url, index) => (
                      <Paper
                        key={index}
                        radius="lg"
                        withBorder
                        overflow="hidden"
                        h={240}
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          setLightboxSlide(index);
                          setLightboxOpened(true);
                        }}
                      >
                        <Image
                          src={resolveUrl(url)}
                          h="100%"
                          w="100%"
                          fit="cover"
                        />
                      </Paper>
                    ))}
                  </SimpleGrid>
                ) : (
                  <Box
                    h={240}
                    style={{
                      backgroundImage: `url("/banners/user-banner1-${theme}.png")`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      borderRadius: "var(--mantine-radius-xl)",
                    }}
                  />
                )}
              </Box>

              <Title order={2}>{item.title}</Title>

              {/* KEY INFO GRID */}
              <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
                <Paper p="md" radius="md" withBorder variant="primary">
                  <Stack gap={4} align="center">
                    <IconWeight size={20} color="var(--upagain-neutral-green)" />
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                      {t("marketplace:detail.weight")}
                    </Text>
                    <Text fw={800}>{item.weight} kg</Text>
                  </Stack>
                </Paper>
                <Paper p="md" radius="md" withBorder variant="primary">
                  <Stack gap={4} align="center">
                    <IconLeaf size={20} color="var(--upagain-neutral-green)" />
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                      Score
                    </Text>
                    <Text fw={800}>{item.score}</Text>
                  </Stack>
                </Paper>
                <Paper p="md" radius="md" withBorder variant="primary">
                  <Stack gap={4} align="center">
                    <IconBox size={20} color="var(--upagain-neutral-green)" />
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                      {t("marketplace:detail.category")}
                    </Text>
                    <Badge variant="light" size="sm">
                      {item.category.toUpperCase()}
                    </Badge>
                  </Stack>
                </Paper>
                <Paper p="md" radius="md" withBorder variant="primary">
                  <Stack gap={4} align="center">
                    <IconClock size={20} color="var(--upagain-neutral-green)" />
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                      {t("common:time.age")}
                    </Text>
                    <Text fw={800} size="xs">
                      {getTimeAgo(item.created_at, t)}
                    </Text>
                  </Stack>
                </Paper>
              </SimpleGrid>

              <Divider />

              {/* DESCRIPTION */}
              <Stack gap="sm">
                <Title order={4}>{t("marketplace:detail.about")}</Title>
                <Text
                  size="sm"
                  style={{ lineHeight: 1.6 }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(item.description || ""),
                  }}
                />
              </Stack>

              <Divider />

              {/* TRANSACTION HISTORY */}
              <Stack gap="md">
                <Group gap="sm">
                  <IconHistory size={20} color="var(--upagain-neutral-green)" />
                  <Title order={4}>
                    {t("admin:listings.details.transactions.title")}
                  </Title>
                </Group>

                {transactions.length > 0 ? (
                  <Box style={{ overflowX: "auto" }}>
                    <Table verticalSpacing="sm">
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>{t("common:id")}</Table.Th>
                          <Table.Th>{t("admin:history.table.timestamp")}</Table.Th>
                          <Table.Th>{t("admin:history.table.action")}</Table.Th>
                          <Table.Th>{t("marketplace:detail.buyer")}</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {transactions.map((trx) => (
                          <Table.Tr key={trx.id_transaction}>
                            <Table.Td>
                              <Text size="xs" ff="monospace">
                                {trx.id_transaction.slice(0, 8)}...
                              </Text>
                            </Table.Td>
                            <Table.Td>
                              {dayjs(trx.created_at).format("DD/MM/YYYY HH:mm")}
                            </Table.Td>
                            <Table.Td>
                              <Badge variant="dot" size="sm">
                                {trx.action.toUpperCase()}
                              </Badge>
                            </Table.Td>
                            <Table.Td>{trx.username_pro || "-"}</Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                    <PaginationFooter
                      activePage={activePage}
                      setPage={setPage}
                      total_records={transactionsData?.total_transactions || 0}
                      last_page={transactionsData?.last_page || 1}
                      limit={limit}
                    />
                  </Box>
                ) : (
                  <Text c="dimmed" italic size="sm">
                    {t("admin:listings.details.transactions.no_transactions")}
                  </Text>
                )}
              </Stack>
            </Stack>
          </Grid.Col>

          {/* RIGHT SIDE - Price & Codes */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="lg" style={{ position: "sticky", top: 24 }}>
              {/* PRICE CARD */}
              <Paper p="xl" radius="lg" withBorder shadow="sm">
                <Stack gap="xs" align="center">
                  <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                    {t("marketplace:detail.price")}
                  </Text>
                  <Title order={1} c="var(--upagain-neutral-green)">
                    {item.price > 0 ? `${item.price}€` : t("common:free")}
                  </Title>
                </Stack>
              </Paper>

              {/* ACCESS CODES (If Deposit) */}
              {isDeposit && (
                <Paper p="xl" radius="lg" withBorder shadow="sm">
                  <Stack gap="md">
                    <Group gap="sm">
                      <IconKey size={20} color="var(--upagain-neutral-green)" />
                      <Title order={4}>{t("admin:listings.details.access_info")}</Title>
                    </Group>

                    {isLoadingDepositCodes ? (
                      <Center py="xl">
                        <Loader size="sm" />
                      </Center>
                    ) : myCode ? (
                      <Stack gap="sm">
                        <Group justify="space-between">
                          <Group gap="xs">
                            <ThemeIcon size="sm" variant="light">
                              <IconUserShield size={14} />
                            </ThemeIcon>
                            <Text size="sm" fw={700}>
                              {t("admin:listings.details.owner")}
                            </Text>
                          </Group>
                          <Badge size="xs" variant="outline">
                            {myCode.status.toUpperCase()}
                          </Badge>
                        </Group>

                        <Paper bg="var(--mantine-color-gray-0)" p="md" radius="md">
                          <Stack gap={8} align="center">
                            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                              {t("admin:listings.details.six_digits_code")}
                            </Text>
                            <Group gap={4}>
                              <Title order={3}>
                                {myCode.code.slice(0, 3)} {myCode.code.slice(3)}
                              </Title>
                              <CopyButton value={myCode.code}>
                                {({ copied, copy }) => (
                                  <Tooltip label={copied ? "Copied" : "Copy"}>
                                    <ActionIcon
                                      color={copied ? "teal" : "gray"}
                                      variant="subtle"
                                      onClick={copy}
                                    >
                                      {copied ? (
                                        <IconCheck size={14} />
                                      ) : (
                                        <IconCopy size={14} />
                                      )}
                                    </ActionIcon>
                                  </Tooltip>
                                )}
                              </CopyButton>
                            </Group>
                            <Image
                              src={resolveUrl(myCode.path)}
                              radius="md"
                              alt="Access QR Code"
                              mt="xs"
                            />
                            <Text size="xs" c="dimmed" ta="center" mt="xs">
                              {t("admin:listings.details.valid_to")}{" "}
                              {dayjs(myCode.valid_to).format("DD/MM/YYYY HH:mm")}
                            </Text>
                          </Stack>
                        </Paper>
                        {buyerCodeExists && (
                          <Text size="xs" c="green" ta="center" fw={600}>
                            Buyer's code has been generated.
                          </Text>
                        )}
                      </Stack>
                    ) : (
                      <Text size="sm" c="dimmed" italic>
                        {t("admin:listings.details.no_access_code")}
                      </Text>
                    )}
                  </Stack>
                </Paper>
              )}

              {/* PURCHASE CONFIRMATION CODE SECTION */}
              <Paper p="xl" radius="lg" withBorder shadow="sm">
                <Stack gap="md">
                  <Group gap="sm">
                    <IconChecklist
                      size={20}
                      color="var(--upagain-neutral-green)"
                    />
                    <Title order={4}>Purchase Confirmation</Title>
                  </Group>

                  {/* TODO: Implement real confirmation code logic for listings/purchases */}
                  {item.status === "completed" || transactions.length > 0 ? (
                    <Box
                      p="md"
                      radius="md"
                      style={{
                        border: "2px dashed var(--upagain-neutral-green)",
                        backgroundColor: "rgba(var(--upagain-neutral-green-rgb), 0.05)",
                      }}
                    >
                      <Stack gap={4} align="center">
                        <Text size="xs" fw={700} c="dimmed">
                          CONFIRMATION CODE
                        </Text>
                        <Title order={2} c="var(--upagain-neutral-green)">
                          #829 104
                        </Title>
                        <Text size="xs" ta="center" c="dimmed">
                          Give this code to the buyer to confirm the physical exchange.
                        </Text>
                      </Stack>
                    </Box>
                  ) : (
                    <Text size="sm" c="dimmed" italic>
                      No active purchase for this item yet.
                    </Text>
                  )}
                </Stack>
              </Paper>

              <Divider />

              {/* ADVICE */}
              <Paper p="lg" radius="md" bg="var(--upagain-light-green)" withBorder>
                <Group gap="sm" wrap="nowrap" align="flex-start">
                  <IconInfoCircle size={20} color="var(--upagain-neutral-green)" />
                  <Stack gap={4}>
                    <Text size="sm" fw={700}>
                      {t("marketplace:detail.retrieval.title")}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {isListing
                        ? "Arrange a meeting with the buyer once the purchase is confirmed."
                        : "Drop off your item at the assigned container using the access code above."}
                    </Text>
                  </Stack>
                </Group>
              </Paper>
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>

      <PhotosCarousel
        photos={item.images || []}
        opened={lightboxOpened}
        onClose={() => setLightboxOpened(false)}
        defaultActiveSlide={lightboxSlide}
      />
    </Container>
  );
}
