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

export default function AdminHome() {
  // TODO: replace with real admin history data
  const demoAdminActivities = {
    header: ["Timestamp", "Admin", "Module", "Item's ID", "Action"],
    body: [
      [6, 12.011, "C", "Carbon", "Update"],
      [7, 14.007, "N", "Nitrogen", "Update"],
      [39, 88.906, "Y", "Yttrium", "Update"],
      [56, 137.33, "Ba", "Barium", "Update"],
      [58, 140.12, "Ce", "Cerium", "Update"],
      [6, 12.011, "C", "Carbon", "Update"],
      [7, 14.007, "N", "Nitrogen", "Update"],
      [39, 88.906, "Y", "Yttrium", "Update"],
      [56, 137.33, "Ba", "Barium", "Update"],
      [58, 140.12, "Ce", "Cerium", "Update"],
    ],
  };

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
            <StatsCardDesc
              stats={totalScore?.co2 || 0}
              icon={IconLeaf}
              description={
                totalScore?.co2 === 1
                  ? " kg of CO2 avoided by the community"
                  : " kg of CO2 avoided by the community"
              }
            />
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
            // disabled={isLoadingEvents}
            rightSection={<IconSearch size={14} />}
            // value={filters.searchValue}
            // onChange={(e) =>
            //   handleFilterChange("searchValue", e.target.value)
            // }
            // onKeyDown={(event) => {
            //   if (event.key === "Enter") {
            //     handleSearchClick();
            //   }
            // }}
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
            // value={filters.sortValue}
            clearable
            // disabled={isLoadingEvents}
            // onChange={(val) => handleFilterChange("sortValue", val)}
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
            // value={filters.statusValue}
            // disabled={isLoadingEvents}
            // onChange={(val) => handleFilterChange("statusValue", val)}
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
            // value={filters.statusValue}
            // disabled={isLoadingEvents}
            // onChange={(val) => handleFilterChange("statusValue", val)}
            clearable
          />
        </Grid.Col>

        <Grid.Col span={{ base: 6, sm: 12, md: 3 }}>
          <Group gap="xs" grow>
            <Button variant="primary">Apply filters</Button>
            <Button variant="secondary">Reset</Button>
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
          header={demoAdminActivities.header}
          footer={
            <PaginationFooter
              activePage={1}
              setPage={() => {}}
              total_records={157}
              last_page={16}
              limit={10}
              unit="records"
            />
          }
        >
          {demoAdminActivities.body.map((row, rowIndex) => (
            <Table.Tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <Table.Td ta="center" key={cellIndex}>
                  {cell}
                </Table.Td>
              ))}
            </Table.Tr>
          ))}
        </AdminTable>
      </Paper>
    </Container>
  );
}
