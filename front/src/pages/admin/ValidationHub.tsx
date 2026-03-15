import { useState } from "react";
import { Container, Tabs, Text, Table, Button, Group, Badge, Modal, Textarea } from "@mantine/core";
import { IconCheck, IconX, IconUsers } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import AdminBreadcrumbs from "../../components/admin/AdminBreadcrumbs";
import FullScreenLoader from "../../components/FullScreenLoader";
import AdminTable from "../../components/admin/AdminTable";
import { PATHS } from "../../routes/paths";
import { usePendingValidations, useProcessValidation } from "../../hooks/validationHooks";

export default function ValidationHub() {
  // 1. Hooks centrally loaded
  const { data, isLoading, isError } = usePendingValidations();
  const processMutation = useProcessValidation();

  // 2. Shared Refusal Modal State
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedEntity, setSelectedEntity] = useState<{ id: number; type: 'listings' | 'deposits' | 'events' } | null>(null);
  const [refuseReason, setRefuseReason] = useState("");

  // 3. Handlers
  const handleApprove = (id: number, type: 'listings' | 'deposits' | 'events') => {
    processMutation.mutate({ entityType: type, id, action: "approve" });
  };

  const handleOpenRefuseModal = (id: number, type: 'listings' | 'deposits' | 'events') => {
    setSelectedEntity({ id, type });
    open();
  };

  const handleConfirmRefuse = () => {
    if (selectedEntity && refuseReason.trim().length > 0) {
      processMutation.mutate(
        { entityType: selectedEntity.type, id: selectedEntity.id, action: "refuse", reason: refuseReason },
        {
          onSuccess: () => {
            close();
            setRefuseReason("");
          }
        }
      );
    }
  };

  if (isLoading) return <FullScreenLoader />;
  if (isError) return <Container mt="xl"><Text c="red" ta="center">Error loading data. Please try again.</Text></Container>;

  return (
    <Container size="xl" mt="md">
      <AdminBreadcrumbs
        breadcrumbs={[
          { title: "Dashboard", href: PATHS.ADMIN.HOME },
          { title: "Validations", href: PATHS.ADMIN.VALIDATIONS.ALL },
        ]}
      />

      <Tabs defaultValue="deposits">
        <Tabs.List>
          <Tabs.Tab value="deposits">
            Deposits ({data?.deposits?.length || 0})
          </Tabs.Tab>
          <Tabs.Tab value="listings">
            Listings ({data?.listings?.length || 0})
          </Tabs.Tab>
          <Tabs.Tab value="events">
            Events ({data?.events?.length || 0})
          </Tabs.Tab>
        </Tabs.List>


        <Tabs.Panel value="deposits" pt="xl">
          <AdminTable header={["ID", "Item", "User", "Location", "Date", "Actions"]} loading={isLoading}>
            {data?.deposits?.length === 0 && (
              <Table.Tr><Table.Td colSpan={6} ta="center">No pending deposits</Table.Td></Table.Tr>
            )}
            {data?.deposits?.map((item) => (
              <Table.Tr key={`dep-${item.id_item}`}>
                <Table.Td ta="center">#{item.id_item}</Table.Td>
                <Table.Td ta="center">
                  <strong>{item.title}</strong><br />
                  <Badge size="sm" color="gray" variant="light">{item.material}</Badge>
                </Table.Td>
                <Table.Td ta="center">{item.username}</Table.Td>
                <Table.Td ta="center">{item.city_name} ({item.postal_code})</Table.Td>
                <Table.Td ta="center">{new Date(item.created_at).toLocaleDateString("en-US")}</Table.Td>
                <Table.Td ta="center">
                  <Group justify="center" gap="sm">
                    <Button color="green" size="xs" leftSection={<IconCheck size={14} />} onClick={() => handleApprove(item.id_item, 'deposits')} loading={processMutation.isPending && processMutation.variables?.id === item.id_item && processMutation.variables?.action === "approve"}>Approve</Button>
                    <Button color="red" variant="light" size="xs" leftSection={<IconX size={14} />} onClick={() => handleOpenRefuseModal(item.id_item, 'deposits')}>Refuse</Button>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </AdminTable>
        </Tabs.Panel>


        <Tabs.Panel value="listings" pt="xl">
          <AdminTable header={["ID", "Listing", "Price", "User", "Location", "Date", "Actions"]} loading={isLoading}>
            {data?.listings?.length === 0 && (
              <Table.Tr><Table.Td colSpan={7} ta="center">No pending listings</Table.Td></Table.Tr>
            )}
            {data?.listings?.map((item) => (
              <Table.Tr key={`list-${item.id_item}`}>
                <Table.Td ta="center">#{item.id_item}</Table.Td>
                <Table.Td ta="center">
                  <strong>{item.title}</strong><br />
                  <Badge size="sm" color="blue" variant="light">{item.material}</Badge>
                </Table.Td>
                <Table.Td ta="center">
                  {item.price ? <Badge color="green" variant="filled">{item.price} €</Badge> : <Badge color="gray" variant="filled">Free</Badge>}
                </Table.Td>
                <Table.Td ta="center">{item.username}</Table.Td>
                <Table.Td ta="center">{item.city_name} ({item.postal_code})</Table.Td>
                <Table.Td ta="center">{new Date(item.created_at).toLocaleDateString("en-US")}</Table.Td>
                <Table.Td ta="center">
                  <Group justify="center" gap="sm">
                    <Button color="green" size="xs" leftSection={<IconCheck size={14} />} onClick={() => handleApprove(item.id_item, 'listings')} loading={processMutation.isPending && processMutation.variables?.id === item.id_item && processMutation.variables?.action === "approve"}>Approve</Button>
                    <Button color="red" variant="light" size="xs" leftSection={<IconX size={14} />} onClick={() => handleOpenRefuseModal(item.id_item, 'listings')}>Refuse</Button>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </AdminTable>
        </Tabs.Panel>


        <Tabs.Panel value="events" pt="xl">
          <AdminTable header={["ID", "Event", "Details", "Creator", "Scheduled Date", "Actions"]} loading={isLoading}>
            {data?.events?.length === 0 && (
              <Table.Tr><Table.Td colSpan={6} ta="center">No pending events</Table.Td></Table.Tr>
            )}
            {data?.events?.map((item) => (
              <Table.Tr key={`evt-${item.id_event}`}>
                <Table.Td ta="center">#{item.id_event}</Table.Td>
                <Table.Td ta="center">
                  <strong>{item.title}</strong><br />
                  <Badge size="sm" color="violet" variant="light">{item.category}</Badge>
                </Table.Td>
                <Table.Td ta="center">
                  <Group gap="xs" justify="center">
                    {item.capacity && <Badge color="gray" variant="outline" leftSection={<IconUsers size={12} />}>{item.capacity} spots</Badge>}
                    {item.price ? <Badge color="green" variant="light">{item.price} €</Badge> : <Badge color="gray" variant="light">Free</Badge>}
                  </Group>
                </Table.Td>
                <Table.Td ta="center">{item.employee_username}</Table.Td>
                <Table.Td ta="center">
                  <Text size="sm" fw={500}>{new Date(item.date_start).toLocaleDateString("en-US")}</Text>
                  {item.time_start && <Text size="xs" c="dimmed">at {item.time_start}</Text>}
                </Table.Td>
                <Table.Td ta="center">
                  <Group justify="center" gap="sm">
                    <Button color="green" size="xs" leftSection={<IconCheck size={14} />} onClick={() => handleApprove(item.id_event, 'events')} loading={processMutation.isPending && processMutation.variables?.id === item.id_event && processMutation.variables?.action === "approve"}>Approve</Button>
                    <Button color="red" variant="light" size="xs" leftSection={<IconX size={14} />} onClick={() => handleOpenRefuseModal(item.id_event, 'events')}>Refuse</Button>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </AdminTable>
        </Tabs.Panel>
      </Tabs>


      <Modal opened={opened} onClose={close} title="Reason for refusal (Required)" centered>
        <Textarea
          placeholder="Please explain why this is being refused..."
          value={refuseReason}
          onChange={(event) => setRefuseReason(event.currentTarget.value)}
          minRows={3}
          data-autofocus
        />
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={close} disabled={processMutation.isPending}>Cancel</Button>
          <Button 
            color="red" 
            onClick={handleConfirmRefuse} 
            disabled={refuseReason.trim().length === 0} 
            loading={processMutation.isPending && processMutation.variables?.action === "refuse"}
          >
            Confirm Refusal
          </Button>
        </Group>
      </Modal>
    </Container>
  );
}