import { Text, Pagination, Group } from "@mantine/core";

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
  if (hidden || total_records <= 0) {
    return null;
  }

  return (
    <Group justify="space-between" mt="md">
      <Text c="dimmed" size="sm">
        Showing {(activePage - 1) * limit + 1} -{" "}
        {Math.min(activePage * limit, total_records)} of {total_records}{" "}
        {total_records != 1 ? unit : unit.slice(0, -1)}
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
