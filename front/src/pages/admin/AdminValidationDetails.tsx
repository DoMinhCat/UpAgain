import { useState } from "react";
import {
  Container,
  Box,
  Paper,
  Stack,
  Group,
  Text,
  Title,
  Button,
  Modal,
  ThemeIcon,
  Textarea,
  Badge,
} from "@mantine/core";
import {
  useLocation,
  useNavigate,
  useParams,
  Navigate,
} from "react-router-dom";
import { useDisclosure } from "@mantine/hooks";
import {
  IconCheck,
  IconX,
  IconBox,
  IconTags,
  IconCalendarEvent,
  IconSofa,
} from "@tabler/icons-react";
import dayjs from "dayjs";

import { PATHS } from "../../routes/paths";
import AdminBreadcrumbs from "../../components/admin/AdminBreadcrumbs";
import InfoField from "../../components/InfoField";
import { useProcessValidation } from "../../hooks/validationHooks";

export default function AdminValidationDetails() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { type, id } = useParams<{
    type: "deposits" | "listings" | "events";
    id: string;
  }>();

  // On récupère l'objet passé via la navigation depuis le ValidationHub
  const item = state?.item;

  const [openedRefuse, { open: openRefuse, close: closeRefuse }] =
    useDisclosure(false);
  const [refuseReason, setRefuseReason] = useState("");
  const processMutation = useProcessValidation();

  // Redirection de sécurité si on accède à l'URL directement sans les données
  if (!item || !type || !id) {
    return <Navigate to={PATHS.ADMIN.VALIDATIONS.ALL} replace />;
  }

  const handleApprove = () => {
    processMutation.mutate(
      { entityType: type, id: parseInt(id), action: "approve" },
      { onSuccess: () => navigate(PATHS.ADMIN.VALIDATIONS.ALL) },
    );
  };

  const handleConfirmRefuse = () => {
    if (refuseReason.trim().length > 0) {
      processMutation.mutate(
        {
          entityType: type,
          id: parseInt(id),
          action: "refuse",
          reason: refuseReason,
        },
        { onSuccess: () => navigate(PATHS.ADMIN.VALIDATIONS.ALL) },
      );
    }
  };

  // Configuration dynamique selon le type
  const config = {
    deposits: { icon: IconSofa, color: "blue", title: "Pending Deposit" },
    listings: { icon: IconTags, color: "grape", title: "Pending Listing" },
    events: {
      icon: IconCalendarEvent,
      color: "violet",
      title: "Pending Event",
    },
  }[type] || { icon: IconBox, color: "gray", title: "Unknown" };

  const Icon = config.icon;

  return (
    <Container px="md" size="xl">
      <Title order={2} mt="xs" mb="sm">
        {type === "listings"
          ? "Listing"
          : type === "deposits"
            ? "Deposits"
            : "Event"}
        's Details
      </Title>
      <AdminBreadcrumbs
        breadcrumbs={[
          { title: "Dashboard", href: PATHS.ADMIN.HOME },
          { title: "Validations", href: PATHS.ADMIN.VALIDATIONS.ALL },
          { title: `Details #${id}`, href: "#" },
        ]}
      />

      <Container px="md" size="sm" mt="xl">
        <Stack justify="center" align="center" mb="xl">
          <ThemeIcon size={80} radius="xl" color={config.color} variant="light">
            <Icon size={45} />
          </ThemeIcon>
          <Title order={2}>
            {config.title} #{id}
          </Title>
          <Badge color="orange" variant="outline">
            Waiting for validation
          </Badge>
        </Stack>

        <Title order={3} ta="left" mt="xl">
          General Information
        </Title>
        <Paper variant="primary" px="lg" py="md" mt="sm">
          <InfoField label="Title">
            <Text ps="sm" mt="xs" fw={700} mb="sm">
              {item.title}
            </Text>
          </InfoField>

          <InfoField label="Description">
            <Text
              ps="sm"
              mt="xs"
              mb="sm"
              c={item.description ? "dark" : "dimmed"}
            >
              {item.description || "No description provided."}
            </Text>
          </InfoField>

          <InfoField label="Created On">
            <Text ps="sm" mt="xs">
              {dayjs(item.created_at).format("DD/MM/YYYY - HH:mm")}
            </Text>
          </InfoField>
        </Paper>

        {/* --- DETAILS POUR DÉPÔTS & ANNONCES --- */}
        {(type === "deposits" || type === "listings") && (
          <>
            <Title order={3} ta="left" mt="xl">
              Item Details
            </Title>
            <Paper variant="primary" px="lg" py="md" mt="sm">
              <Group grow mb="sm">
                <InfoField label="Material">
                  <Badge mt="xs" color="gray">
                    {item.material}
                  </Badge>
                </InfoField>
                <InfoField label="Condition (State)">
                  <Badge mt="xs" color="gray" variant="outline">
                    {item.state}
                  </Badge>
                </InfoField>
              </Group>

              <Group grow mb="sm">
                <InfoField label="Weight">
                  <Text ps="sm" mt="xs">
                    {item.weight} kg
                  </Text>
                </InfoField>
                {type === "listings" && (
                  <InfoField label="Price">
                    <Text ps="sm" mt="xs" fw={700} c="green">
                      {item.price ? `${item.price} €` : "Free"}
                    </Text>
                  </InfoField>
                )}
              </Group>

              <InfoField label="Location & User">
                <Text ps="sm" mt="xs">
                  <strong>{item.username}</strong> - {item.city_name} (
                  {item.postal_code})
                </Text>
              </InfoField>
            </Paper>
          </>
        )}

        {/* --- DETAILS POUR ÉVÉNEMENTS --- */}
        {type === "events" && (
          <>
            <Title order={3} ta="left" mt="xl">
              Event Details
            </Title>
            <Paper variant="primary" px="lg" py="md" mt="sm">
              <Group grow mb="sm">
                <InfoField label="Category">
                  <Badge mt="xs" color="violet">
                    {item.category}
                  </Badge>
                </InfoField>
                <InfoField label="Scheduled Date">
                  <Text ps="sm" mt="xs" fw={500}>
                    {dayjs(item.date_start).format("DD/MM/YYYY")}
                    {item.time_start && ` at ${item.time_start}`}
                  </Text>
                </InfoField>
              </Group>

              <Group grow mb="sm">
                <InfoField label="Capacity">
                  <Text ps="sm" mt="xs">
                    {item.capacity ? `${item.capacity} spots` : "Unlimited"}
                  </Text>
                </InfoField>
                <InfoField label="Price">
                  <Text ps="sm" mt="xs" fw={700} c="green">
                    {item.price ? `${item.price} €` : "Free"}
                  </Text>
                </InfoField>
              </Group>

              <InfoField label="Organizer">
                <Text ps="sm" mt="xs">
                  {item.employee_username}
                </Text>
              </InfoField>
            </Paper>
          </>
        )}

        <Title order={3} ta="left" mt="xl">
          Decision
        </Title>
        <Paper variant="primary" px="lg" py="md" mt="sm">
          <InfoField label="Action">
            <Box ps="sm">
              <Text c="dimmed" size="sm" mt="xs" mb="md">
                Please review the information carefully before making a
                decision.
              </Text>
              <Group>
                <Button
                  variant="primary"
                  leftSection={<IconCheck size={16} />}
                  onClick={handleApprove}
                  loading={
                    processMutation.isPending &&
                    processMutation.variables?.action === "approve"
                  }
                >
                  Approve
                </Button>
                <Button
                  variant="delete"
                  leftSection={<IconX size={16} />}
                  onClick={openRefuse}
                >
                  Refuse
                </Button>
              </Group>
            </Box>
          </InfoField>
        </Paper>
      </Container>

      <Modal
        opened={openedRefuse}
        onClose={closeRefuse}
        title="Reason for refusal (Required)"
        centered
      >
        <Textarea
          placeholder="Please explain why this is being refused..."
          value={refuseReason}
          onChange={(event) => setRefuseReason(event.currentTarget.value)}
          minRows={3}
          data-autofocus
        />
        <Group justify="flex-end" mt="md">
          <Button
            variant="grey"
            onClick={closeRefuse}
            disabled={processMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="delete"
            onClick={handleConfirmRefuse}
            disabled={refuseReason.trim().length === 0}
            loading={
              processMutation.isPending &&
              processMutation.variables?.action === "refuse"
            }
          >
            Confirm Refusal
          </Button>
        </Group>
      </Modal>
    </Container>
  );
}
