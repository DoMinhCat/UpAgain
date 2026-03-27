import { Container, Title } from "@mantine/core";
import { useLocation } from "react-router-dom";
import AdminBreadcrumbs from "../../../components/admin/AdminBreadcrumbs";

export const AdminPostDetails = () => {
  const location = useLocation();
  const origin = location.state || {};
  return (
    <Container px="md" size="xl">
      <Title order={2} mt="xs" mb="sm">
        Post's Details
      </Title>
      <AdminBreadcrumbs
        breadcrumbs={[
          ...(origin.from === "allPosts"
            ? [
                { title: "Post Management", href: "/admin/posts" },
                { title: "Post's Details", href: "/admin/posts/:id" },
              ]
            : []),
        ]}
      />
    </Container>
  );
};
