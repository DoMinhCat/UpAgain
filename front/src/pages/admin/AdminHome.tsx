import {
  Container,
  Title,
  SimpleGrid,
  Divider,
  Paper,
  Table,
  Flex,
  Button,
  Progress,
  Grid,
  TextInput,
  Select,
  Text,
  Box,
  Loader,
  Group,
  Badge,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  IconArrowUpRight,
  IconPigMoney,
  IconAlertTriangle,
  IconUsers,
  IconCalendarEventFilled,
  IconClipboardCheck,
  IconDiamond,
  IconBox,
  IconArticle,
  IconBuildingStore,
  IconLeaf,
  IconSearch,
} from "@tabler/icons-react";
import {
  AdminCardInfo,
  StatsCardDesc,
} from "../../components/dashboard/AdminCardInfo";
import AdminCardNav from "../../components/nav/AdminCardNav";
import AdminTable from "../../components/admin/AdminTable";
import classes from "../../styles/Admin.module.css";
import PaginationFooter from "../../components/common/PaginationFooter";
import { PATHS } from "../../../src/routes/paths";
import { useAccountCountStats } from "../../hooks/accountHooks";
import { useGetContainerStats } from "../../hooks/containerHooks";
import { useValidationStats } from "../../hooks/validationHooks";
import { useGetTotalScore } from "../../hooks/userHooks";
import { useGetAdminHistory } from "../../hooks/historyHooks";

