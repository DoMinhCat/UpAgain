import { Text, Pagination, Group } from "@mantine/core";
import { useTranslation } from "react-i18next";

interface PaginationFooterProps {
  activePage: number;
  setPage: (page: number) => void;
  total_records: number;
  last_page: number;
  limit: number;
  unit?: string;
  loading?: boolean;
  hidden?: boolean;
}

export default function PaginationFooter({
  activePage,
  setPage,
  total_records,
  last_page,
  limit,
  unit = "results",
  loading = false,
  hidden = false,
}: PaginationFooterProps) {
  const { t } = useTranslation("common");

  if (hidden || total_records <= 0) {
    return null;
  }

  return (
    <Group justify="space-between" mt="md">
      <Text c="dimmed" size="sm">
        {t("pagination.showing")} {(activePage - 1) * limit + 1} -{" "}
        {Math.min(activePage * limit, total_records)} {t("pagination.of")}{" "}
        {total_records} {t(`pagination.${unit}` as any)}
      </Text>
      <Pagination
        total={last_page || 1}
        value={activePage}
        onChange={setPage}
        disabled={loading}
      />
    </Group>
  );
}
