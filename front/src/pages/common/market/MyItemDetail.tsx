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
  TextInput,
  Button,
  SimpleGrid,
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
import DOMPurify from "dompurify";
import { useGetListingDetails } from "../../../hooks/listingHooks";
import {
  useGetDepositCodesOfLatestTransaction,
  useGetDepositDetails,
} from "../../../hooks/depositHooks";
import { useDisclosure } from "@mantine/hooks";
import { EditItemModal } from "../../../components/marketplace/EditItemModal";
import dayjs from "dayjs";
import PaginationFooter from "../../../components/common/PaginationFooter";
import type { CodeForAdmin } from "../../../api/interfaces/barcode";

// ── helpers ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "approved"
      ? "green"
      : status === "refused"
        ? "red"
        : status === "completed"
          ? "teal"
          : status === "reserved" || status === "purchased"
            ? "blue"
            : "yellow";
  return (
    <Badge size="lg" radius="md" variant="light" color={color}>
      {status.toUpperCase()}
    </Badge>
  );
}

function AccessCodeCard({
  code,
  label,
  icon,
}: {
  code: CodeForAdmin;
  label: string;
  icon: React.ReactNode;
}) {
  const { t } = useTranslation("common");
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
            alt="QR Code"
            mt="xs"
            fallbackSrc="https://placehold.co/200x200?text=QR"
          />
          <Text size="xs" c="dimmed" ta="center">
            {t("valid_to", { defaultValue: "Valid to:" })}{" "}
            {dayjs(code.valid_to).format("DD/MM/YYYY HH:mm")}
          </Text>
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
            <Table.Tr key={trx.id_transaction}>
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
  const { t } = useTranslation(["marketplace", "home", "common", "admin"]);
  const { user } = useAuth();
  const role = user?.role ?? "user"; // "user" | "pro"
  const params = useParams();
  const id_item = Number(params.id);
  const isValidId = !isNaN(id_item) && id_item > 0;

  // photo lightbox
  const [lightboxOpened, setLightboxOpened] = useState(false);
  const [lightboxSlide, setLightboxSlide] = useState(0);

  const [openedEdit, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);

  // confirmation code input (user → submit 6-digit code to confirm retrieval)
  const [confirmCode, setConfirmCode] = useState("");

  // transactions pagination
  const [activePage, setPage] = useState(1);
  const limit = 5;

  // ── data ──────────────────────────────────────────────────────────────────
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

  // Only users see transaction history (pro role removed by backend)
  const { data: transactionsData, isLoading: isLoadingTransactions } =
    useGetItemTransactions(id_item, isValidId, activePage, limit);

  // Deposit codes accessible to both roles now (backend updated)
  const { data: depositCodes, isLoading: isLoadingDepositCodes } =
    useGetDepositCodesOfLatestTransaction(id_item, isValidId && isDeposit);

  if (isLoadingItem || isListingDetailsLoading || isDepositDetailsLoading)
    return <FullScreenLoader />;

  if (!item) {
    return (
      <Container size="xl" pt={100}>
        <Alert icon={<IconAlertCircle size={16} />} color="red">
          {t("marketplace:my_item_detail.not_found")}
        </Alert>
      </Container>
    );
  }

  const transactions = transactionsData?.transactions || [];
  const latestTx = transactions[0]; // most recent transaction

  // deposit code helpers
  const userDepositCode = depositCodes?.find((c) => c.user_type === "user");
  const proDepositCode = depositCodes?.find((c) => c.user_type === "pro");
  // For pro, their code is the "pro" code; for user, it's the "user" code
  const myDepositCode: CodeForAdmin | undefined =
    role === "pro" ? proDepositCode : userDepositCode;

  // ── derived state flags ───────────────────────────────────────────────────
  const isPending = item.status === "pending";
  const isRefused = item.status === "refused";
  const isApproved = item.status === "approved";
  const isCompleted = item.status === "completed";

  const isReserved = latestTx?.action === "reserved";
  const isPurchased = latestTx?.action === "purchased" && !isCompleted; // bought but not completed

  // ── right-panel sections ─────────────────────────────────────────────────

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
              <Alert
                icon={<IconInfoCircle size={16} />}
                color="blue"
                variant="light"
              >
                {t("marketplace:my_item_detail.pro_reserved_info")}
              </Alert>
              {latestTx && (
                <Stack gap={4}>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    {t("marketplace:my_item_detail.reserved_until")}
                  </Text>
                  {/* TODO: backend should provide reservation expiry date on transaction */}
                  <Text fw={700} size="lg" c="orange">
                    {t("marketplace:my_item_detail.expiry_todo")}
                  </Text>
                </Stack>
              )}
              {/* TODO: integrate purchase action */}
              <Button
                variant="primary"
                fullWidth
                size="md"
                leftSection={<IconBuildingStore size={16} />}
              >
                {t("marketplace:detail.buy")}
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
                  date: dayjs(latestTx.created_at).format("DD/MM/YYYY"),
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
                  <Alert
                    icon={<IconInfoCircle size={14} />}
                    color="green"
                    variant="light"
                    mt="xs"
                  >
                    {t("marketplace:my_item_detail.pro_give_code_reminder")}
                  </Alert>
                </Stack>
              )}
              {isDeposit && depositDetails && (
                <Stack gap={4}>
                  <Text size="sm" c="dimmed">
                    {t("marketplace:my_item_detail.container_id")}:{" "}
                    <strong>#{depositDetails.container_id}</strong>
                  </Text>
                  {/* TODO: fetch container city/address from container details endpoint */}
                  <Text size="xs" c="dimmed">
                    {t("marketplace:my_item_detail.container_address_todo")}
                  </Text>
                </Stack>
              )}
            </Stack>
          </Paper>

          {/* Access code for deposit */}
          {isDeposit && (
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
                ) : myDepositCode ? (
                  <AccessCodeCard
                    code={myDepositCode}
                    label={t("admin:listings.details.buyer")}
                    icon={<IconUserShield size={14} />}
                  />
                ) : (
                  <Text size="sm" c="dimmed">
                    {t("admin:listings.details.no_access_code")}
                  </Text>
                )}
              </Stack>
            </Paper>
          )}

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
                <Alert
                  icon={<IconInfoCircle size={16} />}
                  color="blue"
                  variant="light"
                >
                  {t("marketplace:my_item_detail.pro_confirm_instructions")}
                </Alert>
                {/* TODO: fetch confirmation code from backend once endpoint is implemented */}
                <Paper variant="primary" p="lg" radius="md" withBorder>
                  <Stack gap={4} align="center">
                    <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                      {t("marketplace:my_item_detail.confirmation_code_title")}
                    </Text>
                    <Title order={2} c="var(--upagain-neutral-green)">
                      — — — —
                    </Title>
                    <Text size="xs" c="dimmed" ta="center">
                      {t("marketplace:my_item_detail.code_todo")}
                    </Text>
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
    if (isPending) {
      return (
        <Alert
          icon={<IconInfoCircle size={18} />}
          color="yellow"
          variant="light"
          title={t("marketplace:my_item_detail.pending_title")}
        >
          {t("marketplace:my_item_detail.pending_info")}
        </Alert>
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
            {item.refuse_reason ||
              t("marketplace:my_item_detail.no_refuse_reason")}
          </Alert>
          <Button variant="secondary" size="lg" fullWidth onClick={openEdit}>
            {t("marketplace:detail.edit")}
          </Button>
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
              {/* TODO: reservation expiry from backend */}
              <Text size="xs" c="dimmed">
                {t("marketplace:my_item_detail.expiry_todo")}
              </Text>
            </Stack>
          </Paper>
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
              <Text fw={700}>{latestTx?.username_pro || "—"}</Text>
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
                <TextInput
                  placeholder="XXX XXX"
                  value={confirmCode}
                  onChange={(e) => setConfirmCode(e.currentTarget.value)}
                  maxLength={7}
                  size="md"
                />
                {/* TODO: submit confirmation code to backend */}
                <Button
                  variant="primary"
                  fullWidth
                  disabled={confirmCode.replace(" ", "").length < 6}
                >
                  {t("marketplace:my_item_detail.confirm_button")}
                </Button>
              </Stack>
            </Paper>
          )}

          {isDeposit && (
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
                    )}
                  </>
                ) : (
                  <Text size="sm" c="dimmed">
                    {t("admin:listings.details.no_access_code")}
                  </Text>
                )}
              </Stack>
            </Paper>
          )}
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
              <strong>{latestTx?.username_pro || "—"}</strong>
            </Text>
            {latestTx && (
              <Text size="xs" c="dimmed">
                {t("marketplace:my_item_detail.completed_on", {
                  date: dayjs(latestTx.created_at).format("DD/MM/YYYY"),
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
        <Button variant="secondary" size="lg" fullWidth onClick={openEdit}>
          {t("marketplace:detail.edit")}
        </Button>
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
            { title: item.title, href: "#" },
          ]}
        />

        <Grid gap="xl">
          {/* ── LEFT ── */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap="xl">
              {/* Status row */}
              <Group justify="flex-start" align="center" wrap="wrap">
                <StatusBadge status={item.status} />
                <Text size="sm" c="dimmed">
                  {t("marketplace:my_item_detail.posted_on", {
                    date: dayjs(item.created_at).format("DD/MM/YYYY"),
                  })}
                </Text>
              </Group>

              {/* Photo carousel */}
              {item.images && item.images.length > 0 ? (
                <Box>
                  <PhotosCarousel photos={item.images} initialSlide={0} />
                </Box>
              ) : (
                <Box
                  h={240}
                  style={{
                    background: "var(--mantine-color-gray-1)",
                    borderRadius: "var(--mantine-radius-lg)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text c="dimmed">
                    {t("marketplace:my_item_detail.no_photos")}
                  </Text>
                </Box>
              )}

              <Title order={2}>{item.title}</Title>

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
                    value: `${item.weight} kg`,
                  },
                  {
                    icon: (
                      <IconLeaf
                        size={20}
                        color="var(--upagain-neutral-green)"
                      />
                    ),
                    label: "Score",
                    value: item.score,
                  },
                  {
                    icon: (
                      <IconBox size={20} color="var(--upagain-neutral-green)" />
                    ),
                    label: t("marketplace:detail.state"),
                    value: t(`common:states.${item.state}`, {
                      defaultValue: item.state,
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
                      item.category === "listing"
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

              <Divider />

              {/* Description */}
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
                          {t("marketplace:my_item_detail.container_id")}: #
                          {depositDetails.container_id}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {t(
                            "marketplace:my_item_detail.container_address_todo",
                          )}
                        </Text>
                      </>
                    ) : (
                      <Text size="sm" c="dimmed">
                        {t("marketplace:detail.map_placeholder")}
                      </Text>
                    )}
                  </Stack>
                </Group>
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
                    {item.price > 0 ? `${item.price}€` : t("common:free")}
                  </Title>
                </Stack>
              </Paper>

              {/* Role-specific panels */}
              {role === "pro" ? <ProRightPanel /> : <UserRightPanel />}
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>

      {/* Lightbox — externally controlled */}
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
    </Container>
  );
}
