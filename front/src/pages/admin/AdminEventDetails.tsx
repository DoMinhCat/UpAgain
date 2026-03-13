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
} from "@mantine/core";
import AdminBreadcrumbs from "../../components/admin/AdminBreadcrumbs";
import { PATHS } from "../../routes/paths";
import {
  IconCalendarEvent,
  IconCoinEuro,
  IconMapPin,
  IconUsers,
} from "@tabler/icons-react";

export default function AdminEventDetails() {
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
      <Container p="md" size="xl">
        {/* The justify="space-between" works best when items have defined widths or flex growth */}
        <Grid gutter="xl" align="flex-start">
          {/* LEFT SECTION: Added flex: 1 to occupy remaining space */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Group style={{ flex: 1 }}>
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
                  venenatis vestibulum. Nunc consequat viverra ex, quis
                  malesuada mauris. Aenean interdum nibh et sem venenatis, eget
                  maximus ex fermentum. Nunc et eleifend mi, eget tempor lacus.
                  Aenean ut massa enim. Aliquam placerat mi arcu, vitae ornare
                  lorem mollis et. Aliquam aliquam nulla ullamcorper,
                  condimentum erat non, ultricies mi. Vivamus nec sem sem.
                  Quisque non nisl eget nisl tincidunt fringilla id ac enim.
                  Phasellus molestie iaculis commodo. Cras sed nisl iaculis,
                  dignissim tortor eget, eleifend turpis. Morbi risus justo,
                  porta at bibendum a, vestibulum vel tortor. Ut fermentum
                  convallis rutrum. Etiam rutrum, sem eu vehicula iaculis, nulla
                  eros ornare ex, vitae iaculis nisi lacus vitae enim. Donec
                  ligula arcu, mattis sed ante at, ullamcorper ultricies nisi.
                  Vivamus vehicula lorem vel efficitur venenatis. Ut non ligula
                  velit. Nunc porttitor in nulla vitae iaculis. In sollicitudin
                  magna convallis urna ullamcorper, ut scelerisque magna
                  tincidunt. Nunc vitae faucibus urna, in vehicula est. Ut felis
                  eros, fringilla sed mi non, laoreet sollicitudin dolor.
                  Phasellus velit diam, iaculis et neque quis, consequat congue
                  eros. Nulla facilisi. Maecenas in augue neque. Mauris
                  fermentum efficitur nisl sit amet ultricies. Nunc viverra
                  pellentesque sodales. Suspendisse venenatis efficitur purus
                  posuere rutrum. Proin eu tellus elementum, elementum mauris
                  id, ultricies tortor. Donec at diam id diam vestibulum
                  rhoncus. Pellentesque ex neque, vulputate sed justo sodales,
                  fermentum ultrices velit. Fusce dapibus ipsum mi, vel
                  ullamcorper nisi ullamcorper sit amet. Morbi ac nulla vel nunc
                  cursus consequat et eu leo.
                  <br />
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Maecenas ullamcorper metus risus, a varius tortor ultrices in.
                  Etiam sed eros in tortor viverra tristique commodo id est. Ut
                  egestas vestibulum purus vitae gravida. Nunc id lectus eget mi
                  venenatis vestibulum. Nunc consequat viverra ex, quis
                  malesuada mauris. Aenean interdum nibh et sem venenatis, eget
                  maximus ex fermentum. Nunc et eleifend mi, eget tempor lacus.
                  Aenean ut massa enim. Aliquam placerat mi arcu, vitae ornare
                  lorem mollis et. Aliquam aliquam nulla ullamcorper,
                  condimentum erat non, ultricies mi. Vivamus nec sem sem.
                  Quisque non nisl eget nisl tincidunt fringilla id ac enim.
                  Phasellus molestie iaculis commodo. Cras sed nisl iaculis,
                  dignissim tortor eget, eleifend turpis. Morbi risus justo,
                  porta at bibendum a, vestibulum vel tortor. Ut fermentum
                  convallis rutrum. Etiam rutrum, sem eu vehicula iaculis, nulla
                  eros ornare ex, vitae iaculis nisi lacus vitae enim. Donec
                  ligula arcu, mattis sed ante at, ullamcorper ultricies nisi.
                  Vivamus vehicula lorem vel efficitur venenatis. Ut non ligula
                  velit. Nunc porttitor in nulla vitae iaculis. In sollicitudin
                  magna convallis urna ullamcorper, ut scelerisque magna
                  tincidunt. Nunc vitae faucibus urna, in vehicula est. Ut felis
                  eros, fringilla sed mi non, laoreet sollicitudin dolor.
                  Phasellus velit diam, iaculis et neque quis, consequat congue
                  eros. Nulla facilisi. Maecenas in augue neque. Mauris
                  fermentum efficitur nisl sit amet ultricies. Nunc viverra
                  pellentesque sodales. Suspendisse venenatis efficitur purus
                  posuere rutrum. Proin eu tellus elementum, elementum mauris
                  id, ultricies tortor. Donec at diam id diam vestibulum
                  rhoncus. Pellentesque ex neque, vulputate sed justo sodales,
                  fermentum ultrices velit. Fusce dapibus ipsum mi, vel
                  ullamcorper nisi ullamcorper sit amet. Morbi ac nulla vel nunc
                  cursus consequat et eu leo.Lorem ipsum dolor sit amet,
                  consectetur adipiscing elit. Maecenas ullamcorper metus risus,
                  a varius tortor ultrices in. Etiam sed eros in tortor viverra
                  tristique commodo id est. Ut egestas vestibulum purus vitae
                  gravida. Nunc id lectus eget mi venenatis vestibulum. Nunc
                  consequat viverra ex, quis malesuada mauris. Aenean interdum
                  nibh et sem venenatis, eget maximus ex fermentum. Nunc et
                  eleifend mi, eget tempor lacus. Aenean ut massa enim. Aliquam
                  placerat mi arcu, vitae ornare lorem mollis et. Aliquam
                  aliquam nulla ullamcorper, condimentum erat non, ultricies mi.
                  Proin eu tellus elementum, elementum mauris id, ultricies
                  tortor. Donec at diam id diam vestibulum rhoncus. Pellentesque
                  ex neque, vulputate sed justo sodales, fermentum ultrices
                  velit. Fusce dapibus ipsum mi, vel ullamcorper nisi
                  ullamcorper sit amet. Morbi ac nulla vel nunc cursus consequat
                  et eu leo.
                </div>
              </Stack>
            </Group>
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
                    <Text c="dimmed">Fee</Text>
                  </Group>

                  <Text fw={500}>$50.00</Text>
                </Group>

                <Group justify="space-between">
                  <Group gap="xs">
                    <IconUsers />
                    <Text c="dimmed">Capacity</Text>
                  </Group>
                  <Text fw={500}>120/150</Text>
                </Group>

                <Group justify="space-between">
                  <Group gap="xs">
                    <IconMapPin />
                    <Text c="dimmed">Location</Text>
                  </Group>
                  <Text fw={500}>Convention Hall A</Text>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      </Container>
    </Container>
  );
}
