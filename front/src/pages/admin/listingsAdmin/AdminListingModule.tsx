import {
  Container,
  Title,
  Group,
  Grid,
  TextInput,
  SimpleGrid,
  Select,
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
          title="Active Events"
          value={124}
          description={
            <StatsCardDesc
              stats={12}
              icon={IconArrowUpRight}
              description="since last month"
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
              description="new completions"
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
                  h={280}
                  data={[
                    { name: "Tutorial", value: 10, color: "blue.6" },
                    { name: "Project", value: 20, color: "green.6" },
                    { name: "Tips", value: 30, color: "yellow.6" },
                    { name: "News", value: 40, color: "red.6" },
                    { name: "Case Study", value: 50, color: "violet.6" },
                    { name: "Other", value: 60, color: "gray.6" },
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
              placeholder="Search by employee's name, event's ID or title..."
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

          <Grid.Col span={{ base: 6, sm: 4, md: 3 }}>
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
                {
                  value: "earliest_start_date",
                  label: "Earliest start date",
                },
                {
                  value: "latest_start_date",
                  label: "Latest start date",
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
                { value: "active", label: "Active" },
                { value: "banned", label: "Banned" },
              ]}
              // value={filters.statusValue}
              // disabled={isLoadingEvents}
              // onChange={(val) => handleFilterChange("statusValue", val)}
              clearable
            />
          </Grid.Col>

          <Grid.Col span={{ base: 6, sm: 4, md: 3 }}>
            <Group gap="xs" grow>
              <Button variant="primary">Apply filters</Button>
              <Button variant="secondary">Reset</Button>
            </Group>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}
