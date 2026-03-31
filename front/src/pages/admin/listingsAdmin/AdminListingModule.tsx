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
} from "@mantine/core";
import { AdminCardInfo } from "../../../components/admin/AdminCardInfo";
import { StatsCardDesc } from "../../../components/admin/AdminCardInfo";
import {
  IconCalendarEvent,
  IconClockPause,
  IconChecklist,
  IconArrowUpRight,
  IconSearch,
} from "@tabler/icons-react";
import { PieChart } from "@mantine/charts";
import { Paper, Text } from "@mantine/core";
import AdminTable from "../../../components/admin/AdminTable";
import PaginationFooter from "../../../components/PaginationFooter";

export function AdminListingModule() {
  return (
    <Container px="md" size="xl">
      <Title order={2} mt="lg" mb="xl">
        Listing Management
      </Title>

      {/* stats cards */}
      <SimpleGrid cols={{ base: 1, sm: 3 }} mb="xl">
        <AdminCardInfo
          icon={IconCalendarEvent}
          title="Active objects"
          value={124}
          description={
            <StatsCardDesc
              stats={12}
              icon={IconArrowUpRight}
              description=" objects posted since last month"
            />
          }
        />
        <AdminCardInfo
          icon={IconClockPause}
          title="Pending Approval"
          value={8}
          description={
            <StatsCardDesc stats={3} description="require validation" />
          }
        />
        <AdminCardInfo
          icon={IconChecklist}
          title="Transactions"
          value={1420}
          description={
            <StatsCardDesc
              stats={84}
              icon={IconArrowUpRight}
              description=" new transactions since last month"
            />
          }
        />
      </SimpleGrid>

      {/* 2. Bottom Row: Distribution Analysis */}
      <Grid align="stretch">
        <Grid.Col span={12}>
          <Paper withBorder p="lg" radius="md" shadow="sm">
            <Group justify="space-between" mb="xl">
              <Stack gap={0}>
                <Title order={4}>Objects Analytics</Title>
                <Text size="sm" c="dimmed">
                  Distribution by material and category
                </Text>
              </Stack>
            </Group>

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
              {/* Material Chart */}
              <Stack align="center">
                <Text fw={700} size="sm" c="dimmed" tt="uppercase">
                  By Material
                </Text>
                <PieChart
                  withLabelsLine
                  labelsPosition="outside"
                  labelsType="value"
                  withLabels
                  withTooltip
                  tooltipDataSource="segment"
                  h={280}
                  data={[
                    { name: "Wood", value: 10, color: "blue.6" },
                    { name: "Metal", value: 20, color: "green.6" },
                    { name: "Textile", value: 30, color: "yellow.6" },
                    { name: "Glass", value: 40, color: "red.6" },
                    { name: "Plastic", value: 50, color: "violet.6" },
                    { name: "Other", value: 60, color: "gray.6" },
                    { name: "Mixed", value: 60, color: "cyan.6" },
                  ]}
                />
              </Stack>

              {/* Category Chart */}
              <Stack align="center">
                <Text fw={700} size="sm" c="dimmed" tt="uppercase">
                  By Type
                </Text>
                <PieChart
                  withTooltip
                  strokeWidth={2}
                  tooltipDataSource="segment"
                  labelsPosition="inside"
                  labelsType="percent"
                  withLabels
                  h={280}
                  data={[
                    { name: "Listing", value: 70, color: "indigo.6" },
                    { name: "Deposit", value: 30, color: "cyan.6" },
                  ]}
                />
              </Stack>
            </SimpleGrid>
          </Paper>
        </Grid.Col>
      </Grid>

      {/* Search and filters */}
      <Stack gap="md" my="xl">
        <Title c="dimmed" order={3}>
          Manage listings and deposits
        </Title>

        {/* filter options */}
        <Grid align="flex-end">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <TextInput
              label="Search"
              variant="filled"
              placeholder="Search by owner's name, item's ID or title..."
              rightSection={<IconSearch size={14} />}
              // disabled={isLoadingEvents}
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
                  value: "most_recent_creation",
                  label: "Most recent creation",
                },
                { value: "oldest_creation", label: "Oldest creation" },
                {
                  value: "highest_price",
                  label: "Highest price",
                },
                {
                  value: "lowest_price",
                  label: "Lowest price",
                },
              ]}
              clearable
              // value={filters.sortValue}
              // disabled={isLoadingEvents}
              // onChange={(val) => handleFilterChange("sortValue", val)}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 6, sm: 4, md: 2 }}>
            <Select
              label="Status"
              placeholder="All status"
              data={[
                { value: "pending", label: "Pending" },
                { value: "approved", label: "Approved" },
                { value: "refused", label: "Refused" },
                { value: "completed", label: "Completed" },
              ]}
              // value={filters.statusValue}
              // disabled={isLoadingEvents}
              // onChange={(val) => handleFilterChange("statusValue", val)}
              clearable
            />
          </Grid.Col>

          <Grid.Col span={{ base: 6, sm: 4, md: 2 }}>
            <Select
              label="Material"
              placeholder="All materials"
              data={[
                { value: "wood", label: "Wood" },
                { value: "metal", label: "Metal" },
                { value: "textile", label: "Textile" },
                { value: "glass", label: "Glass" },
                { value: "plastic", label: "Plastic" },
                { value: "other", label: "Other" },
                { value: "mixed", label: "Mixed" },
              ]}
              // value={filters.statusValue}
              // disabled={isLoadingEvents}
              // onChange={(val) => handleFilterChange("statusValue", val)}
              clearable
            />
          </Grid.Col>

          <Grid.Col span={{ base: 6, sm: 4, md: 2 }}>
            <Select
              label="Category"
              placeholder="All categories"
              data={[
                { value: "listing", label: "Listing" },
                { value: "deposit", label: "Deposit" },
              ]}
              // value={filters.statusValue}
              // disabled={isLoadingEvents}
              // onChange={(val) => handleFilterChange("statusValue", val)}
              clearable
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 12 }}>
            <Group gap="xs" grow>
              <Button variant="primary">Apply filters</Button>
              <Button variant="secondary">Reset</Button>
            </Group>
          </Grid.Col>
        </Grid>
      </Stack>

      <AdminTable
        //   loading={isAllPostsLoading}
        //   error={allPostsError}
        header={[
          "Created on",
          "ID",
          "Title",
          "Creator",
          "Category",
          "Material",
          "Price",
          "Status",
        ]}
        //   footer={
        //     <PaginationFooter
        //       activePage={activePage}
        //       setPage={setPage}
        //       total_records={posts?.total_records || 0}
        //       last_page={posts?.last_page || 1}
        //       limit={LIMIT}
        //       loading={isAllPostsLoading}
        //       hidden={hasFilters}
        //     />
        //   }
      >
        {/* mapping here */}
        {/* {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <Table.Tr
                    key={post.id}
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      navigate(PATHS.ADMIN.POSTS + "/" + post.id, {
                        state: { from: "allPosts" },
                      })
                    }
                  >
                    <Table.Td ta="center">
                      {dayjs(post.created_at).format("DD/MM/YYYY")}
                    </Table.Td>
                    <Table.Td ta="center">{post.id}</Table.Td>
                    <Table.Td ta="center">{post.title}</Table.Td>
                    <Table.Td ta="center">{post.creator}</Table.Td>
                    <Table.Td ta="center">
                      <Pill
                        variant={
                          post.category === "other"
                            ? "gray"
                            : post.category === "tutorial"
                              ? "blue"
                              : post.category === "project"
                                ? "green"
                                : post.category === "tips"
                                  ? "yellow"
                                  : post.category === "case_study"
                                    ? "violet"
                                    : "red"
                        }
                      >
                        {post.category.charAt(0).toUpperCase() +
                          post.category.slice(1)}
                      </Pill>
                    </Table.Td>
                    <Table.Td ta="center">{post.view_count}</Table.Td>
                    <Table.Td ta="center">{post.like_count}</Table.Td>
                    <Table.Td ta="center">
                      <Group gap="xs" justify="center">
                        <Button
                          size="xs"
                          variant="edit"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            navigate(PATHS.ADMIN.POSTS + "/" + post.id);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="xs"
                          variant="delete"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            handleModalDelete(post);
                          }}
                        >
                          Delete
                        </Button>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={8} ta="center">
                    No posts found
                  </Table.Td>
                </Table.Tr> */}
        {/* )} */}
        <Table.Tr>
          <Table.Td ta="center">20/03/2026</Table.Td>
          <Table.Td ta="center">1</Table.Td>
          <Table.Td ta="center">Title</Table.Td>
          <Table.Td ta="center">Creator</Table.Td>
          <Table.Td ta="center">
            <Badge variant="blue">Listing</Badge>
          </Table.Td>
          <Table.Td ta="center">Wood</Table.Td>
          <Table.Td ta="center">Active</Table.Td>
          <Table.Td ta="center">
            <Badge>Pending</Badge>
          </Table.Td>
        </Table.Tr>
      </AdminTable>
    </Container>
  );
}
