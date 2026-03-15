import { Center, Loader, Table, Text } from "@mantine/core";
import type React from "react";

export interface AdminTableProps {
  header: string[];
  children: React.ReactNode;
  footer?: React.ReactNode;
  loading?: boolean;
  error?: Error | null;
}

export default function AdminTable({
  header,
  children,
  footer,
  loading,
  error,
}: AdminTableProps) {
  return (
    <Table.ScrollContainer minWidth={600} mx="0" maxHeight={600}>
      <Table
        verticalSpacing="sm"
        striped
        highlightOnHover
        style={{ width: "100%", maxWidth: "none" }}
        onLoad={loading ? () => {} : undefined}
      >
        <Table.Thead>
          <Table.Tr>
            {header.map((title, index) => (
              <Table.Th ta="center" key={index}>
                {title}
              </Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {loading ? (
            <Table.Tr>
              <Table.Td colSpan={header.length}>
                <Center py="sm">
                  <Loader size="sm" />
                </Center>
              </Table.Td>
            </Table.Tr>
          ) : error ? (
            <Table.Tr>
              <Table.Td colSpan={header.length}>
                <Center py="sm">
                  <Text c="red">Error</Text>
                </Center>
              </Table.Td>
            </Table.Tr>
          ) : (
            children
          )}
        </Table.Tbody>

        {footer && <Table.Caption mt="md">{footer}</Table.Caption>}
      </Table>
    </Table.ScrollContainer>
  );
}
