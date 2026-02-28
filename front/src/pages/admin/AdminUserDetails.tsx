import { Avatar, Container, Flex, Stack, Text, Title } from "@mantine/core";
import { PATHS } from "../../routes/paths";
import AdminBreadcrumbs from "../../components/admin/AdminBreadcrumbs";
import { ScoreRing } from "../../components/ScoreRing";

export default function AdminUserDetails() {
  return (
    <Container px="md" size="xl">
      <AdminBreadcrumbs
        breadcrumbs={[
          { title: "User Management", href: PATHS.ADMIN.USERS },
          { title: "Users Details", href: "#" },
        ]}
      />
      <Container px="md" size="sm" mt="xl">
        <Flex align="flex-start" justify="flex-end">
          <ScoreRing score={69} size={90} />
        </Flex>
        <Stack justify="center" align="center">
          <Avatar src={null} name="User's name" color="initials" size="100" />
          <Title order={3}>User's name</Title>
        </Stack>
        <Title order={3} ta="left" mt="lg">
          About user name
        </Title>

        <Text>Email</Text>
        <Text>Role</Text>
        <Text>Phone</Text>
      </Container>
    </Container>
  );
}
