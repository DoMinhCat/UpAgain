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
} from "@mantine/core";
import {
  IconSearch,
  IconChevronRight,
  IconFileInvoice,
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
  useGetInvoiceUsers,
  useGetUserInvoices,
} from "../../../hooks/financeHooks";
import type { UserInvoice } from "../../../api/interfaces/finance";

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => String(CURRENT_YEAR - i));

// --- Helpers ---

function formatEuros(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR");
}

function generateInvoicePDF(invoice: UserInvoice, username: string): void {
  const isSubscription = invoice.action === "subscription";
  const html = `
    <!DOCTYPE html><html lang="en"><head>
    <meta charset="UTF-8">
    <title>Invoice ${invoice.id_transaction}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
      h1 { color: #c0392b; }
      .meta { color: #888; font-size: 13px; margin-bottom: 24px; }
      table { width: 100%; border-collapse: collapse; margin-top: 24px; }
      th { background: #f5f5f5; padding: 10px; text-align: left; border-bottom: 2px solid #ddd; }
      td { padding: 10px; border-bottom: 1px solid #eee; }
      .total { font-weight: bold; font-size: 16px; margin-top: 24px; text-align: right; }
      .footer { margin-top: 48px; font-size: 12px; color: #aaa; }
    </style></head><body>
    <h1>UpcycleConnect</h1>
    <p class="meta">Invoice N° ${invoice.id_transaction}<br>Date: ${formatDate(invoice.created_at)}<br>Customer: ${username}</p>
    <table>
      ${isSubscription
        ? `<tr><th>Item</th><th>Price</th></tr>
           <tr><td>${invoice.item_title}</td><td>${formatEuros(invoice.item_price)}</td></tr>`
        : `<tr><th>Item</th><th>Price</th><th>Commission</th><th>Total</th></tr>
           <tr>
             <td>${invoice.item_title}</td>
             <td>${formatEuros(invoice.item_price)}</td>
             <td>${formatEuros(invoice.amount)}</td>
             <td>${formatEuros(invoice.item_price)}</td>
           </tr>`
      }
    </table>
    <p class="total">Total: ${formatEuros(invoice.item_price)}</p>
    <p class="footer">UpcycleConnect — 174 rue La Fayette, 75010 Paris — contact@upcycleconnect.fr</p>
    </body></html>
  `;
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `invoice_${invoice.id_transaction}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

// --- Page ---

export default function AdminFinance() {
  const [year, setYear] = useState<string>(String(CURRENT_YEAR));
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 400);
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: revenueData, isLoading: isLoadingRevenue } = useGetFinanceRevenue(Number(year));
  const { data: usersData, isLoading: isLoadingUsers } = useGetInvoiceUsers(page, 20, debouncedSearch);
  const { data: invoicesData, isLoading: isLoadingInvoices } = useGetUserInvoices(
    selectedUserId ?? 0,
    modalOpen && selectedUserId !== null,
  );

  const handleOpenUserInvoices = (userId: number) => {
    setSelectedUserId(userId);
    setModalOpen(true);
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
      <Title order={2}>Financial Management</Title>

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
                  <Table.Th>Transactions</Table.Th>
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
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={invoicesData ? `Invoices — ${invoicesData.username}` : "Loading..."}
        size="xl"
      >
        {isLoadingInvoices ? (
          <Center h={200}><Loader /></Center>
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
                  <Table.Th>Item</Table.Th>
                  <Table.Th>Action</Table.Th>
                  <Table.Th>Price</Table.Th>
                  <Table.Th>Commission</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {invoicesData?.invoices?.map((inv) => (
                  <Table.Tr key={inv.id}>
                    <Table.Td>{formatDate(inv.created_at)}</Table.Td>
                    <Table.Td>{inv.item_title}</Table.Td>
                    <Table.Td>
                      <Badge variant="light" color={inv.action === "purchased" ? "teal" : "blue"}>
                        {inv.action}
                      </Badge>
                    </Table.Td>
                    <Table.Td>{formatEuros(inv.item_price)}</Table.Td>
                    <Table.Td c="dimmed">
                      {inv.action === "subscription" ? "—" : formatEuros(inv.amount)}
                    </Table.Td>
                    <Table.Td>
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        title="Download invoice"
                        onClick={() => generateInvoicePDF(inv, invoicesData.username)}
                      >
                        <IconDownload size={16} />
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        )}
      </Modal>
    </Stack>
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