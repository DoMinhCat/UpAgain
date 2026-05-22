import {
  Container,
  Title,
  Table,
  Avatar,
  Group,
  Text,
  Badge,
  Tabs,
  Paper,
  Button,
  Modal,
  NumberInput,
  Stack,
  ThemeIcon,
  Tooltip,
  Divider,
  Select,
  SimpleGrid,
  Grid,
  TextInput,
} from "@mantine/core";
import {
  IconCurrencyEuro,
  IconPencil,
  IconCrown,
  IconArrowUpRight,
  IconUserCheck,
  IconX,
  IconChartBar,
  IconSearch,
  IconCancel,
  IconClock,
} from "@tabler/icons-react";
import {
  useGetAllSubscriptions,
  useGetSubscriptionPrice,
  useUpdateSubscriptionPrice,
  useGetTrialDays,
  useUpdateTrialDays,
} from "../../../hooks/subscriptionHooks";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../../routes/paths";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import AdminTable from "../../../components/admin/AdminTable";
import PaginationFooter from "../../../components/common/PaginationFooter";
import {
  AdminCardInfo,
  StatsCardDesc,
} from "../../../components/dashboard/AdminCardInfo";
import { useGetSubscriptionStats } from "../../../hooks/subscriptionHooks";
import { useTranslation } from "react-i18next";

const LIMIT = 10;

const getTimeframeLabel = (t: any, key: string) => {
  const labels: Record<string, string> = {
    all: t("common:timeframe.all"),
    today: t("common:timeframe.today"),
    last_3_days: t("common:timeframe.last_3_days"),
    last_week: t("common:timeframe.last_week"),
    last_month: t("common:timeframe.last_month"),
    last_year: t("common:timeframe.last_year"),
  };
  return labels[key] || labels.all;
};

