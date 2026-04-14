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
} from "@mantine/core";
import { useGetAllSubscriptions } from "../../../hooks/subscriptionHooks";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../../routes/paths";

export default function AdminSubscriptions() {
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
    </Container>
  );
}