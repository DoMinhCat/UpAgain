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
import { useTranslation } from "react-i18next";
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

import { PATHS } from "../../../routes/paths";
import MyBreadcrumbs from "../../../components/nav/MyBreadcrumbs";
import InfoField from "../../../components/common/InfoField";
import { useProcessValidation } from "../../../hooks/validationHooks";

export default function AdminValidationDetails() {
  const { t } = useTranslation("admin");
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
        {t(`validations.details.types.${type}` as any, { defaultValue: type })}
        {" " + t("validations.details.title_suffix", { defaultValue: "'s Details" })}
      </Title>
      <MyBreadcrumbs
        breadcrumbs={[
          { title: t("validations.title"), href: PATHS.ADMIN.VALIDATIONS.ALL },
          { title: `${t("common:details", { defaultValue: "Details" })} #${id}`, href: "#" },
        ]}
      />

      <Container px="md" size="sm" mt="xl">
        <Stack justify="center" align="center" mb="xl">
          <ThemeIcon size={80} radius="xl" color={config.color} variant="light">
            <Icon size={45} />
          </ThemeIcon>
          <Title order={2}>
            {t(`validations.details.types.${type}` as any, { defaultValue: type })} #{id}
          </Title>
          <Badge color="orange" variant="outline">
            {t("validations.details.waiting_validation")}
          </Badge>
        </Stack>

        <Title order={3} ta="left" mt="xl">
          {t("validations.details.general_info")}
        </Title>
        <Paper variant="primary" px="lg" py="md" mt="sm">
          <InfoField label={t("validations.details.fields.title")}>
            <Text ps="sm" mt="xs" fw={700} mb="sm">
              {item.title}
            </Text>
          </InfoField>

          <InfoField label={t("validations.details.fields.description")}>
            <Text
              ps="sm"
              mt="xs"
              mb="sm"
              c={item.description ? "dark" : "dimmed"}
            >
              {item.description || t("validations.details.fields.no_description")}
            </Text>
          </InfoField>

          <InfoField label={t("validations.details.fields.created_at")}>
            <Text ps="sm" mt="xs">
              {dayjs(item.created_at).format("DD/MM/YYYY - HH:mm")}
            </Text>
          </InfoField>
        </Paper>

        {/* --- DETAILS POUR DÉPÔTS & ANNONCES --- */}
        {(type === "deposits" || type === "listings") && (
          <>
            <Title order={3} ta="left" mt="xl">
              {t("validations.details.item_details")}
            </Title>
            <Paper variant="primary" px="lg" py="md" mt="sm">
              <Group grow mb="sm">
                <InfoField label={t("validations.details.fields.material")}>
                  <Badge mt="xs" color="gray">
                    {item.material}
                  </Badge>
                </InfoField>
                <InfoField label={t("validations.details.fields.condition")}>
                  <Badge mt="xs" color="gray" variant="outline">
                    {item.state}
                  </Badge>
                </InfoField>
              </Group>

              <Group grow mb="sm">
                <InfoField label={t("validations.details.fields.weight")}>
                  <Text ps="sm" mt="xs">
                    {item.weight} {t("common:units.kg", { defaultValue: "kg" })}
                  </Text>
                </InfoField>
                {type === "listings" && (
                  <InfoField label={t("validations.details.fields.price")}>
                    <Text ps="sm" mt="xs" fw={700} c="green">
                      {item.price ? `${item.price} €` : t("common:free", { defaultValue: "Free" })}
                    </Text>
                  </InfoField>
                )}
              </Group>

              <InfoField label={t("validations.details.fields.location")}>
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
              {t("validations.details.event_details")}
            </Title>
            <Paper variant="primary" px="lg" py="md" mt="sm">
              <Group grow mb="sm">
                <InfoField label={t("validations.details.fields.category")}>
                  <Badge mt="xs" color="violet">
                    {t(`events:categories.${item.category}` as any, { defaultValue: item.category })}
                  </Badge>
                </InfoField>
                <InfoField label={t("validations.details.fields.scheduled_date")}>
                  <Text ps="sm" mt="xs" fw={500}>
                    {dayjs(item.date_start).format("DD/MM/YYYY")}
                    {item.time_start && `${t("validations.details.fields.at")}${item.time_start}`}
                  </Text>
                </InfoField>
              </Group>

              <Group grow mb="sm">
                <InfoField label={t("validations.details.fields.capacity")}>
                  <Text ps="sm" mt="xs">
                    {item.capacity ? t("validations.details.fields.spots", { count: item.capacity }) : t("validations.details.fields.unlimited")}
                  </Text>
                </InfoField>
                <InfoField label={t("validations.details.fields.price")}>
                  <Text ps="sm" mt="xs" fw={700} c="green">
                    {item.price ? `${item.price} €` : t("common:free", { defaultValue: "Free" })}
                  </Text>
                </InfoField>
              </Group>

              <InfoField label={t("validations.details.fields.organizer")}>
                <Text ps="sm" mt="xs">
                  {item.employee_username}
                </Text>
              </InfoField>
            </Paper>
          </>
        )}

        <Title order={3} ta="left" mt="xl">
          {t("validations.details.decision")}
        </Title>
        <Paper variant="primary" px="lg" py="md" mt="sm">
          <InfoField label={t("validations.details.decision")}>
            <Box ps="sm">
              <Text c="dimmed" size="sm" mt="xs" mb="md">
                {t("validations.details.decision_desc")}
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
                  {t("validations.details.actions.approve")}
                </Button>
                <Button
                  variant="delete"
                  leftSection={<IconX size={16} />}
                  onClick={openRefuse}
                >
                  {t("validations.details.actions.refuse")}
                </Button>
              </Group>
            </Box>
          </InfoField>
        </Paper>
      </Container>

      <Modal
        opened={openedRefuse}
        onClose={closeRefuse}
        title={t("validations.details.refuse_modal.title")}
        centered
      >
        <Textarea
          placeholder={t("validations.details.refuse_modal.placeholder")}
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
            {t("common:actions.cancel", { defaultValue: "Cancel" })}
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
            {t("validations.details.refuse_modal.confirm")}
          </Button>
        </Group>
      </Modal>
    </Container>
  );
}