export default function AdminSubscriptions() {
  const { t } = useTranslation("admin");
  const { data: price } = useGetSubscriptionPrice();
  const priceMutation = useUpdateSubscriptionPrice();
  const [openedPrice, { open: openPrice, close: closePrice }] =
    useDisclosure(false);
  const [newPrice, setNewPrice] = useState<number>(0);

  const navigate = useNavigate();

  //filters
  const [activePage, setPage] = useState(1);
  const [filters, setFilters] = useState({
    searchValue: "",
    sortValue: null as string | null,
    isTrialValue: null as string | null,
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const hasFilters = Boolean(
    appliedFilters.searchValue ||
    appliedFilters.sortValue ||
    appliedFilters.isTrialValue,
  );
  //time
  const [chartTime, setChartTime] = useState<string | null>("all");
  const {
    data: subStats,
    isLoading: isLoadingStats,
    isError: errorStats,
  } = useGetSubscriptionStats(chartTime || undefined);
  const timeLabel = getTimeframeLabel(t, chartTime ?? "all");
  const { data: trialDays } = useGetTrialDays();

  //trial
  const trialMutation = useUpdateTrialDays();
  const [openedTrial, { open: openTrial, close: closeTrial }] =
    useDisclosure(false);
  const [newTrialDays, setNewTrialDays] = useState<number>(0);

  // separate pagination state per tab
  const [ongoingPage, setOngoingPage] = useState(1);
  const [canceledPage, setCanceledPage] = useState(1);

  const { data: ongoing, isLoading: loadingOngoing } = useGetAllSubscriptions(
    hasFilters ? -1 : activePage,
    hasFilters ? -1 : LIMIT,
    true,
    appliedFilters.searchValue || undefined,
    appliedFilters.sortValue || undefined,
    appliedFilters.isTrialValue !== null
      ? appliedFilters.isTrialValue === "true"
      : undefined,
  );
  const { data: canceled, isLoading: loadingCanceled } = useGetAllSubscriptions(
    hasFilters ? -1 : activePage,
    hasFilters ? -1 : LIMIT,
    false,
    appliedFilters.searchValue || undefined,
    appliedFilters.sortValue || undefined,
    appliedFilters.isTrialValue !== null
      ? appliedFilters.isTrialValue === "true"
      : undefined,
  );

  const handleFilterChange = (key: string, value: string | null) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearchClick = () => {
    setAppliedFilters(filters);
    setPage(1);
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      searchValue: "",
      sortValue: null,
      isTrialValue: null,
    };
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setPage(1);
  };

  const renderRows = (data: typeof ongoing, showReason = false) =>
    (data?.subscriptions ?? []).length === 0 ? (
      <Table.Tr>
        <Table.Td colSpan={showReason ? 5 : 4}>
          <Text ta="center" c="dimmed" py="md">
            {t("subscriptions.table.no_subscriptions")}
          </Text>
        </Table.Td>
      </Table.Tr>
    ) : (
      (data?.subscriptions ?? []).map((sub) => (
        <Table.Tr
          key={sub.id}
          style={{ cursor: "pointer" }}
          onClick={() => navigate(`${PATHS.ADMIN.SUBSCRIPTIONS.ALL}/${sub.id}`)}
        >
          <Table.Td ta="center">
            {dayjs(sub.sub_from).format("DD/MM/YYYY HH:mm")}
          </Table.Td>
          <Table.Td ta="center">
            {dayjs(sub.sub_to).format("DD/MM/YYYY")}
          </Table.Td>
          <Table.Td ta="center">
            <Group gap="xs" justify="center">
              <Avatar
                src={sub.avatar}
                size="sm"
                radius="xl"
                name={sub.username}
                color="initials"
              />
              <Text size="sm">{sub.username}</Text>
            </Group>
          </Table.Td>
          <Table.Td ta="center">
            <Badge variant="light" color={sub.is_trial ? "blue" : "violet"}>
              {sub.is_trial
                ? t("subscriptions.filters.types.trial")
                : t("subscriptions.filters.types.premium")}
            </Badge>
          </Table.Td>
          {showReason && (
            <Table.Td ta="center" c="dimmed" style={{ maxWidth: 150 }}>
              <Tooltip
                multiline
                w={250}
                withArrow
                disabled={!sub.cancel_reason}
                label={
                  <Text size="xs" lineClamp={3}>
                    {sub.cancel_reason}
                  </Text>
                }
              >
                <Text truncate="end" size="sm" style={{ cursor: "help" }}>
                  {sub.cancel_reason ?? "—"}
                </Text>
              </Tooltip>
            </Table.Td>
          )}
        </Table.Tr>
      ))
    );

  return (
    <Container px="md" size="xl">
      <Group justify="space-between" mb="xl">
        <Title order={2} mt="lg">
          {t("subscriptions.title")}
        </Title>
        <Select
          label={t("common:timeframe.title")}
          placeholder={t("common:timeframe.all")}
          value={chartTime}
          disabled={isLoadingStats}
          onChange={(value) => setChartTime(value)}
          data={[
            { value: "all", label: t("common:timeframe.all") },
            { value: "today", label: t("common:timeframe.today") },
            { value: "last_3_days", label: t("common:timeframe.last_3_days") },
            { value: "last_week", label: t("common:timeframe.last_week") },
            { value: "last_month", label: t("common:timeframe.last_month") },
            { value: "last_year", label: t("common:timeframe.last_year") },
          ]}
        />
      </Group>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg" mb="sm">
        <AdminCardInfo
          icon={IconCrown}
          title={t("subscriptions.stats.total")}
          value={subStats?.total ?? 0}
          error={errorStats}
          loading={isLoadingStats}
          description={
            <StatsCardDesc
              stats={subStats?.active ?? 0}
              icon={
                <IconArrowUpRight
                  size={24}
                  color="var(--upagain-neutral-green)"
                />
              }
              description={t("subscriptions.stats.active")}
            />
          }
        />
        <AdminCardInfo
          icon={IconChartBar}
          title={t("subscriptions.stats.new")}
          value={subStats?.new_subscriptions ?? 0}
          error={errorStats}
          loading={isLoadingStats}
          description={
            <StatsCardDesc
              stats={subStats?.new_subscriptions ?? 0}
              icon={
                <IconArrowUpRight
                  size={24}
                  color="var(--upagain-neutral-green)"
                />
              }
              description={
                subStats?.new_subscriptions === 1
                  ? t("subscriptions.stats.new_desc", { timeLabel })
                  : t("subscriptions.stats.new_desc_plural", { timeLabel })
              }
            />
          }
        />
        <AdminCardInfo
          icon={IconUserCheck}
          title={t("subscriptions.stats.active_trials")}
          value={subStats?.active_trials ?? 0}
          error={errorStats}
          loading={isLoadingStats}
          description={
            <StatsCardDesc
              stats={subStats?.active_trials ?? 0}
              icon={
                <IconArrowUpRight
                  size={24}
                  color="var(--upagain-neutral-green)"
                />
              }
              description={
                subStats?.active_trials === 1
                  ? t("subscriptions.stats.trials_desc")
                  : t("subscriptions.stats.trials_desc_plural")
              }
            />
          }
        />
        <AdminCardInfo
          icon={IconCancel}
          title={t("subscriptions.stats.cancellations")}
          value={subStats?.cancelled ?? 0}
          error={errorStats}
          loading={isLoadingStats}
          description={
            <StatsCardDesc
              stats={subStats?.cancelled ?? 0}
              icon={<IconX size={24} color="red" />}
              description={t("subscriptions.stats.total_cancellations")}
            />
          }
        />
      </SimpleGrid>
      <Text size="sm" c="dimmed" mb="xl">
        {t("subscriptions.stats.timeframe_note")}
      </Text>

      {/* Price card */}
      <Paper withBorder variant="primary" radius="md" p="lg" mb="xl">
        <Group justify="space-between" align="center" wrap="nowrap">
          <Group gap="md" align="center">
            <ThemeIcon
              size={48}
              radius="md"
              variant="light"
              color="var(--upagain-neutral-green)"
            >
              <IconCurrencyEuro size={26} />
            </ThemeIcon>
            <Stack gap={2}>
              <Text size="sm" c="dimmed" fw={500}>
                {t("subscriptions.settings.price_label")}
              </Text>
              <Text fw={900} size="xl">
                {price != null ? `${price} €` : "—"}
              </Text>
            </Stack>
          </Group>
          <Button
            variant="edit"
            leftSection={<IconPencil size={15} />}
            onClick={() => {
              setNewPrice(price ?? 0);
              openPrice();
            }}
          >
            {t("subscriptions.settings.modify")}
          </Button>
        </Group>
        <Divider my="sm" />
        <Group justify="space-between">
          <Group gap="md" align="center">
            <ThemeIcon
              size={48}
              radius="md"
              variant="light"
              color="var(--upagain-neutral-green)"
            >
              <IconClock size={26} />
            </ThemeIcon>
            <Stack gap={2}>
              <Text size="sm" c="dimmed" fw={500}>
                {t("subscriptions.settings.trial_period")}
              </Text>
              <Text fw={900} size="xl">
                {trialDays != null
                  ? `${trialDays} ` +
                    (trialDays > 1
                      ? t("common:time.days")
                      : t("common:time.day"))
                  : "—"}
              </Text>
            </Stack>
          </Group>
          <Button
            variant="edit"
            leftSection={<IconPencil size={15} />}
            onClick={() => {
              setNewTrialDays(trialDays ?? 0);
              openTrial();
            }}
          >
            {t("subscriptions.settings.modify")}
          </Button>
        </Group>
      </Paper>

      <Modal
        opened={openedTrial}
        onClose={closeTrial}
        title={t("subscriptions.settings.update_trial_title")}
        centered
      >
        <NumberInput
          label={t("subscriptions.settings.trial_days")}
          min={1}
          max={90}
          value={newTrialDays}
          onChange={(val) => setNewTrialDays(Number(val))}
        />
        <Group mt="xl" justify="flex-end">
          <Button variant="grey" onClick={closeTrial}>
            {t("common:actions.cancel")}
          </Button>
          <Button
            variant="primary"
            loading={trialMutation.isPending}
            disabled={!newTrialDays || newTrialDays <= 0}
            onClick={() =>
              trialMutation.mutate(newTrialDays, {
                onSuccess: () => closeTrial(),
              })
            }
          >
            {t("common:actions.confirm")}
          </Button>
        </Group>
      </Modal>
      <Stack gap="md" my="xl">
        <Grid align="flex-end">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <TextInput
              label={t("history.filters.search")}
              variant="filled"
              placeholder={t("subscriptions.filters.search_placeholder")}
              rightSection={<IconSearch size={14} />}
              value={filters.searchValue}
              onChange={(e) =>
                handleFilterChange("searchValue", e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearchClick();
              }}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 4, md: 3 }}>
            <Select
              label={t("history.filters.sort")}
              placeholder={t(
                "subscriptions.filters.sort_options.ends_earliest",
              )}
              clearable
              data={[
                {
                  value: "sub_from_asc",
                  label: t("subscriptions.filters.sort_options.oldest"),
                },
                {
                  value: "sub_to_asc",
                  label: t("subscriptions.filters.sort_options.ends_earliest"),
                },
                {
                  value: "sub_to_desc",
                  label: t("subscriptions.filters.sort_options.ends_latest"),
                },
              ]}
              value={filters.sortValue}
              onChange={(val) => handleFilterChange("sortValue", val)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 4, md: 2 }}>
            <Select
              label={t("common:actions.type")}
              placeholder={t("subscriptions.filters.types.all")}
              clearable
              data={[
                {
                  value: "true",
                  label: t("subscriptions.filters.types.trial"),
                },
                {
                  value: "false",
                  label: t("subscriptions.filters.types.premium"),
                },
              ]}
              value={filters.isTrialValue}
              onChange={(val) => handleFilterChange("isTrialValue", val)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 4, md: 3 }}>
            <Group gap="xs" grow>
              <Button onClick={handleSearchClick} variant="primary">
                {t("history.filters.apply")}
              </Button>
              <Button onClick={handleResetFilters} variant="secondary">
                {t("history.filters.reset")}
              </Button>
            </Group>
          </Grid.Col>
        </Grid>
      </Stack>
      {/* Tabs */}
      <Tabs defaultValue="ongoing">
        <Tabs.List mb="md">
          <Tabs.Tab value="ongoing" color="var(--upagain-neutral-green)">
            {t("subscriptions.tabs.active")}
          </Tabs.Tab>
          <Tabs.Tab value="canceled" color="red">
            {t("subscriptions.tabs.canceled")}
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="ongoing">
          <AdminTable
            loading={loadingOngoing}
            header={[
              t("subscriptions.table.start_date"),
              t("subscriptions.table.end_date"),
              t("users.details.fields.username"),
              t("common:actions.type"),
            ]}
            footer={
              <PaginationFooter
                activePage={ongoingPage}
                setPage={setOngoingPage}
                total_records={ongoing?.total_records ?? 0}
                last_page={ongoing?.last_page ?? 1}
                limit={LIMIT}
                loading={loadingOngoing}
                unit="subscriptions"
              />
            }
          >
            {renderRows(ongoing)}
          </AdminTable>
        </Tabs.Panel>

        <Tabs.Panel value="canceled">
          <AdminTable
            loading={loadingCanceled}
            header={[
              t("subscriptions.table.start_date"),
              t("subscriptions.table.end_date"),
              t("users.details.fields.username"),
              t("common:actions.type"),
              t("subscriptions.table.cancel_reason"),
            ]}
            footer={
              <PaginationFooter
                activePage={canceledPage}
                setPage={setCanceledPage}
                total_records={canceled?.total_records ?? 0}
                last_page={canceled?.last_page ?? 1}
                limit={LIMIT}
                loading={loadingCanceled}
                unit="subscriptions"
              />
            }
          >
            {renderRows(canceled, true)}
          </AdminTable>
        </Tabs.Panel>
      </Tabs>

      {/* Edit price modal */}
      <Modal
        opened={openedPrice}
        onClose={closePrice}
        title={t("subscriptions.settings.update_price_title")}
        centered
      >
        <Stack gap="md">
          <NumberInput
            label={t("subscriptions.settings.new_price")}
            min={1}
            step={0.5}
            decimalScale={2}
            value={newPrice}
            onChange={(val) => setNewPrice(Number(val))}
          />
          <Group mt="sm" justify="flex-end">
            <Button variant="grey" onClick={closePrice}>
              {t("common:actions.cancel")}
            </Button>
            <Button
              variant="primary"
              loading={priceMutation.isPending}
              disabled={!newPrice || newPrice <= 0}
              onClick={() =>
                priceMutation.mutate(newPrice, {
                  onSuccess: () => closePrice(),
                })
              }
            >
              {t("common:actions.confirm")}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
