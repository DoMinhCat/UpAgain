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
  Pill,
  ActionIcon,
  Modal,
  ScrollArea,
  SimpleGrid,
  Card,
  NumberInput,
  Button,
  Divider,
  Tooltip as MantineTooltip,
} from "@mantine/core";
import AdminTable from "../../../components/admin/AdminTable";
import PaginationFooter from "../../../components/common/PaginationFooter";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../../routes/paths";
import {
  IconSearch,
  IconEye,
  IconFileInvoice,
  IconEdit,
  IconCheck,
  IconDownload,
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
import type {
  FinanceSetting,
  UserInvoice,
} from "../../../api/interfaces/finance";
import {
  showErrorNotification,
  showSuccessNotification,
} from "../../../components/common/NotificationToast";
import GlobalStyles from "../../../styles/GlobalStyles.module.css";
import {
  formatEuros,
  formatDate,
  getInvoiceDescription,
  getInvoiceDetails,
  generateInvoicePDF,
} from "../../../utils/invoiceUtils";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) =>
  String(CURRENT_YEAR - i),
);

const SETTING_LABELS: Record<string, string> = {
  trial_days: "Trial Days",
  commission_rate: "Commission Rate (%)",
  subscription_price: "Subscription Price (€)",
  ads_price_per_month: "Ads Price / Month (€)",
};

const TYPE_COLORS: Record<string, string> = {
  transaction: "teal",
  subscription: "blue",
  ad: "violet",
  event: "orange",
};

// --- Page ---

