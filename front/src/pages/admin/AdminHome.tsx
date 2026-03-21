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
  Text,
  Stack,
  Box,
  Loader,
} from "@mantine/core";
import {
  IconArrowUp,
  IconPigMoney,
  IconUsers,
  IconCalendarEventFilled,
  IconClipboardCheck,
  IconDiamond,
  IconBox,
  IconArticle,
  IconBuildingStore,
  IconLeaf,
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

export default function AdminHome() {
  // TODO: replace with real admin history data
  const demoAdminActivities = {
    header: ["Timestamp", "Admin", "Module", "Item's ID", "Action", "Detail"],
    body: [
      [6, 12.011, "C", "Carbon", "Update", "None"],
      [7, 14.007, "N", "Nitrogen", "Update", "None"],
      [39, 88.906, "Y", "Yttrium", "Update", "None"],
      [56, 137.33, "Ba", "Barium", "Update", "None"],
      [58, 140.12, "Ce", "Cerium", "Update", "None"],
      [6, 12.011, "C", "Carbon", "Update", "None"],
      [7, 14.007, "N", "Nitrogen", "Update", "None"],
      [39, 88.906, "Y", "Yttrium", "Update", "None"],
      [56, 137.33, "Ba", "Barium", "Update", "None"],
      [58, 140.12, "Ce", "Cerium", "Update", "None"],
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
          value={999}
          path={PATHS.ADMIN.VALIDATIONS.ALL}
        />
        <AdminCardInfo
          icon={IconLeaf}
          title="Total CO₂ saved"
          value={9999}
          description={
            <StatsCardDesc
              stats={9999}
              icon={IconArrowUp}
              description="kg since last month"
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

      <Title order={1} mb="xl">
        Admin Activities
      </Title>

      <Paper
        withBorder
        p="md"
        radius="lg"
        shadow="md"
        className={classes.customBorder}
      >
        <Flex justify="flex-end" align="center" gap="md" mb="md">
          <Button>Sort</Button>
          <Button>Filter</Button>
        </Flex>
        {/* TODO: sort and filter button */}
        <AdminTable
          header={demoAdminActivities.header}
          footer={
            <PaginationFooter
              start_item={1}
              end_item={10}
              total={157}
              unit="records"
              page_count={15}
            ></PaginationFooter>
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
