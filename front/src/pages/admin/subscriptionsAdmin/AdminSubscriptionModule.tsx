import {
  Container,
  Title,
  Table,
  Avatar,
  Group,
  Text,
  Badge,
  Tabs,
  Skeleton,
  Paper,
  Button,
  Modal,
  NumberInput,
} from "@mantine/core";
import { useGetAllSubscriptions, useGetSubscriptionPrice, useUpdateSubscriptionPrice } from "../../../hooks/subscriptionHooks";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../../routes/paths";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";

export default function AdminSubscriptions() {

  const { data: price } = useGetSubscriptionPrice();
  const priceMutation = useUpdateSubscriptionPrice();
  const [openedPrice, { open: openPrice, close: closePrice }] = useDisclosure(false);
  const [newPrice, setNewPrice] = useState<number>(0);

  const navigate = useNavigate();

  const { data: ongoing, isLoading: loadingOngoing } = useGetAllSubscriptions(-1, -1, true);
  const { data: canceled, isLoading: loadingCanceled } = useGetAllSubscriptions(-1, -1, false);

  const renderRows = (data: typeof ongoing, showReason = false) =>
  (data?.subscriptions ?? []).map((sub) => ( 
    <Table.Tr
      key={sub.id}
      style={{ cursor: "pointer" }}
      onClick={() => navigate(`${PATHS.ADMIN.SUBSCRIPTIONS.ALL}/${sub.id}`)}
    >
      <Table.Td>{dayjs(sub.sub_from).format("DD/MM/YYYY HH:mm")}</Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Avatar src={sub.avatar} size="sm" radius="xl" />
          <Text size="sm">{sub.username}</Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Badge variant="light" color={sub.is_trial ? "blue" : "violet"}>
          {sub.is_trial ? "Trial" : "Premium"}
        </Badge>
      </Table.Td>
      <Table.Td>{dayjs(sub.sub_to).format("DD/MM/YYYY")}</Table.Td>
      {showReason && <Table.Td c="dimmed">{sub.cancel_reason ?? "—"}</Table.Td>}
    </Table.Tr>
  ));

  return (
    <Container px="md" size="xl">
      <Title order={2} mt="xs" mb="xl">
        Subscriptions Management
      </Title>
          <Paper variant="primary" px="lg" py="md" mb="xl">
        <Group justify="space-between">
          <div>
            <Text fw={700} size="lg">Premium subscription price</Text>
            <Text fw={900} size="xl">{price}€</Text>
          </div>
          <Button variant="delete" onClick={() => { setNewPrice(price ?? 0); openPrice(); }}>
            Modify
          </Button>
        </Group>
      </Paper>

      <Tabs defaultValue="ongoing">
        <Tabs.List mb="md">
          <Tabs.Tab value="ongoing">Ongoing</Tabs.Tab>
          <Tabs.Tab value="canceled">Canceled</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="ongoing">
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Start date</Table.Th>
                <Table.Th>Name</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>End date</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {loadingOngoing
                ? Array(3).fill(0).map((_, i) => (
                    <Table.Tr key={i}>
                      {Array(4).fill(0).map((_, j) => (
                        <Table.Td key={j}><Skeleton height={16} /></Table.Td>
                      ))}
                    </Table.Tr>
                  ))
                : renderRows(ongoing)}
            </Table.Tbody>
          </Table>
        </Tabs.Panel>

        <Tabs.Panel value="canceled">
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Start date</Table.Th>
                <Table.Th>Name</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>End date</Table.Th>
                <Table.Th>Reason</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {loadingCanceled
                ? Array(3).fill(0).map((_, i) => (
                    <Table.Tr key={i}>
                      {Array(5).fill(0).map((_, j) => (
                        <Table.Td key={j}><Skeleton height={16} /></Table.Td>
                      ))}
                    </Table.Tr>
                  ))
                : renderRows(canceled, true)}
            </Table.Tbody>
          </Table>
        </Tabs.Panel>
      </Tabs>
            <Modal opened={openedPrice} onClose={closePrice} title="Update Subscription Price" centered>
    <NumberInput
      label="New Price (€)"
      min={15}
      max={30}
      step={0.5}
      decimalScale={2}
      value={newPrice}
      onChange={(val) => setNewPrice(Number(val))}
    />
    <Group mt="xl" justify="flex-end">
      <Button variant="grey" onClick={closePrice}>Cancel</Button>
      <Button
        variant="light"
        loading={priceMutation.isPending}
        disabled={!newPrice || newPrice <= 0}
        onClick={() => priceMutation.mutate(newPrice, { onSuccess: () => closePrice() })}
      >
        Confirm
      </Button>
    </Group>
  </Modal>
    </Container>
  );
}