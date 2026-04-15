import { useState } from "react";
import {
  Title,
  Select,
  Text,
  Group,
  Stack,
  Paper,
  Table,
  TextInput,
  Loader,
  Center,
  Badge,
  Pagination,
  ActionIcon,
  Modal,
  ScrollArea,
  SimpleGrid,
  Card,
  NumberInput,
  Button,
  Divider,
} from "@mantine/core";
import {
  IconSearch,
  IconChevronRight,
  IconFileInvoice,
  IconEdit,
  IconCheck,
} from "@tabler/icons-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useDebouncedValue } from "@mantine/hooks";
import {
  useGetFinanceRevenue,
  useGetFinanceSettings,
  useUpdateFinanceSetting,
  useGetInvoiceUsers,
  useGetUserInvoices,
} from "../../../hooks/financeHooks";
import type { FinanceSetting, UserInvoice } from "../../../api/interfaces/finance";
import { showErrorNotification, showSuccessNotification } from "../../../components/NotificationToast";
import GlobalStyles from "../../../styles/GlobalStyles.module.css";

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => String(CURRENT_YEAR - i));

const SETTING_LABELS: Record<string, string> = {
  trial_days: "Trial Days",
  commission_rate: "Commission Rate (%)",
  subscription_price: "Subscription Price (€)",
  ads_price_per_month: "Ads Price / Month (€)",
};

// --- Helpers ---

function formatEuros(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("fr-FR");
}

function getInvoiceDescription(inv: UserInvoice): string {
  switch (inv.type) {
    case "transaction":
      return inv.item_title ?? "—";
    case "subscription":
      return `${formatDate(inv.sub_from)} → ${formatDate(inv.sub_to)}`;
    case "ad":
      return inv.post_title ? `Post #${inv.post_id} — ${inv.post_title}` : "—";
    case "event":
      return inv.event_title ? `Event #${inv.event_id} — ${inv.event_title}` : "—";
    default:
      return "—";
  }
}

function getInvoiceDetails(inv: UserInvoice): string {
  switch (inv.type) {
    case "transaction":
      return `Price: ${formatEuros(inv.item_price ?? 0)} · Commission: ${formatEuros(inv.commission ?? 0)}`;
    case "ad":
      return `${formatDate(inv.ad_start_date)} → ${formatDate(inv.ad_end_date)}`;
    default:
      return "";
  }
}

const TYPE_COLORS: Record<string, string> = {
  transaction: "teal",
  subscription: "blue",
  ad: "violet",
  event: "orange",
};

// --- Page ---

