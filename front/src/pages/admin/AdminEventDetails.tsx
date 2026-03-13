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
  Table,
  NumberInput,
} from "@mantine/core";
import AdminBreadcrumbs from "../../components/admin/AdminBreadcrumbs";
import { PATHS } from "../../routes/paths";
import {
  IconCalendarEvent,
  IconCoinEuro,
  IconMapPin,
  IconMapPinFilled,
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

  const handleCloseEdit = () => {
    setTitleEdit("");
    setCapacityEdit(0);
    closeEdit();
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
                  Start date: March 15, 2026
                </Text>
              </Group>

              <Divider my="sm" />

              {/* Body Content */}
              <Stack gap="lg">
                <Group justify="space-between">
                  <Group gap="xs">
                    <IconCoinEuro />
                    <Text>60€</Text>
                  </Group>
                </Group>

                <Group justify="space-between">
                  <Group gap="xs">
                    <IconUsers />
                    <Text>Capacity 16</Text>
                  </Group>
                </Group>

                <Group justify="space-between">
                  <Group gap="xs">
                    <IconMapPin />
                    <Text>Location Paris</Text>
                  </Group>
                </Group>
                <Button variant="edit" onClick={openEdit}>
                  Edit event
                </Button>
                <Modal
                  title="Edit event"
                  opened={openedEdit}
                  onClose={handleCloseEdit}
                  centered
                  size="xl"
                >
                  <Stack>
                    <TextInput
                      data-autofocus
                      withAsterisk
                      label="Tile"
                      value={titleEdit}
                      // onChange={(e) => {
                      //   setUsernameEdit(e.target.value);
                      //   validateUsernameEdit(e.target.value);
                      // }}
                      // onBlur={() => validateUsernameEdit(usernameEdit)}
                      // error={usernameEditError}
                      // disabled={isAccountDetailsLoading}
                      required
                    />
                    <NumberInput
                      withAsterisk
                      label="Capacity"
                      value={capacityEdit}
                      // onChange={(e) => {
                      //   setEmailEdit(e.target.value);
                      //   validateEmailEdit(e.target.value);
                      // }}
                      // onBlur={() => validateEmailEdit(emailEdit)}
                      // error={emailEditError}
                      // disabled={isAccountDetailsLoading}
                      required
                    />
                  </Stack>
                  <Group mt="lg" justify="center">
                    <Button onClick={handleCloseEdit} variant="grey">
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
        <Title order={3} mb="lg">
          Assigned employees
        </Title>
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
