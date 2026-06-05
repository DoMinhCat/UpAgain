import {
  Stack,
  Group,
  Text,
  Title,
  Table,
  Badge,
  ActionIcon,
  Tooltip,
  Center,
  Skeleton,
  Paper,
  ScrollArea,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { IconDownload, IconFileInvoice } from "@tabler/icons-react";
import { useAuth } from "../../../context/AuthContext";
import { useGetUserInvoices } from "../../../hooks/financeHooks";
import {
  formatDate,
  formatEuros,
  getInvoiceDescription,
  getInvoiceDetails,
  generateInvoicePDF,
} from "../../../utils/invoiceUtils";
import { NotFoundPage } from "../../error/404";

const TYPE_COLORS: Record<string, string> = {
  transaction: "teal",
  subscription: "blue",
  ad: "violet",
  event: "orange",
};

export default function BillingsTab() {
  const { t, i18n } = useTranslation("profile");
  const { user } = useAuth();

  const { data: invoicesData, isLoading } = useGetUserInvoices(
    user?.id ?? 0,
    !!user?.id,
  );

  if (user?.role !== "user" && user?.role !== "pro") {
    return <NotFoundPage />;
  }

  return (
    <Stack gap="xl">
      <Stack gap={5}>
        <Title order={1} size={42} fw={800}>
          {t("billings.title")}
        </Title>
        <Text c="dimmed" size="lg">
          {t("billings.subtitle")}
        </Text>
      </Stack>

      <Paper withBorder radius="md" p="md">
        {isLoading ? (
          <Stack gap="xs" p="md">
            {/* Table header skeleton */}
            <Group justify="space-between" mb="xs">
              {["20%", "12%", "25%", "20%", "10%", "5%"].map((w, i) => (
                <Skeleton key={i} height={14} width={w} />
              ))}
            </Group>
            {/* Table rows skeleton */}
            {[1, 2, 3, 4, 5].map((i) => (
              <Group key={i} justify="space-between" py="xs">
                <Skeleton height={16} width="18%" />
                <Skeleton height={20} width={70} radius="xl" />
                <Skeleton height={16} width="22%" />
                <Skeleton height={16} width="18%" />
                <Skeleton height={16} width="8%" />
                <Skeleton height={28} width={28} radius="md" />
              </Group>
            ))}
          </Stack>
        ) : !invoicesData?.invoices?.length ? (
          <Center py="xl">
            <Stack align="center" gap="xs">
              <IconFileInvoice size={48} color="gray" opacity={0.5} />
              <Text c="dimmed" size="lg">
                {t("billings.table.no_invoices")}
              </Text>
            </Stack>
          </Center>
        ) : (
          <ScrollArea>
            <Table highlightOnHover verticalSpacing="md">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t("billings.table.date")}</Table.Th>
                  <Table.Th>{t("billings.table.type")}</Table.Th>
                  <Table.Th>{t("billings.table.description")}</Table.Th>
                  <Table.Th>{t("billings.table.details")}</Table.Th>
                  <Table.Th>{t("billings.table.amount")}</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {invoicesData.invoices.map((inv, idx) => (
                  <Table.Tr key={`${inv.type}-${inv.id}-${idx}`}>
                    <Table.Td>
                      {formatDate(inv.created_at, i18n.language)}
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        variant="light"
                        color={TYPE_COLORS[inv.type] ?? "gray"}
                        size="sm"
                      >
                        {inv.type}
                      </Badge>
                    </Table.Td>
                    <Table.Td fw={500}>
                      {getInvoiceDescription(inv, i18n.language)}
                    </Table.Td>
                    <Table.Td c="dimmed" fz="sm">
                      {getInvoiceDetails(inv, i18n.language)}
                    </Table.Td>
                    <Table.Td fw={700} fz="lg">
                      {formatEuros(inv.amount, i18n.language)}
                    </Table.Td>
                    <Table.Td>
                      <Tooltip
                        label={t("billings.download_tooltip")}
                        withArrow
                        position="top"
                      >
                        <ActionIcon
                          variant="subtle"
                          color="var(--upagain-light-green)"
                          size="lg"
                          radius="md"
                          onClick={() =>
                            generateInvoicePDF(
                              inv,
                              invoicesData.username || user?.username || "User",
                            )
                          }
                        >
                          <IconDownload size={20} />
                        </ActionIcon>
                      </Tooltip>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        )}
      </Paper>
    </Stack>
  );
}