export default function AdminFinance() {
  const [year, setYear] = useState<string>(String(CURRENT_YEAR));
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 400);
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  const { data: revenueData, isLoading: isLoadingRevenue } = useGetFinanceRevenue(Number(year));
  const { data: settingsData, isLoading: isLoadingSettings } = useGetFinanceSettings();
  const { data: usersData, isLoading: isLoadingUsers } = useGetInvoiceUsers(page, 20, debouncedSearch);
  const { data: invoicesData, isLoading: isLoadingInvoices } = useGetUserInvoices(
    selectedUserId ?? 0,
    invoiceModalOpen && selectedUserId !== null,
  );

  const handleOpenUserInvoices = (userId: number) => {
    setSelectedUserId(userId);
    setInvoiceModalOpen(true);
  };

  const chartData = revenueData?.data.map((d, i) => ({
    month: MONTH_LABELS[i],
    Subscriptions: d.subscriptions,
    Commissions: d.commissions,
    Ads: d.ads,
    Events: d.events,
  })) ?? [];

  const totalPages = usersData ? Math.ceil(usersData.total / 20) : 1;

  return (
    <Stack gap="xl" p="md">
      <Group justify="space-between">
        <Title order={2}>Financial Management</Title>
        <Button
          classNames={{ root: GlobalStyles.button }}
          variant="secondary"
          leftSection={<IconEdit size={16} />}
          onClick={() => setSettingsModalOpen(true)}
        >
          Edit Settings
        </Button>
      </Group>

      {/* Summary cards */}
      {revenueData && (
        <SimpleGrid cols={{ base: 2, md: 4 }}>
          <SummaryCard label="Subscriptions" value={revenueData.summary.total_subscriptions} color="blue" />
          <SummaryCard label="Commissions" value={revenueData.summary.total_commissions} color="teal" />
          <SummaryCard label="Ads" value={revenueData.summary.total_ads} color="violet" />
          <SummaryCard label="Events" value={revenueData.summary.total_events} color="orange" />
        </SimpleGrid>
      )}

      {/* Revenue bar chart */}
      <Paper withBorder p="md" radius="md">
        <Group justify="space-between" mb="md">
          <Text fw={600} size="lg">Monthly Revenue</Text>
          <Select
            data={YEAR_OPTIONS}
            value={year}
            onChange={(v) => v && setYear(v)}
            w={100}
          />
        </Group>

        {isLoadingRevenue ? (
          <Center h={300}><Loader /></Center>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(v) => `${v}€`} />
              <Tooltip formatter={(value) => typeof value === "number" ? formatEuros(value) : value} />
              <Legend />
              <Bar dataKey="Subscriptions" fill="#228be6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Commissions" fill="#12b886" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Ads" fill="#7950f2" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Events" fill="#fd7e14" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Paper>

      {/* Invoices table */}
      <Paper withBorder p="md" radius="md">
        <Group justify="space-between" mb="md">
          <Text fw={600} size="lg">Invoices by User</Text>
          <TextInput
            placeholder="Search a user..."
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => {
              setSearch(e.currentTarget.value);
              setPage(1);
            }}
            w={280}
          />
        </Group>

        {isLoadingUsers ? (
          <Center h={200}><Loader /></Center>
        ) : (
          <>
            <Table highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>User</Table.Th>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Role</Table.Th>
                  <Table.Th>Invoices</Table.Th>
                  <Table.Th>Total Spent</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {usersData?.users.length === 0 && (
                  <Table.Tr>
                    <Table.Td colSpan={6}>
                      <Center py="lg"><Text c="dimmed">No users found.</Text></Center>
                    </Table.Td>
                  </Table.Tr>
                )}
                {usersData?.users.map((u) => (
                  <Table.Tr key={u.id_account}>
                    <Table.Td fw={500}>{u.username}</Table.Td>
                    <Table.Td c="dimmed">{u.email}</Table.Td>
                    <Table.Td><RoleBadge role={u.role} /></Table.Td>
                    <Table.Td>{u.transaction_count}</Table.Td>
                    <Table.Td>{formatEuros(u.total_spent)}</Table.Td>
                    <Table.Td>
                      <ActionIcon
                        variant="subtle"
                        onClick={() => handleOpenUserInvoices(u.id_account)}
                        title="View invoices"
                      >
                        <IconChevronRight size={16} />
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>

            {totalPages > 1 && (
              <Group justify="center" mt="md">
                <Pagination total={totalPages} value={page} onChange={setPage} />
              </Group>
            )}
          </>
        )}
      </Paper>

      {/* User invoices modal */}
      <Modal
        opened={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        title={invoicesData ? `Invoices — ${invoicesData.username}` : "Loading..."}
        size="xl"
      >
        {isLoadingInvoices ? (
          <Center h={200}><Loader /></Center>
        ) : invoicesData && (invoicesData.invoices?.length ?? 0) === 0 ? (
          <Center py="xl">
            <Stack align="center" gap="xs">
              <IconFileInvoice size={40} color="gray" />
              <Text c="dimmed">No invoices for this user.</Text>
            </Stack>
          </Center>
        ) : (
          <ScrollArea>
            <Table highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Type</Table.Th>
                  <Table.Th>Description</Table.Th>
                  <Table.Th>Details</Table.Th>
                  <Table.Th>Total Paid</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {invoicesData?.invoices.map((inv, idx) => (
                  <Table.Tr key={`${inv.type}-${inv.id}-${idx}`}>
                    <Table.Td>{formatDate(inv.created_at)}</Table.Td>
                    <Table.Td>
                      <Badge variant="light" color={TYPE_COLORS[inv.type] ?? "gray"}>
                        {inv.type}
                      </Badge>
                    </Table.Td>
                    <Table.Td>{getInvoiceDescription(inv)}</Table.Td>
                    <Table.Td c="dimmed" size="sm">{getInvoiceDetails(inv)}</Table.Td>
                    <Table.Td fw={500}>{formatEuros(inv.amount)}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        )}
      </Modal>

      {/* Finance settings modal */}
      <FinanceSettingsModal
        opened={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        settings={settingsData ?? []}
        isLoading={isLoadingSettings}
      />
    </Stack>
  );
}

// --- Finance Settings Modal ---

interface FinanceSettingsModalProps {
  opened: boolean;
  onClose: () => void;
  settings: FinanceSetting[];
  isLoading: boolean;
}

function FinanceSettingsModal({ opened, onClose, settings, isLoading }: FinanceSettingsModalProps) {
  const [values, setValues] = useState<Record<string, number>>({});
  const { mutateAsync: updateSetting, isPending } = useUpdateFinanceSetting();

  // Initialise local values from fetched settings when modal opens
  const initialValues = settings.reduce<Record<string, number>>((acc, s) => {
    acc[s.key] = s.value;
    return acc;
  }, {});

  const getValue = (key: string) =>
    key in values ? values[key] : (initialValues[key] ?? 0);

  const handleSave = async (key: string) => {
    const newValue = getValue(key);
    try {
      await updateSetting({ key, value: newValue });
      showSuccessNotification("Settings updated", `${SETTING_LABELS[key] ?? key} updated successfully.`);
    } catch (error: any) {
      showErrorNotification("Update failed", undefined, error);
    }
  };

  const getConstraints = (key: string) => {
    switch (key) {
      case "trial_days":
        return { min: 1, step: 1, decimalScale: 0 };
      case "commission_rate":
        return { min: 0, max: 100, step: 0.1, decimalScale: 2 };
      default:
        return { min: 0, step: 0.01, decimalScale: 2 };
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Finance Settings" size="md">
      {isLoading ? (
        <Center h={200}><Loader /></Center>
      ) : (
        <Stack gap="md">
          <Text c="dimmed" size="sm">
            Changes take effect immediately. All amounts in euros (€).
          </Text>
          <Divider />
          {settings.map((setting) => {
            const constraints = getConstraints(setting.key);
            return (
              <Group key={setting.key} justify="space-between" align="flex-end">
                <Stack gap={2} style={{ flex: 1 }}>
                  <Text size="sm" fw={600}>{SETTING_LABELS[setting.key] ?? setting.key}</Text>
                  <Text size="xs" c="dimmed">Last updated: {formatDate(setting.updated_at)}</Text>
                </Stack>
                <Group gap="xs" align="flex-end">
                  <NumberInput
                    value={getValue(setting.key)}
                    onChange={(v) => setValues((prev) => ({ ...prev, [setting.key]: Number(v) }))}
                    w={130}
                    {...constraints}
                  />
                  <ActionIcon
                    classNames={{ root: GlobalStyles.actionIcon }}
                    variant="primary"
                    size="lg"
                    title="Save"
                    loading={isPending}
                    onClick={() => handleSave(setting.key)}
                  >
                    <IconCheck size={16} />
                  </ActionIcon>
                </Group>
              </Group>
            );
          })}
        </Stack>
      )}
    </Modal>
  );
}

// --- Sub-components ---

interface SummaryCardProps {
  label: string;
  value: number;
  color: string;
}

function SummaryCard({ label, value, color }: SummaryCardProps) {
  return (
    <Card withBorder radius="md" p="md">
      <Text size="sm" c="dimmed" mb={4}>{label}</Text>
      <Text fw={700} size="xl" c={color}>
        {new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "EUR",
          maximumFractionDigits: 0,
        }).format(value)}
      </Text>
    </Card>
  );
}

interface RoleBadgeProps {
  role: string;
}

function RoleBadge({ role }: RoleBadgeProps) {
  const colorMap: Record<string, string> = {
    admin: "red",
    employee: "blue",
    pro: "teal",
    user: "gray",
  };
  return (
    <Badge color={colorMap[role] ?? "gray"} variant="light">
      {role}
    </Badge>
  );
}
