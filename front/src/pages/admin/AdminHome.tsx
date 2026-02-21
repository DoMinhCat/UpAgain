import { Container, Title, SimpleGrid, Divider, Paper } from "@mantine/core";
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
import classes from "../../components/admin/Admin.module.css";
import PaginationFooter from "../../components/PaginationFooter";

export default function AdminHome() {
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

  return (
    <Container px="md" size="xl">
      <Title order={2} mt="lg" mb="xl">
        Overview Dashboard
      </Title>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
        <AdminCardInfo
          icon={IconUsers}
          title="Total Users"
          value={99999}
          description={
            <StatsCardDesc
              stats={67}
              percentage={15.6}
              icon={IconArrowUp}
              description=" users from last month"
            />
          }
        />
        <AdminCardInfo
          icon={IconClipboardCheck}
          title="Pending requests"
          value={18}
        />
        <AdminCardInfo
          icon={IconLeaf}
          title="Total CO₂ saved"
          value={18}
          description={
            <StatsCardDesc
              stats={67}
              percentage={15.6}
              icon={IconArrowUp}
              description="kg from last month"
            />
          }
        />
        <AdminCardInfo icon={IconBox} title="Available containers" value={18} />
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
        />
        <AdminCardNav
          title="Validation"
          description="Validate or reject pending requests"
          icon={IconClipboardCheck}
        />
        <AdminCardNav
          title="Container"
          description="Manage UpAgain's containers"
          icon={IconBox}
        />
        <AdminCardNav
          title="Event"
          description="Manage upcoming & on-going events/workshops"
          icon={IconCalendarEventFilled}
        />
        <AdminCardNav
          title="Subscription"
          description="Manage subscription price & premium accounts"
          icon={IconDiamond}
        />
        <AdminCardNav
          title="Posts"
          description="Manage comunity & sponsored posts"
          icon={IconArticle}
        />
        <AdminCardNav
          title="Listings"
          description="Manage listings posted by users"
          icon={IconBuildingStore}
        />
        <AdminCardNav
          title="Finance Hub"
          description="Analyze UpAgain's income"
          icon={IconPigMoney}
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
        {/* TODO: sort and filter button */}
        <AdminTable
          header={demoAdminActivities.header}
          body={demoAdminActivities.body}
          footer={
            <PaginationFooter
              start_item={1}
              end_item={10}
              total={157}
              unit="records"
              page_count={15}
            ></PaginationFooter>
          }
        ></AdminTable>
      </Paper>
    </Container>
  );
}
