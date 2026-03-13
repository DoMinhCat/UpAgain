import {
  Container,
  Title,
  Group,
  Badge,
  Stack,
  Text,
  Card,
  Grid,
  Divider,
  Button,
  Modal,
  TextInput,
  type ComboboxItem,
  type OptionsFilter,
  Table,
  NumberInput,
  Select,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import AdminBreadcrumbs from "../../components/admin/AdminBreadcrumbs";
import { PATHS } from "../../routes/paths";
import {
  IconCalendarEvent,
  IconCoinEuro,
  IconMapPin,
  IconMapPinFilled,
  IconPlus,
  IconUsers,
} from "@tabler/icons-react";
import AdminTable from "../../components/admin/AdminTable";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";

export default function AdminEventDetails() {
  // edit modal and form
  const [openedEdit, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);
  const [titleEdit, setTitleEdit] = useState<string>("");
  const [capacityEdit, setCapacityEdit] = useState<number>(0);
  const [priceEdit, setPriceEdit] = useState<number>(0);
  const [streetEdit, setStreetEdit] = useState<string>("");
  const [cityEdit, setCityEdit] = useState<string>("");
  const [locationDetailEdit, setLocationDetailEdit] = useState<string>("");
  const [dateEdit, setDateEdit] = useState<string | null>(null);
  const [categoryEdit, setCategoryEdit] = useState<string>("");

  // assign employee modal and form
  const [openedAssign, { open: openAssign, close: closeAssign }] =
    useDisclosure(false);
  const [employeeAssign, setEmployeeAssign] = useState<string>("");
  const filterEmployee: OptionsFilter = ({ options, search }) => {
    const splittedSearch = search.toLowerCase().trim().split(" ");
    return (options as ComboboxItem[]).filter((option) => {
      const words = option.label.toLowerCase().trim().split(" ");
      return splittedSearch.every((searchWord) =>
        words.some((word) => word.includes(searchWord)),
      );
    });
  };

  return (
    <Container px="md" size="xl">
      <Title order={2} mt="xs" mb="sm">
        Event's Details
      </Title>
      <AdminBreadcrumbs
        breadcrumbs={[
          { title: "Event Management", href: PATHS.ADMIN.EVENTS },
          { title: "Event's Details", href: "#" },
        ]}
      />
      <Container p="lg" size="xl">
        {/* The justify="space-between" works best when items have defined widths or flex growth */}
        <Grid gutter="xl" align="flex-start" mb="xl">
          {/* LEFT SECTION: Added flex: 1 to occupy remaining space */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            {/* <Group style={{ flex: 1 }}> */}
            <Stack gap={0} style={{ width: "100%" }}>
              <Group>
                <Badge size="sm" variant="green">
                  Category
                </Badge>
                <Badge size="sm" variant="green">
                  Status
                </Badge>
              </Group>

              <Title order={2} mt="lg" mb="xs">
                Event's title
              </Title>
              <Text c="dimmed" size="xs" mb="xl">
                Created on March 13 2026
              </Text>
              <div>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Maecenas ullamcorper metus risus, a varius tortor ultrices in.
                Etiam sed eros in tortor viverra tristique commodo id est. Ut
                egestas vestibulum purus vitae gravida. Nunc id lectus eget mi
                venenatis vestibulum. Nunc consequat viverra ex, quis malesuada
                mauris. Aenean interdum nibh et sem venenatis, eget maximus ex
                fermentum. Nunc et eleifend mi, eget tempor lacus. Aenean ut
                massa enim. Aliquam placerat mi arcu, vitae ornare lorem mollis
                ies tortor. Donec at diam id diam vestibulum rhoncus.
                Pellentesque ex neque, vulputate sed justo sodales, fermentum
                ultrices velit. Fusce dapibus ipsum mi, vel ullamcorper nisi
                ullamcorper sit amet. Morbi ac nulla vel nunc cursus consequat
                et eu leo.
                <br />
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Maecenas ullamcorper metus risus, a varius tortor ultrices in.
                Etiam sed eros in tortor viverra tristique commodo id est. Ut
                egestas vestibulum purus vitae gravida. Nunc id lectus eget mi
                venenatis vestibulum. Nunc consequat viverra ex, quis malesuada
                <br />
                magna tincidunt. Nunc vitae faucibus urna, in vehicula est. Ut
                felis eros, fringilla sed mi non, laoreet sollicitudin dolor.
                Phasellus velit diam, iaculis et neque quis, consequat congue
                eros. Nulla facilisi. Maecenas in augue neque. Mauris fermentum
                efficitur nisl sit amet ultricies. Nunc viverra pellentesque
                sodales. Suspendisse venenatis efficitur purus posuere rutrum.
                Proin eu tellus elementum, elementum mauris id, ultricies
                tortor. Donec at diam id diam vestibulum rhoncus. Pellentesque
                ex neque, vulputate sed justo sodales, fermentum ultrices velit.
                Fusce dapibus ipsum mi, vel ullamcorper nisi ullamcorper sit
                amet. ullamcorper sit amet. Morbi ac nulla vel nunc cursus
                consequat et eu leo.
              </div>
            </Stack>
            <Group gap="sm" mt="xl">
              <IconMapPinFilled color="green" size={32} />
              <Title order={3}>Location</Title>
            </Group>
            <Text mt="md">Some text about location</Text>
          </Grid.Col>

          {/* RIGHT SECTION */}
          <Grid.Col
            span={{ base: 12, md: 4 }}
            style={{ position: "sticky", top: "5px" }}
          >
            <Card withBorder shadow="sm" radius="md" padding="md">
              {/* Header/Date Section */}
              <Group gap="xs">
                <IconCalendarEvent />
                <Text fw={500} size="lg">
                  March 15, 2026
                </Text>
              </Group>

              <Divider my="sm" />

              {/* Body Content */}
              <Stack gap="lg">
                <Group justify="space-between">
                  <Group gap="xs">
                    <IconCoinEuro color="gold" />
                    <Text>60€</Text>
                  </Group>
                </Group>

                <Group justify="space-between">
                  <Group gap="xs">
                    <IconUsers color="#315ff5" />
                    <Text>16{" max"}</Text>
                  </Group>
                </Group>

                <Group justify="space-between">
                  <Group gap="xs">
                    <IconMapPin color="green" />
                    <Text>Location Paris</Text>
                  </Group>
                </Group>
                <Button variant="edit" onClick={openEdit}>
                  Edit event
                </Button>
                <Modal
                  title="Edit event"
                  opened={openedEdit}
                  onClose={closeEdit}
                  centered
                  size="xl"
                >
                  <Stack>
                    <TextInput
                      data-autofocus
                      withAsterisk
                      label="Tile"
                      value={titleEdit}
                      onChange={(e) => {
                        setTitleEdit(e.target.value);
                      }}
                      // onBlur={() => validateUsernameEdit(usernameEdit)}
                      // error={usernameEditError}
                      // disabled={isAccountDetailsLoading}
                      required
                    />
                    <NumberInput
                      withAsterisk
                      label="Capacity"
                      min={0}
                      value={capacityEdit}
                      onChange={(value) => {
                        setCapacityEdit(Number(value));
                      }}
                      // onBlur={() => validateEmailEdit(emailEdit)}
                      // error={emailEditError}
                      // disabled={isAccountDetailsLoading}
                      required
                    />
                    <NumberInput
                      withAsterisk
                      label="Price"
                      min={0}
                      value={priceEdit}
                      onChange={(value) => {
                        setPriceEdit(Number(value));
                      }}
                      // onBlur={() => validateEmailEdit(emailEdit)}
                      // error={emailEditError}
                      // disabled={isAccountDetailsLoading}
                      required
                    />
                    <Grid>
                      <Grid.Col span={{ base: 12, md: 9 }}>
                        <TextInput
                          withAsterisk
                          label="Street"
                          value={streetEdit}
                          onChange={(e) => {
                            setStreetEdit(e.target.value);
                          }}
                          // onBlur={() => validateUsernameEdit(usernameEdit)}
                          // error={usernameEditError}
                          // disabled={isAccountDetailsLoading}
                          required
                        />
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, md: 3 }}>
                        <TextInput
                          withAsterisk
                          label="City"
                          value={cityEdit}
                          onChange={(e) => {
                            setCityEdit(e.target.value);
                          }}
                          // onBlur={() => validateUsernameEdit(usernameEdit)}
                          // error={usernameEditError}
                          // disabled={isAccountDetailsLoading}
                          required
                        />
                      </Grid.Col>
                    </Grid>
                    <TextInput
                      label="Additional location details"
                      value={locationDetailEdit}
                      onChange={(e) => {
                        setLocationDetailEdit(e.target.value);
                      }}
                      // onBlur={() => validateUsernameEdit(usernameEdit)}
                      // error={usernameEditError}
                      // disabled={isAccountDetailsLoading}
                      required
                    />
                    <DateTimePicker
                      withAsterisk
                      label="Date and time of event"
                      value={dateEdit}
                      onChange={setDateEdit}
                      required
                      // onBlur={() => validateUsernameEdit(usernameEdit)}
                      // error={usernameEditError}
                      // disabled={isAccountDetailsLoading}
                    />
                    <Select
                      withAsterisk
                      clearable
                      label="Category"
                      value={categoryEdit}
                      // error={roleNewError}
                      // onBlur={() => validateRoleNew(roleNew)}
                      data={[
                        { value: "workshop", label: "Workshop" },
                        { value: "conference", label: "Conference" },
                        { value: "meetups", label: "Meetups" },
                        { value: "exposition", label: "Exposition" },
                        { value: "other", label: "Other" },
                      ]}
                      onChange={(value) => {
                        setCategoryEdit(value as string);
                      }}
                    />
                  </Stack>
                  <Group mt="lg" justify="center">
                    <Button onClick={closeEdit} variant="grey">
                      Cancel
                    </Button>
                    <Button
                      // onClick={(e) => {
                      //   handleEditAccount(e);
                      // }}
                      variant="primary"
                      // loading={editMutation.isPending}
                      // disabled={editMutation.isPending || isAccountDetailsLoading}
                    >
                      Confirm
                    </Button>
                  </Group>
                </Modal>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Assigned employee List */}
        <Group justify="space-between">
          <Title order={3} mb="lg">
            Assigned employees
          </Title>
          <Button
            variant="primary"
            onClick={openAssign}
            leftSection={<IconPlus size={16} />}
          >
            Assign employee
          </Button>
          <Modal
            title="Assign employee"
            opened={openedAssign}
            onClose={closeAssign}
            centered
            size="md"
          >
            <Stack>
              <Select
                withAsterisk
                clearable
                label="Employee"
                value={employeeAssign}
                maxDropdownHeight={200}
                filter={filterEmployee}
                searchable
                // error={roleNewError}
                // onBlur={() => validateRoleNew(roleNew)}
                data={[
                  { value: "1", label: "Employee 1" },
                  { value: "2", label: "Employee 2" },
                  { value: "3", label: "Employee 3" },
                  { value: "4", label: "Employee 4" },
                  { value: "5", label: "Employee 5" },
                ]}
                onChange={(value) => {
                  setEmployeeAssign(value as string);
                }}
              />
            </Stack>
            <Group mt="lg" justify="center">
              <Button onClick={closeAssign} variant="grey">
                Cancel
              </Button>
              <Button
                // onClick={(e) => {
                //   handleEditAccount(e);
                // }}
                variant="primary"
                // loading={editMutation.isPending}
                // disabled={editMutation.isPending || isAccountDetailsLoading}
              >
                Confirm
              </Button>
            </Group>
          </Modal>
        </Group>
        <AdminTable
          loading={false}
          error={null}
          header={["Assigned on", "ID", "Employee", "Actions"]}
        >
          <Table.Tr>
            <Table.Td ta="center">1</Table.Td>
            <Table.Td ta="center">2</Table.Td>
            <Table.Td ta="center">3</Table.Td>
            <Table.Td ta="center">4</Table.Td>
          </Table.Tr>
        </AdminTable>
      </Container>
    </Container>
  );
}
