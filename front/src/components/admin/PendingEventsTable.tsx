import { useState } from "react";
import { Table, Button, Group, Badge, Modal, Textarea, Text } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import { IconCheck, IconX, IconUsers } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import AdminTable from "./AdminTable";
import { type PendingEvent, processValidationAction } from "../../api/admin/validationModule";
import { showSuccessNotification } from "../../components/NotificationToast";
import { showErrorNotification } from "../../components/NotificationToast";

interface PendingEventsTableProps {
  data: PendingEvent[];
  loading: boolean;
  onSuccess: () => void;
}

export default function PendingEventsTable({ data, loading, onSuccess }: PendingEventsTableProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [refuseReason, setRefuseReason] = useState("");

  const mutation = useMutation({
    mutationFn: ({ id, action, reason }: { id: number; action: "approve" | "refuse"; reason?: string }) =>
      processValidationAction("events", id, action, reason),
    onSuccess: (_,variables) => {
      close();
      setRefuseReason("");
      onSuccess();
      showSuccessNotification(
            "Succès",
            `Le dépôt a été ${variables.action === "approve" ? "validé" : "refusé"}.`,
      );
    },
    onError: () => {
      showErrorNotification(
            "Erreur",
            "Une erreur est survenue lors de l'opération.",
      );
      console.error("Erreur lors de la validation de l'annonce");
    }
  });

  const handleApprove = (id: number) => {
    mutation.mutate({ id, action: "approve" });
  };

  const handleOpenRefuseModal = (id: number) => {
    setSelectedItem(id);
    open();
  };

  const handleConfirmRefuse = () => {
    if (selectedItem && refuseReason.trim().length > 0) {
      mutation.mutate({ id: selectedItem, action: "refuse", reason: refuseReason });
    }
  };

  const headers = ["ID", "Événement", "Infos", "Créateur", "Date Prévue", "Actions"];

  return (
    <>
      <AdminTable header={headers} loading={loading}>
        {data.length === 0 && !loading && (
          <Table.Tr>
            <Table.Td colSpan={headers.length} ta="center">Aucun événement en attente</Table.Td>
          </Table.Tr>
        )}

        {data.map((item) => (
          <Table.Tr key={item.id_event}>
            <Table.Td ta="center">#{item.id_event}</Table.Td>
            <Table.Td ta="center">
              <strong>{item.title}</strong>
              <br />
              <Badge size="sm" color="violet" variant="light">{item.category}</Badge>
            </Table.Td>
            
            <Table.Td ta="center">
              <Group gap="xs" justify="center">
                {item.capacity && (
                  <Badge color="gray" variant="outline" leftSection={<IconUsers size={12} />}>
                    {item.capacity} places
                  </Badge>
                )}
                {item.price ? (
                  <Badge color="green" variant="light">{item.price} €</Badge>
                ) : (
                  <Badge color="gray" variant="light">Gratuit</Badge>
                )}
              </Group>
            </Table.Td>

            <Table.Td ta="center">{item.employee_username}</Table.Td>
            
            <Table.Td ta="center">
              <Text size="sm" fw={500}>
                {new Date(item.date_start).toLocaleDateString("fr-FR")}
              </Text>
              {item.time_start && (
                <Text size="xs" c="dimmed">
                  à {item.time_start}
                </Text>
              )}
            </Table.Td>

            <Table.Td ta="center">
              <Group justify="center" gap="sm">
                <Button 
                  color="green" 
                  size="xs" 
                  leftSection={<IconCheck size={14} />} 
                  onClick={() => handleApprove(item.id_event)} 
                  loading={mutation.isPending && mutation.variables?.action === "approve"}
                >
                  Valider
                </Button>
                <Button 
                  color="red" 
                  variant="light" 
                  size="xs" 
                  leftSection={<IconX size={14} />} 
                  onClick={() => handleOpenRefuseModal(item.id_event)}
                >
                  Refuser
                </Button>
              </Group>
            </Table.Td>
          </Table.Tr>
        ))}
      </AdminTable>

      <Modal opened={opened} onClose={close} title="Raison du refus (Obligatoire)" centered>
        <Textarea
          placeholder="Veuillez expliquer à l'employé pourquoi l'événement est refusé..."
          value={refuseReason}
          onChange={(event) => setRefuseReason(event.currentTarget.value)}
          minRows={3}
          data-autofocus
        />
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={close} disabled={mutation.isPending}>Annuler</Button>
          <Button 
            color="red" 
            onClick={handleConfirmRefuse} 
            disabled={refuseReason.trim().length === 0} 
            loading={mutation.isPending && mutation.variables?.action === "refuse"}
          >
            Confirmer le refus
          </Button>
        </Group>
      </Modal>
    </>
  );
}