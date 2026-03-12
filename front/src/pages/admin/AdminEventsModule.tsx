import {
  Container,
  Group,
  SimpleGrid,
  Title,
  Grid,
  TextInput,
  Select,
  Button,
  Stack,
} from "@mantine/core";
import {
  IconCalendarEventFilled,
  IconArrowUp,
  IconSearch,
  IconPlus,
  IconCalendarTime,
  IconCalendarCheck,
  IconClockCheck,
} from "@tabler/icons-react";
import {
  AdminCardInfo,
  StatsCardDesc,
} from "../../components/admin/AdminCardInfo";
import { useState } from "react";

export default function AdminEventsModule() {
  // TODO for filtering
  const [filters, setFilters] = useState<{
    searchValue: string | undefined;
    sortValue: string | null;
    statusValue: string | null;
  }>({ searchValue: "", sortValue: null, statusValue: null });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [activePage, setPage] = useState(1);
  const LIMIT = 10;

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };
  const hasFilters = Boolean(
    appliedFilters.searchValue ||
    appliedFilters.statusValue ||
    appliedFilters.sortValue,
  );

  const handleSearchClick = () => {
    setAppliedFilters(filters);
    setPage(1);
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      searchValue: "",
      sortValue: null,
      statusValue: null,
    };
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setPage(1);
  };
  return (
    <Container px="md" size="xl">
      <Title order={2} mt="lg" mb="xl">
        Event Management
      </Title>

      {/* stats cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
        <AdminCardInfo
          icon={IconCalendarEventFilled}
          title="Total Events"
          value={99999}
          description={
            <StatsCardDesc
              stats={67}
              percentage={15.6}
              icon={IconArrowUp}
              description=" new events since last month"
            />
          }
        />
        <AdminCardInfo
          icon={IconCalendarTime}
          title="Upcoming events"
          value={15}
          description={
            <StatsCardDesc
              stats={67}
              percentage={15.6}
              icon={IconArrowUp}
              description=" events happening in the next 30 days"
            />
          }
        />
        <AdminCardInfo
          icon={IconCalendarCheck}
          title="Registrations (last 30 days)"
          value={626}
          description={
            <StatsCardDesc
              stats={67}
              percentage={15.6}
              icon={IconArrowUp}
              description=" registrations during the last month"
            />
          }
        />
        <AdminCardInfo
          icon={IconClockCheck}
          title="Pending Approval"
          value={45}
          description={
            <StatsCardDesc
              stats={67}
              percentage={15.6}
              icon={IconArrowUp}
              description=" requires review and validation"
            />
          }
        />
      </SimpleGrid>

      <Stack gap="md" my="xl">
        <Group justify="space-between" align="flex-end">
          <Title c="dimmed" order={3}>
            Manage events and assign employees
          </Title>

          <Group gap="xs" align="flex-end">
            <Button variant="primary" leftSection={<IconPlus size={16} />}>
              New Event
            </Button>
          </Group>
        </Group>
        {/* filter options */}
        <Grid align="flex-end">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <TextInput
              label="Search"
              variant="filled"
              placeholder="Search by username, email or ID..."
              rightSection={<IconSearch size={14} />}
              value={filters.searchValue}
              onChange={(e) =>
                handleFilterChange("searchValue", e.target.value)
              }
            />
          </Grid.Col>

          <Grid.Col span={{ base: 6, sm: 4, md: 3 }}>
            <Select
              label="Sort by"
              placeholder="Pick one"
              data={[
                {
                  value: "most_recent_registration",
                  label: "Most recent registration",
                },
                { value: "oldest_registration", label: "Oldest registration" },
                {
                  value: "most_recent_last_active",
                  label: "Most recent last active",
                },
                {
                  value: "oldest_last_active",
                  label: "Oldest last active",
                },
              ]}
              value={filters.sortValue}
              clearable
              onChange={(val) => handleFilterChange("sortValue", val)}
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
              value={filters.statusValue}
              onChange={(val) => handleFilterChange("statusValue", val)}
              clearable
            />
          </Grid.Col>

          <Grid.Col span={{ base: 6, sm: 4, md: 3 }}>
            <Group gap="xs" grow>
              <Button onClick={handleSearchClick} variant="primary">
                Apply filters
              </Button>
              <Button variant="secondary" onClick={handleResetFilters}>
                Reset
              </Button>
            </Group>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}
