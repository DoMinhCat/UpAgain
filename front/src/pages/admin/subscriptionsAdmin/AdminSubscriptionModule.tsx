import {
  Container,
  Title,
  Table,
  Avatar,
  Group,
  Text,
  Badge,
  Tabs,
  Paper,
  Button,
  Modal,
  NumberInput,
  Stack,
  ThemeIcon,
  Tooltip,
  Divider,
} from "@mantine/core";
import { IconCurrencyEuro, IconPencil } from "@tabler/icons-react";
import {
  useGetAllSubscriptions,
  useGetSubscriptionPrice,
  useUpdateSubscriptionPrice,
  useGetTrialDays,
  useUpdateTrialDays,
} from "../../../hooks/subscriptionHooks";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../../routes/paths";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import AdminTable from "../../../components/admin/AdminTable";
import PaginationFooter from "../../../components/common/PaginationFooter";

const LIMIT = 10;

export default function AdminSubscriptions() {
  const { data: price } = useGetSubscriptionPrice();
  const priceMutation = useUpdateSubscriptionPrice();
  const [openedPrice, { open: openPrice, close: closePrice }] =
    useDisclosure(false);
  const [newPrice, setNewPrice] = useState<number>(0);

  const navigate = useNavigate();

  const { data: trialDays } = useGetTrialDays();
  const trialMutation = useUpdateTrialDays();
  const [openedTrial, { open: openTrial, close: closeTrial }] = useDisclosure(false);
  const [newTrialDays, setNewTrialDays] = useState<number>(0);
  
  // separate pagination state per tab
  const [ongoingPage, setOngoingPage] = useState(1);
  const [canceledPage, setCanceledPage] = useState(1);

  const { data: ongoing, isLoading: loadingOngoing } = useGetAllSubscriptions(
    ongoingPage,
    LIMIT,
    true,
  );
  const { data: canceled, isLoading: loadingCanceled } = useGetAllSubscriptions(
    canceledPage,
    LIMIT,
    false,
  );

  const renderRows = (data: typeof ongoing, showReason = false) =>
    (data?.subscriptions ?? []).length === 0 ? (
      <Table.Tr>
        <Table.Td colSpan={showReason ? 5 : 4}>
          <Text ta="center" c="dimmed" py="md">
            No subscriptions found.
          </Text>
        </Table.Td>
      </Table.Tr>
    ) : (
      (data?.subscriptions ?? []).map((sub) => (
        <Table.Tr
          key={sub.id}
          style={{ cursor: "pointer" }}
          onClick={() => navigate(`${PATHS.ADMIN.SUBSCRIPTIONS.ALL}/${sub.id}`)}
        >
          <Table.Td ta="center">
            {dayjs(sub.sub_from).format("DD/MM/YYYY HH:mm")}
          </Table.Td>
          <Table.Td ta="center">
            {dayjs(sub.sub_to).format("DD/MM/YYYY")}
          </Table.Td>
          <Table.Td ta="center">
            <Group gap="xs" justify="center">
              <Avatar
                src={sub.avatar}
                size="sm"
                radius="xl"
                name={sub.username}
                color="initials"
              />
              <Text size="sm">{sub.username}</Text>
            </Group>
          </Table.Td>
          <Table.Td ta="center">
            <Badge variant="light" color={sub.is_trial ? "blue" : "violet"}>
              {sub.is_trial ? "Trial" : "Premium"}
            </Badge>
          </Table.Td>
          {showReason && (
            <Table.Td ta="center" c="dimmed" style={{ maxWidth: 150 }}>
              <Tooltip
                multiline
                w={250}
                withArrow
                disabled={!sub.cancel_reason}
                label={
                  <Text size="xs" lineClamp={3}>
                    {sub.cancel_reason}
                  </Text>
                }
              >
                <Text truncate="end" size="sm" style={{ cursor: "help" }}>
                  {sub.cancel_reason ?? "—"}
                </Text>
              </Tooltip>
            </Table.Td>
          )}
        </Table.Tr>
      ))
    );

  return (
    <Container px="md" size="xl">
      <Title order={2} mt="lg" mb="xl">
        Subscriptions Management
      </Title>

      {/* Price card */}
      <Paper withBorder variant="primary" radius="md" p="lg" mb="xl">
        <Group justify="space-between" align="center" wrap="nowrap">
          <Group gap="md" align="center">
            <ThemeIcon
              size={48}
              radius="md"
              variant="light"
              color="var(--upagain-neutral-green)"
            >
              <IconCurrencyEuro size={26} />
            </ThemeIcon>
            <Stack gap={2}>
              <Text size="sm" c="dimmed" fw={500}>
                Premium subscription price
              </Text>
              <Text fw={900} size="xl">
                {price != null ? `${price} €` : "—"}
              </Text>
            </Stack>
          </Group>
          <Button
            variant="edit"
            leftSection={<IconPencil size={15} />}
            onClick={() => {
              setNewPrice(price ?? 0);
              openPrice();
            }}
          >
            Modify
          </Button>
        </Group>
          <Divider my="sm" />
            <Group justify="space-between">
              <div>
                <Text fw={700} size="lg">Trial period</Text>
                <Text fw={900} size="xl">{trialDays} days</Text>
              </div>
              <Button variant="light" onClick={() => { setNewTrialDays(trialDays ?? 0); openTrial(); }}>
                Modify
              </Button>
            </Group>
      </Paper>
          
      <Modal opened={openedTrial} onClose={closeTrial} title="Update Trial Period" centered>
        <NumberInput
          label="Trial Days"
          min={1}
          max={90}
          value={newTrialDays}
          onChange={(val) => setNewTrialDays(Number(val))}
        />
        <Group mt="xl" justify="flex-end">
          <Button variant="grey" onClick={closeTrial}>Cancel</Button>
          <Button
            variant="light"
            loading={trialMutation.isPending}
            disabled={!newTrialDays || newTrialDays <= 0}
            onClick={() => trialMutation.mutate(newTrialDays, { onSuccess: () => closeTrial() })}
          >
            Confirm
          </Button>
        </Group>
      </Modal>
      {/* Tabs */}
      <Tabs defaultValue="ongoing">
        <Tabs.List mb="md">
          <Tabs.Tab value="ongoing" color="var(--upagain-neutral-green)">
            Active
          </Tabs.Tab>
          <Tabs.Tab value="canceled" color="red">
            Canceled
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="ongoing">
          <AdminTable
            loading={loadingOngoing}
            header={["Start date", "End date", "Username", "Type"]}
            footer={
              <PaginationFooter
                activePage={ongoingPage}
                setPage={setOngoingPage}
                total_records={ongoing?.total_records ?? 0}
                last_page={ongoing?.last_page ?? 1}
                limit={LIMIT}
                loading={loadingOngoing}
                unit="subscriptions"
              />
            }
          >
            {renderRows(ongoing)}
          </AdminTable>
        </Tabs.Panel>

        <Tabs.Panel value="canceled">
          <AdminTable
            loading={loadingCanceled}
            header={[
              "Start date",
              "End date",
              "Username",
              "Type",
              "Cancel reason",
            ]}
            footer={
              <PaginationFooter
                activePage={canceledPage}
                setPage={setCanceledPage}
                total_records={canceled?.total_records ?? 0}
                last_page={canceled?.last_page ?? 1}
                limit={LIMIT}
                loading={loadingCanceled}
                unit="subscriptions"
              />
            }
          >
            {renderRows(canceled, true)}
          </AdminTable>
        </Tabs.Panel>
      </Tabs>

      {/* Edit price modal */}
      <Modal
        opened={openedPrice}
        onClose={closePrice}
        title="Update Subscription Price"
        centered
      >
        <Stack gap="md">
          <NumberInput
            label="New Price (€)"
            description="Allowed range: 15 € – 30 €"
            min={15}
            max={30}
            step={0.5}
            decimalScale={2}
            value={newPrice}
            onChange={(val) => setNewPrice(Number(val))}
            leftSection={<IconCurrencyEuro size={16} />}
          />
          <Group mt="sm" justify="flex-end">
            <Button variant="grey" onClick={closePrice}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={priceMutation.isPending}
              disabled={!newPrice || newPrice <= 0}
              onClick={() =>
                priceMutation.mutate(newPrice, {
                  onSuccess: () => closePrice(),
                })
              }
            >
              Confirm
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
