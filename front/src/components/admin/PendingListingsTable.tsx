import { useState } from "react";
import { Table, Button, Group, Badge, Modal, Textarea } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import AdminTable from "./AdminTable";
import { type PendingListing, processValidationAction } from "../../api/admin/validationModule";
import { showSuccessNotification } from "../../components/NotificationToast";
import { showErrorNotification } from "../../components/NotificationToast";

interface PendingListingsTableProps {
  data: PendingListing[];
  loading: boolean;
  onSuccess: () => void;
}

export default function PendingListingsTable({ data, loading, onSuccess }: PendingListingsTableProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [refuseReason, setRefuseReason] = useState("");

  const mutation = useMutation({
    mutationFn: ({ id, action, reason }: { id: number; action: "approve" | "refuse"; reason?: string }) =>
      processValidationAction("listings", id, action, reason),
    onSuccess: (_, variables) => {
      close();
      setRefuseReason("");
      onSuccess(); // Recharge les données parentes
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

  const headers = ["ID", "Annonce", "Prix", "Utilisateur", "Lieu", "Date", "Actions"];

  return (
    <>
      <AdminTable header={headers} loading={loading}>
        {data.length === 0 && !loading && (
          <Table.Tr>
            <Table.Td colSpan={headers.length} ta="center">Aucune annonce en attente</Table.Td>
          </Table.Tr>
        )}

        {data.map((item) => (
          <Table.Tr key={item.id_item}>
            <Table.Td ta="center">#{item.id_item}</Table.Td>
            <Table.Td ta="center">
              <strong>{item.title}</strong>
              <br />
              {/* Couleur différente pour différencier des dépôts (optionnel) */}
              <Badge size="sm" color="blue" variant="light">{item.material}</Badge>
            </Table.Td>
            
            {/* Gestion de l'affichage du prix (Payant vs Gratuit) */}
            <Table.Td ta="center">
              {item.price ? (
                <Badge color="green" variant="filled">{item.price} €</Badge>
              ) : (
                <Badge color="gray" variant="filled">Gratuit</Badge>
              )}
            </Table.Td>

            <Table.Td ta="center">{item.username}</Table.Td>
            <Table.Td ta="center">{item.city_name} ({item.postal_code})</Table.Td>
            <Table.Td ta="center">{new Date(item.created_at).toLocaleDateString("fr-FR")}</Table.Td>
            <Table.Td ta="center">
              <Group justify="center" gap="sm">
                <Button 
                  color="green" 
                  size="xs" 
                  leftSection={<IconCheck size={14} />} 
                  onClick={() => handleApprove(item.id_item)} 
                  loading={mutation.isPending && mutation.variables?.action === "approve"}
                >
                  Valider
                </Button>
                <Button 
                  color="red" 
                  variant="light" 
                  size="xs" 
                  leftSection={<IconX size={14} />} 
                  onClick={() => handleOpenRefuseModal(item.id_item)}
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
          placeholder="Veuillez expliquer à l'utilisateur pourquoi son annonce est refusée..."
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