export default function AdminFinance() {
  const navigate = useNavigate();
  const [year, setYear] = useState<string>(String(CURRENT_YEAR));
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 400);
  const [sort, setSort] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  const { data: revenueData, isLoading: isLoadingRevenue } =
    useGetFinanceRevenue(Number(year));
  const { data: settingsData, isLoading: isLoadingSettings } =
    useGetFinanceSettings();
  const { data: usersData, isLoading: isLoadingUsers } = useGetInvoiceUsers(
    page,
    10,
    debouncedSearch,
    sort || undefined,
  );
  const { data: invoicesData, isLoading: isLoadingInvoices } =
    useGetUserInvoices(
      selectedUserId ?? 0,
      invoiceModalOpen && selectedUserId !== null,
    );

  const handleOpenUserInvoices = (userId: number) => {
    setSelectedUserId(userId);
    setInvoiceModalOpen(true);
  };

  const chartData =
    revenueData?.data.map((d, i) => ({
      month: MONTH_LABELS[i],
      Subscriptions: d.subscriptions,
      Commissions: d.commissions,
      Ads: d.ads,
      Events: d.events,
    })) ?? [];

  return (
    <Stack gap="xl" p="md">
      <Group justify="space-between">
        <Title order={2}>Finance Management</Title>
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
          <SummaryCard
            label="Ads"
            value={revenueData.summary.total_ads}
            color="red"
          />
          <SummaryCard
            label="Commissions"
            value={revenueData.summary.total_commissions}
            color="var(--upagain-neutral-green)"
          />
          <SummaryCard
            label="Events"
            value={revenueData.summary.total_events}
            color="var(--upagain-yellow)"
          />
          <SummaryCard
            label="Subscriptions"
            value={revenueData.summary.total_subscriptions}
            color="blue"
          />
        </SimpleGrid>
      )}

      {/* Revenue bar chart */}
      <Paper withBorder p="md" radius="md" variant="primary">
        <Group justify="space-between" mb="md">
          <Text fw={600} size="lg">
            Monthly Revenue
          </Text>
          <Select
            data={YEAR_OPTIONS}
            value={year}
            onChange={(v) => v && setYear(v)}
            w={100}
          />
        </Group>

        {isLoadingRevenue ? (
          <Center h={300}>
            <Loader />
          </Center>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(v) => `${v}€`} />
              <Tooltip
                formatter={(value) =>
                  typeof value === "number" ? formatEuros(value) : value
                }
                contentStyle={{
                  backgroundColor: "var(--mantine-color-body)",
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "var(--mantine-shadow-md)",
                  color: "var(--mantine-color-text)",
                }}
                itemStyle={{ color: "var(--mantine-color-text)" }} // Color for the list items
                labelStyle={{
                  fontWeight: 700,
                  marginBottom: "4px",
                  color: "var(--mantine-color-text)",
                }}
                cursor={{ fill: "rgba(255, 255, 255, 0.1)" }} // Changes the highlight color when hovering over a bar
              />
              <Legend />
              <Bar
                dataKey="Subscriptions"
                fill="#228be6"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="Commissions"
                fill="var(--upagain-neutral-green)"
                radius={[4, 4, 0, 0]}
              />
              <Bar dataKey="Ads" fill="#eb4034" radius={[4, 4, 0, 0]} />
              <Bar
                dataKey="Events"
                fill="var(--upagain-yellow)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Paper>

      {/* Invoices table */}
      <Paper withBorder p="md" radius="md">
        <Group justify="space-between" mb="md">
          <Text fw={600} size="lg">
            Invoices by User
          </Text>
          <Group>
            <Select
              placeholder="Sort by"
              data={[
                { value: "most_spending", label: "Most spending" },
                { value: "least_spending", label: "Least spending" },
                { value: "most_invoices", label: "Most invoices" },
                { value: "least_invoices", label: "Least invoices" },
              ]}
              value={sort}
              onChange={(val) => {
                setSort(val);
                setPage(1);
              }}
              clearable
              w={180}
            />
            <TextInput
              placeholder="Search by username or email..."
              rightSection={<IconSearch size={14} />}
              value={search}
              onChange={(e) => {
                setSearch(e.currentTarget.value);
                setPage(1);
              }}
              w={240}
            />
          </Group>
        </Group>

        <AdminTable
          loading={isLoadingUsers}
          header={[
            "User",
            "Email",
            "Role",
            "Total Invoices",
            "Total Spending",
            "",
          ]}
          footer={
            <PaginationFooter
              activePage={page}
              setPage={setPage}
              total_records={usersData?.total || 0}
              last_page={Math.ceil((usersData?.total || 0) / 10) || 1}
              limit={10}
              loading={isLoadingUsers}
              hidden={Boolean(debouncedSearch)}
            />
          }
        >
          {(!usersData?.users || usersData.users.length === 0) &&
          !isLoadingUsers ? (
            <Table.Tr>
              <Table.Td colSpan={6}>
                <Center py="lg">
                  <Text c="dimmed">No users found.</Text>
                </Center>
              </Table.Td>
            </Table.Tr>
          ) : (
            usersData?.users?.map((u) => (
              <Table.Tr
                key={u.id_account}
                style={{ cursor: "pointer" }}
                onClick={() =>
                  navigate(PATHS.ADMIN.USERS.ALL + "/" + u.id_account, {
                    state: { from: "finance" },
                  })
                }
              >
                <Table.Td ta="center" fw={500}>
                  {u.username}
                </Table.Td>
                <Table.Td ta="center" c="dimmed">
                  {u.email}
                </Table.Td>
                <Table.Td ta="center">
                  {u.role === "user" ? (
                    <Pill variant="blue">User</Pill>
                  ) : u.role === "pro" ? (
                    <Pill variant="yellow">Pro</Pill>
                  ) : u.role === "employee" ? (
                    <Pill variant="green">Employee</Pill>
                  ) : (
                    <Pill variant="red">Admin</Pill>
                  )}
                </Table.Td>
                <Table.Td ta="center">{u.transaction_count}</Table.Td>
                <Table.Td ta="center">{formatEuros(u.total_spent)}</Table.Td>
                <Table.Td ta="center">
                  <MantineTooltip
                    label="View invoices"
                    withArrow
                    position="top"
                  >
                    <ActionIcon
                      variant="subtle"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenUserInvoices(u.id_account);
                      }}
                    >
                      <IconEye color="var(--upagain-neutral-green)" size={16} />
                    </ActionIcon>
                  </MantineTooltip>
                </Table.Td>
              </Table.Tr>
            ))
          )}
        </AdminTable>
      </Paper>

      {/* User invoices modal */}
      <Modal
        opened={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        title={
          invoicesData
            ? `Invoices — ${invoicesData.username}`
            : "Loading invoices..."
        }
        size="xl"
      >
        {isLoadingInvoices ? (
          <Center h={200}>
            <Loader />
          </Center>
        ) : invoicesData && !invoicesData.invoices?.length ? (
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
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {invoicesData?.invoices?.map((inv, idx) => (
                  <Table.Tr key={`${inv.type}-${inv.id}-${idx}`}>
                    <Table.Td>{formatDate(inv.created_at)}</Table.Td>
                    <Table.Td>
                      <Badge
                        variant="light"
                        color={TYPE_COLORS[inv.type] ?? "gray"}
                      >
                        {inv.type}
                      </Badge>
                    </Table.Td>
                    <Table.Td>{getInvoiceDescription(inv)}</Table.Td>
                    <Table.Td c="dimmed" fz="sm">
                      {getInvoiceDetails(inv)}
                    </Table.Td>
                    <Table.Td fw={500}>{formatEuros(inv.amount)}</Table.Td>
                    <Table.Td>
                      <MantineTooltip
                        label="Download invoice"
                        withArrow
                        position="top"
                      >
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          onClick={() =>
                            generateInvoicePDF(inv, invoicesData.username)
                          }
                        >
                          <IconDownload size={16} />
                        </ActionIcon>
                      </MantineTooltip>
                    </Table.Td>
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

function FinanceSettingsModal({
  opened,
  onClose,
  settings,
  isLoading,
}: FinanceSettingsModalProps) {
  const [values, setValues] = useState<Record<string, number>>({});
  const { mutateAsync: updateSetting, isPending } = useUpdateFinanceSetting();

  const initialValues = settings.reduce<Record<string, number>>((acc, s) => {
    acc[s.key] = s.value;
    return acc;
  }, {});

  const getValue = (key: string) =>
    key in values ? values[key] : (initialValues[key] ?? 0);

  const handleSave = async (key: string) => {
    try {
      await updateSetting({ key, value: getValue(key) });
      showSuccessNotification(
        "Settings updated",
        `${SETTING_LABELS[key] ?? key} updated successfully.`,
      );
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
        <Center h={200}>
          <Loader />
        </Center>
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
                  <Text size="sm" fw={600}>
                    {SETTING_LABELS[setting.key] ?? setting.key}
                  </Text>
                  <Text size="xs" c="dimmed">
                    Last updated: {formatDate(setting.updated_at)}
                  </Text>
                </Stack>
                <Group gap="xs" align="flex-end">
                  <NumberInput
                    value={getValue(setting.key)}
                    onChange={(v) =>
                      setValues((prev) => ({
                        ...prev,
                        [setting.key]: Number(v),
                      }))
                    }
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
    <Card withBorder radius="md" p="md" shadow="sm">
      <Text size="sm" c="dimmed" mb={4}>
        {label}
      </Text>
      <Text fw={700} size="xl" c={color}>
        {new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "EUR",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value)}
      </Text>
    </Card>
  );
}
