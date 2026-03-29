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
} from "@mantine/core";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  IconArrowUp,
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
} from "../../components/admin/AdminCardInfo";
import AdminCardNav from "../../components/admin/AdminCardNav";
import AdminTable from "../../components/admin/AdminTable";
import classes from "../../styles/Admin.module.css";
import PaginationFooter from "../../components/PaginationFooter";
import { PATHS } from "../../../src/routes/paths";
import { useAccountCountStats } from "../../hooks/accountHooks";
import { useContainerCountStats } from "../../hooks/containerHooks";
import { useValidationStats } from "../../hooks/validationHooks";
import { useGetTotalScore } from "../../hooks/userHooks";
import { useGetAdminHistory } from "../../hooks/historyHooks";

export default function AdminHome() {
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

  const historyHeader = ["Timestamp", "Admin", "Module", "Item's ID", "Action"];

  const {
    data: accountCountStats,
    isLoading: isLoadingAccountCountStats,
    error: errorAccountCountStats,
  } = useAccountCountStats();

  const {
    data: containerCountStats,
    isLoading: isLoadingContainerCountStats,
    error: errorContainerCountStats,
  } = useContainerCountStats();

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
        Overview Dashboard
      </Title>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
        <AdminCardInfo
          icon={IconUsers}
          title="Total Users"
          value={accountCountStats?.total ?? 0}
          path={PATHS.ADMIN.USERS.ALL}
          description={
            errorAccountCountStats ? (
              <Text c="red">An error occurred while loading user stats</Text>
            ) : isLoadingAccountCountStats ? (
              <Loader size="sm" />
            ) : (
              <StatsCardDesc
                stats={accountCountStats?.increase ?? 0}
                icon={IconArrowUp}
                description=" users since last month"
              />
            )
          }
        />
        <AdminCardInfo
          icon={IconClipboardCheck}
          title="Pending requests"
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
                An error occurred while loading validation stats
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
                icon={IconAlertTriangle}
                description=" requests waiting for validation"
              />
            )
          }
        />
        <AdminCardInfo
          icon={IconLeaf}
          title="Total UpScore"
          value={totalScore?.total || 0}
          description={
            isLoadingTotalScore ? (
              <Loader size="sm" />
            ) : errorTotalScore ? (
              <Text c="red">An error occurred while loading total score</Text>
            ) : (
              <StatsCardDesc
                stats={totalScore?.co2 || 0}
                icon={IconLeaf}
                description={
                  totalScore?.co2 === 1
                    ? " kg of CO2 avoided by the community"
                    : " kg of CO2 avoided by the community"
                }
              />
            )
          }
        />
        <AdminCardInfo
          icon={IconBox}
          title="Available containers"
          value={
            containerCountStats?.active + " / " + containerCountStats?.total
          }
          path={PATHS.ADMIN.CONTAINERS}
          description={
            errorContainerCountStats ? (
              <Text c="red">
                An error occurred while loading container stats
              </Text>
            ) : isLoadingContainerCountStats ? (
              <Loader size="sm" />
            ) : (
              <Box mt="xs">
                <Text c="dimmed">
                  {((containerCountStats?.active ?? 0) /
                    (containerCountStats?.total ?? 0)) *
                    100}
                  % of containers in service
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
        Quick Navigation
      </Title>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
        <AdminCardNav
          title="User"
          description="Manage user accounts"
          icon={IconUsers}
          path={PATHS.ADMIN.USERS.ALL}
        />
        <AdminCardNav
          title="Validation"
          description="Validate or reject pending requests"
          icon={IconClipboardCheck}
          path={PATHS.ADMIN.VALIDATIONS.ALL}
        />
        <AdminCardNav
          title="Container"
          description="Manage UpAgain's containers"
          icon={IconBox}
          path={PATHS.ADMIN.CONTAINERS}
        />
        <AdminCardNav
          title="Event/Workshop"
          description="Manage upcoming & on-going events/workshops"
          icon={IconCalendarEventFilled}
          path={PATHS.ADMIN.EVENTS.ALL}
        />
        <AdminCardNav
          title="Subscription"
          description="Manage subscription price & premium accounts"
          icon={IconDiamond}
          path={PATHS.ADMIN.SUBSCRIPTIONS}
        />
        <AdminCardNav
          title="Posts"
          description="Manage comunity & sponsored posts"
          icon={IconArticle}
          path={PATHS.ADMIN.POSTS}
        />
        <AdminCardNav
          title="Listings"
          description="Manage listings posted by users"
          icon={IconBuildingStore}
          path={PATHS.ADMIN.LISTINGS}
        />
        <AdminCardNav
          title="Finance Hub"
          description="Analyze UpAgain's income"
          icon={IconPigMoney}
          path={PATHS.ADMIN.FINANCE.ALL}
        />
      </SimpleGrid>

      <Divider my="xl" size="xs" color="gray.3" />

      <Title order={2} mb="xl">
        Admin History
      </Title>

      <Grid align="flex-end" mb="md">
        <Grid.Col span={{ base: 12, md: 3 }}>
          <TextInput
            label="Search"
            variant="filled"
            placeholder="Search by admin's name or item's ID..."
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
            label="Sort by"
            placeholder="Pick one sort method"
            data={[
              {
                value: "most_recent_activity",
                label: "Most recent activity",
              },
              { value: "oldest_activity", label: "Oldest activity" },
            ]}
            value={filters.sortValue}
            clearable
            disabled={isLoadingHistory}
            onChange={(val) => handleFilterChange("sortValue", val)}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 6, sm: 4, md: 2 }}>
          <Select
            label="Module"
            placeholder="All modules"
            data={[
              { value: "employee", label: "Employee" },
              { value: "user", label: "User" },
              { value: "pro", label: "Pro" },
              { value: "event", label: "Event" },
              { value: "container", label: "Container" },
              { value: "post", label: "Post" },
              { value: "comment", label: "Comment" },
              { value: "listing", label: "Listing" },
              { value: "deposit", label: "Deposit" },
              { value: "subscription", label: "Subscription" },
              { value: "finance_setting", label: "Finance Setting" },
              { value: "posts", label: "Posts" },
              { value: "finance", label: "Finance" },
            ]}
            value={filters.moduleValue}
            disabled={isLoadingHistory}
            onChange={(val) => handleFilterChange("moduleValue", val)}
            clearable
          />
        </Grid.Col>
        <Grid.Col span={{ base: 6, sm: 4, md: 2 }}>
          <Select
            label="Action"
            placeholder="All actions"
            data={[
              { value: "create", label: "Create" },
              { value: "update", label: "Update" },
              { value: "delete", label: "Delete" },
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
              Apply filters
            </Button>
            <Button variant="secondary" onClick={handleResetFilters}>
              Reset
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
                <Table.Td ta="center">{row.admin_username}</Table.Td>
                <Table.Td ta="center">{row.module}</Table.Td>
                <Table.Td ta="center">{row.item_id}</Table.Td>
                <Table.Td ta="center">{row.action}</Table.Td>
              </Table.Tr>
            ))
          )}
        </AdminTable>
      </Paper>
    </Container>
  );
}
