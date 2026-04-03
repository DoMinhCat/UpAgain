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
  Pill,
  Loader,
  Modal,
} from "@mantine/core";
import { useNavigate, useParams } from "react-router-dom";
import AdminBreadcrumbs from "../../../components/admin/AdminBreadcrumbs";
import { PATHS } from "../../../routes/paths";

export default function AdminListingDetails() {
  const navigate = useNavigate();
  const params = useParams();
  const id = params.id;
  const id_event = Number(id);
  const validId = !isNaN(id_event) && id_event > 0;
  return (
    <Container px="md" size="xl">
      <Title order={2} mt="lg">
        Listing Details
      </Title>

      <AdminBreadcrumbs
        breadcrumbs={[
          { title: "Listing Management", href: PATHS.ADMIN.LISTINGS },
          { title: "Listing Details", href: PATHS.ADMIN.LISTINGS + "/" + id },
        ]}
      />
    </Container>
  );
}