export default function AdminHome() {
  const { t } = useTranslation("admin");
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    searchValue: "",
    sortValue: "most_recent_activity" as string | null,
    moduleValue: null as string | null,
    actionValue: null as string | null,
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [page, setPage] = useState(1);
  const LIMIT = 10;

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const hasFilters = Boolean(
    appliedFilters.searchValue ||
    appliedFilters.moduleValue ||
    appliedFilters.actionValue ||
    (appliedFilters.sortValue &&
      appliedFilters.sortValue !== "most_recent_activity"),
  );

  const handleSearchClick = () => {
    setAppliedFilters(filters);
    setPage(1);
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      searchValue: "",
      sortValue: "most_recent_activity",
      moduleValue: null,
      actionValue: null,
    };
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setPage(1);
  };

  const { data: historyData, isLoading: isLoadingHistory } = useGetAdminHistory(
    hasFilters ? -1 : page,
    hasFilters ? -1 : LIMIT,
    appliedFilters.searchValue,
    appliedFilters.sortValue ?? undefined,
    appliedFilters.moduleValue ?? undefined,
    appliedFilters.actionValue ?? undefined,
  );

  const historyHeader = [
    t("history.table.timestamp"),
    t("history.table.admin"),
    t("history.table.module"),
    t("history.table.item_id"),
    t("history.table.action"),
  ];

  const {
    data: accountCountStats,
    isLoading: isLoadingAccountCountStats,
    error: errorAccountCountStats,
  } = useAccountCountStats();

  const {
    data: containerCountStats,
    isLoading: isLoadingContainerCountStats,
    error: errorContainerCountStats,
  } = useGetContainerStats();

  const {
    data: validationStats,
    isLoading: isLoadingValidationStats,
    error: errorValidationStats,
  } = useValidationStats();

  const {
    data: totalScore,
    isLoading: isLoadingTotalScore,
    error: errorTotalScore,
  } = useGetTotalScore();

  return (
    <Container px="md" size="xl">
      <Title order={2} mt="lg" mb="xl">
        {t("dashboard.title")}
      </Title>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
        <AdminCardInfo
          icon={IconUsers}
          title={t("dashboard.total_users")}
          value={accountCountStats?.total ?? 0}
          path={PATHS.ADMIN.USERS.ALL}
          description={
            errorAccountCountStats ? (
              <Text c="red">{t("dashboard.errors.user_stats")}</Text>
            ) : isLoadingAccountCountStats ? (
              <Loader size="sm" />
            ) : (
              <StatsCardDesc
                stats={accountCountStats?.increase ?? 0}
                icon={
                  <IconArrowUpRight
                    size={24}
                    color="var(--upagain-neutral-green)"
                  />
                }
                description={t("dashboard.stats.users_since_last_month")}
              />
            )
          }
        />
        <AdminCardInfo
          icon={IconClipboardCheck}
          title={t("dashboard.pending_requests")}
          value={
            validationStats?.pending_deposits ||
            0 +
              (validationStats?.pending_listings || 0) +
              (validationStats?.pending_events || 0)
          }
          path={PATHS.ADMIN.VALIDATIONS.ALL}
          description={
            errorValidationStats ? (
              <Text c="red">
                {t("dashboard.errors.validation_stats")}
              </Text>
            ) : isLoadingValidationStats ? (
              <Loader size="sm" />
            ) : (
              <StatsCardDesc
                stats={
                  validationStats?.pending_deposits ||
                  0 +
                    (validationStats?.pending_listings || 0) +
                    (validationStats?.pending_events || 0)
                }
                icon={
                  <IconAlertTriangle size={24} color="var(--upagain-yellow)" />
                }
                description={t("dashboard.stats.waiting_validation")}
              />
            )
          }
        />
        <AdminCardInfo
          icon={IconLeaf}
          title={t("dashboard.total_upscore")}
          value={totalScore?.total || 0}
          description={
            isLoadingTotalScore ? (
              <Loader size="sm" />
            ) : errorTotalScore ? (
              <Text c="red">{t("dashboard.errors.score_stats")}</Text>
            ) : (
              <StatsCardDesc
                stats={totalScore?.co2 || 0}
                icon={
                  <IconLeaf size={24} color="var(--upagain-neutral-green)" />
                }
                description={t("dashboard.stats.co2_avoided")}
              />
            )
          }
        />
        <AdminCardInfo
          icon={IconBox}
          title={t("dashboard.available_containers")}
          value={
            containerCountStats?.active + " / " + containerCountStats?.total
          }
          path={PATHS.ADMIN.CONTAINERS}
          description={
            errorContainerCountStats ? (
              <Text c="red">
                {t("dashboard.errors.container_stats")}
              </Text>
            ) : isLoadingContainerCountStats ? (
              <Loader size="sm" />
            ) : (
              <Box mt="xs">
                <Text c="dimmed">
                  {t("dashboard.stats.containers_in_service", {
                    percent:
                      ((containerCountStats?.active ?? 0) /
                        (containerCountStats?.total ?? 0)) *
                      100,
                  })}
                </Text>
                <Progress
                  value={
                    ((containerCountStats?.active ?? 0) /
                      (containerCountStats?.total ?? 0)) *
                    100
                  }
                />
              </Box>
            )
          }
        />
      </SimpleGrid>

      <Divider my="xl" size="xs" color="gray.3" />

      <Title order={2} mb="xl">
        {t("navigation.title")}
      </Title>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
        <AdminCardNav
          title={t("navigation.user.title")}
          description={t("navigation.user.description")}
          icon={IconUsers}
          path={PATHS.ADMIN.USERS.ALL}
        />
        <AdminCardNav
          title={t("navigation.validation.title")}
          description={t("navigation.validation.description")}
          icon={IconClipboardCheck}
          path={PATHS.ADMIN.VALIDATIONS.ALL}
        />
        <AdminCardNav
          title={t("navigation.container.title")}
          description={t("navigation.container.description")}
          icon={IconBox}
          path={PATHS.ADMIN.CONTAINERS}
        />
        <AdminCardNav
          title={t("navigation.event.title")}
          description={t("navigation.event.description")}
          icon={IconCalendarEventFilled}
          path={PATHS.ADMIN.EVENTS.ALL}
        />
        <AdminCardNav
          title={t("navigation.subscription.title")}
          description={t("navigation.subscription.description")}
          icon={IconDiamond}
          path={PATHS.ADMIN.SUBSCRIPTIONS.ALL}
        />
        <AdminCardNav
          title={t("navigation.posts.title")}
          description={t("navigation.posts.description")}
          icon={IconArticle}
          path={PATHS.ADMIN.POSTS}
        />
        <AdminCardNav
          title={t("navigation.listings.title")}
          description={t("navigation.listings.description")}
          icon={IconBuildingStore}
          path={PATHS.ADMIN.LISTINGS}
        />
        <AdminCardNav
          title={t("navigation.finance.title")}
          description={t("navigation.finance.description")}
          icon={IconPigMoney}
          path={PATHS.ADMIN.FINANCE.ALL}
        />
      </SimpleGrid>

      <Divider my="xl" size="xs" color="gray.3" />

      <Title order={2} mb="xl">
        {t("history.title")}
      </Title>

      <Grid align="flex-end" mb="md">
        <Grid.Col span={{ base: 12, md: 3 }}>
          <TextInput
            label={t("history.filters.search")}
            placeholder={t("history.filters.search_placeholder")}
            disabled={isLoadingHistory}
            rightSection={<IconSearch size={14} />}
            value={filters.searchValue}
            onChange={(e) => handleFilterChange("searchValue", e.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSearchClick();
              }
            }}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 6, sm: 4, md: 2 }}>
          <Select
            label={t("history.filters.sort")}
            placeholder={t("history.filters.sort_placeholder")}
            data={[
              {
                value: "most_recent_activity",
                label: t("history.filters.sort_recent"),
              },
              { value: "oldest_activity", label: t("history.filters.sort_oldest") },
            ]}
            value={filters.sortValue}
            clearable
            disabled={isLoadingHistory}
            onChange={(val) => handleFilterChange("sortValue", val)}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 6, sm: 4, md: 2 }}>
          <Select
            label={t("history.filters.module")}
            placeholder={t("history.filters.module_placeholder")}
            data={[
              { value: "employee", label: t("modules.employee") },
              { value: "user", label: t("modules.user") },
              { value: "pro", label: t("modules.pro") },
              { value: "event", label: t("modules.event") },
              { value: "container", label: t("modules.container") },
              { value: "post", label: t("modules.post") },
              { value: "comment", label: t("modules.comment") },
              { value: "listing", label: t("modules.listing") },
              { value: "deposit", label: t("modules.deposit") },
              { value: "subscription", label: t("modules.subscription") },
              { value: "finance_setting", label: t("modules.finance_setting") },
              { value: "posts", label: t("modules.posts") },
              { value: "finance", label: t("modules.finance") },
            ]}
            value={filters.moduleValue}
            disabled={isLoadingHistory}
            onChange={(val) => handleFilterChange("moduleValue", val)}
            clearable
          />
        </Grid.Col>
        <Grid.Col span={{ base: 6, sm: 4, md: 2 }}>
          <Select
            label={t("history.filters.action")}
            placeholder={t("history.filters.action_placeholder")}
            data={[
              { value: "create", label: t("actions.create") },
              { value: "update", label: t("actions.update") },
              { value: "delete", label: t("actions.delete") },
            ]}
            value={filters.actionValue}
            disabled={isLoadingHistory}
            onChange={(val) => handleFilterChange("actionValue", val)}
            clearable
          />
        </Grid.Col>

        <Grid.Col span={{ base: 6, sm: 12, md: 3 }}>
          <Group gap="xs" grow>
            <Button variant="primary" onClick={handleSearchClick}>
              {t("history.filters.apply")}
            </Button>
            <Button variant="secondary" onClick={handleResetFilters}>
              {t("history.filters.reset")}
            </Button>
          </Group>
        </Grid.Col>
      </Grid>
      <Paper
        withBorder
        p="md"
        radius="lg"
        shadow="md"
        className={classes.customBorder}
      >
        <AdminTable
          header={historyHeader}
          footer={
            <PaginationFooter
              activePage={page}
              setPage={setPage}
              total_records={historyData?.total_records ?? 0}
              last_page={historyData?.last_page ?? 1}
              limit={LIMIT}
              unit="activities"
              hidden={hasFilters}
            />
          }
        >
          {isLoadingHistory ? (
            <Table.Tr>
              <Table.Td colSpan={5}>
                <Flex justify="center" py="md">
                  <Loader />
                </Flex>
              </Table.Td>
            </Table.Tr>
          ) : historyData?.histories.length === 0 ? (
            <Table.Tr>
              <Table.Td colSpan={5}>
                <Flex justify="center" py="md">
                  <Text>{t("history.table.no_records")}</Text>
                </Flex>
              </Table.Td>
            </Table.Tr>
          ) : (
            historyData?.histories.map((row) => (
              <Table.Tr
                key={row.id}
                onClick={() =>
                  navigate(
                    PATHS.ADMIN.HISTORY.DETAILS.replace(
                      ":id",
                      row.id.toString(),
                    ),
                  )
                }
                style={{ cursor: "pointer" }}
              >
                <Table.Td ta="center">
                  {dayjs(row.created_at).format("DD/MM/YYYY HH:mm")}
                </Table.Td>
                <Table.Td ta="center">{row.admin_name}</Table.Td>
                <Table.Td ta="center">
                  {t(`modules.${row.module}` as any, {
                    defaultValue: row.module
                      .replace(/_/g, " ")
                      .charAt(0)
                      .toUpperCase() + row.module.slice(1).replace(/_/g, " "),
                  })}
                </Table.Td>
                <Table.Td ta="center">
                  {typeof row.item_id === "string"
                    ? row.item_id.replace(/_/g, " ").charAt(0).toUpperCase() +
                      row.item_id.slice(1).replace(/_/g, " ")
                    : (row.item_id ?? "—")}
                </Table.Td>
                <Table.Td ta="center">
                  <Badge
                    variant={
                      row.action === "create"
                        ? "green"
                        : row.action === "update"
                          ? "yellow"
                          : "red"
                    }
                  >
                    {t(`actions.${row.action}` as any, {
                      defaultValue:
                        row.action.charAt(0).toUpperCase() +
                        row.action.slice(1),
                    })}
                  </Badge>
                </Table.Td>
              </Table.Tr>
            ))
          )}
        </AdminTable>
      </Paper>
    </Container>
  );
}
