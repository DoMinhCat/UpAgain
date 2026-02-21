import { Text, Pagination, Flex } from "@mantine/core";

interface PaginationProps {
  page_count: number;
  start_item: number;
  total: number;
  end_item: number;
  unit: string;
}
export default function PaginationFooter({
  page_count,
  start_item,
  end_item,
  total,
  unit,
}: PaginationProps) {
  return (
    <Flex
      gap="xl"
      justify="space-between"
      align="center"
      direction="row"
      wrap="wrap"
    >
      <Text c="dimmed" size="sm">
        Showing {start_item} to {end_item} of {total} {unit}
      </Text>
      <Pagination total={page_count} defaultValue={1} />
    </Flex>
  );
}
