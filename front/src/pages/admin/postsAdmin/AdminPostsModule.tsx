import {
  Container,
  SimpleGrid,
  Title,
  Button,
  Modal,
  Group,
  Stack,
  TextInput,
  NumberInput,
  Grid,
  Select,
} from "@mantine/core";
import {
  IconCalendarEventFilled,
  IconArrowUp,
  IconCalendarTime,
  IconCalendarCheck,
  IconClockCheck,
  IconPlus,
  IconSearch,
} from "@tabler/icons-react";
import {
  AdminCardInfo,
  StatsCardDesc,
} from "../../../components/admin/AdminCardInfo";
import { useNavigate } from "react-router-dom";
import { useDisclosure } from "@mantine/hooks";
import { TextEditor } from "../../../components/TextEditor";

export const AdminPostsModule = () => {
  const navigate = useNavigate();

  // CREATE MODAL
  const [openedCreate, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);

  const handleCloseCreate = () => {
    closeCreate();
  };
  return (
    <Container px="md" size="xl">
      <Title order={2} mt="lg" mb="xl">
        Post Management
      </Title>

      {/* stats cards */}
      <SimpleGrid cols={{ base: 1, sm: 3, lg: 3 }} spacing="lg">
        <AdminCardInfo
          icon={IconCalendarEventFilled}
          title="Total active posts"
          value={9999}
          error={false}
          loading={false}
          description={
            <StatsCardDesc
              stats={9999}
              icon={IconArrowUp}
              description={" posts since last month"}
            />
          }
        />
        <AdminCardInfo
          icon={IconCalendarTime}
          title="Engagement rate"
          value={9999}
          error={false}
          loading={false}
          description={
            <StatsCardDesc
              stats={9999}
              icon={IconArrowUp}
              description={" interactions per post"}
            />
          }
        />
        <AdminCardInfo
          icon={IconClockCheck}
          title="Pending approval"
          value={9999}
          error={false}
          loading={false}
          description={
            <StatsCardDesc
              stats={9999}
              description={" posts require validation"}
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
            <Button
              variant="primary"
              leftSection={<IconPlus size={16} />}
              onClick={openCreate}
            >
              New Event
            </Button>
            <Modal
              opened={openedCreate}
              onClose={handleCloseCreate}
              title="Create Event"
              size="xl"
            >
              <Stack>
                <TextInput
                  data-autofocus
                  withAsterisk
                  placeholder="Give the event a catchy title"
                  label="Tile"
                  // value={title}
                  // onChange={(e) => {
                  //   setTitle(e.target.value);
                  // }}
                  // onBlur={() => validateTitle()}
                  // error={errorTitle}
                  // disabled={createEventMutation.isPending}
                  required
                />
                <NumberInput
                  label="Capacity"
                  placeholder="Maximum number of attendees"
                  min={0}
                  // disabled={createEventMutation.isPending}
                  // value={capacity}
                  suffix=" people"
                  // onChange={(value) => {
                  //   setCapacity(Number(value));
                  // }}
                  // onBlur={() => validateCapacity()}
                  // error={errorCapacity}
                  // disabled={isAccountDetailsLoading}
                />
                <NumberInput
                  withAsterisk
                  label="Price"
                  placeholder="Entry fee - (0 if free)"
                  min={0}
                  prefix="€"
                  // value={price}
                  // disabled={createEventMutation.isPending}
                  // onChange={(value) => {
                  //   setPrice(Number(value));
                  // }}
                  // onBlur={() => validatePrice()}
                  // error={errorPrice}
                  // disabled={isAccountDetailsLoading}
                  required
                />
                <Grid>
                  <Grid.Col span={{ base: 12, md: 9 }}>
                    <TextInput
                      withAsterisk
                      label="Street"
                      // value={street}
                      placeholder="21 Erard street"
                      // onChange={(e) => {
                      //   setStreet(e.target.value);
                      // }}
                      // onBlur={() => validateStreet()}
                      // error={errorStreet}
                      // disabled={isAccountDetailsLoading}
                      required
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 3 }}>
                    <TextInput
                      withAsterisk
                      placeholder="Paris"
                      label="City"
                      // value={city}
                      // disabled={createEventMutation.isPending}
                      // onChange={(e) => {
                      //   setCity(e.target.value);
                      // }}
                      // onBlur={() => validateCity()}
                      // error={errorCity}
                      required
                    />
                  </Grid.Col>
                </Grid>
                <TextInput
                  label="Additional location details"
                  placeholder="Room 12, 2nd floor"
                  // disabled={createEventMutation.isPending}
                  // value={locationDetail}
                  // onChange={(e) => {
                  //   setLocationDetail(e.target.value);
                  // }}
                />
                <Grid>
                  <Grid.Col span={{ base: 12, md: 6 }}></Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}></Grid.Col>
                </Grid>
                <Select
                  withAsterisk
                  clearable
                  label="Category"
                  // value={category}
                  // disabled={createEventMutation.isPending}
                  placeholder="Select a category"
                  // error={errorCategory}
                  // onBlur={() => validateCategory()}
                  data={[
                    { value: "workshop", label: "Workshop" },
                    { value: "conference", label: "Conference" },
                    { value: "meetups", label: "Meetups" },
                    { value: "exposition", label: "Exposition" },
                    { value: "other", label: "Other" },
                  ]}
                  // onChange={(value) => {
                  //   setCategory(value as string);
                  // }}
                />
                <TextEditor
                  label="Event's description"
                  value={"description"}
                  // error={errorDescription}
                  onChange={() => {
                    return;
                  }}
                />
              </Stack>
              <Group mt="lg" justify="center">
                <Button variant="grey">Cancel</Button>
                <Button
                  // onClick={(e) => {
                  //   handleSubmitCreate(e);
                  // }}
                  // loading={createEventMutation.isPending}
                  variant="primary"
                >
                  Confirm
                </Button>
              </Group>
            </Modal>
          </Group>
        </Group>
        {/* filter options */}
        <Grid align="flex-end">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <TextInput
              label="Search"
              variant="filled"
              placeholder="Search by employee's name, event's ID or title..."
              rightSection={<IconSearch size={14} />}
              // disabled={createEventMutation.isPending}
              // value={filters.searchValue}
              // onChange={(e) =>
              //   handleFilterChange("searchValue", e.target.value)
              // }
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
              // value={filters.sortValue}
              clearable
              // disabled={createEventMutation.isPending}
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
};
