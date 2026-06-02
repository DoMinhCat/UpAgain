import { Center, Skeleton, ScrollArea, Table, Text } from "@mantine/core";
import type React from "react";
import { useState } from "react";

export interface AdminTableProps {
  header: string[];
  children: React.ReactNode;
  footer?: React.ReactNode;
  loading?: boolean;
  error?: Error | null;
  maxHeight?: string | number;
}

export default function AdminTable({
  header,
  children,
  footer,
  loading,
  error,
  maxHeight = "90vh",
}: AdminTableProps) {
  const [scrolled, setScrolled] = useState(false);
  return (
    <ScrollArea
      mah={maxHeight}
      onScrollPositionChange={({ y }) => setScrolled(y !== 0)}
    >
      <Table
        stickyHeader
        verticalSpacing="sm"
        striped
        highlightOnHover
        style={{ width: "100%", maxWidth: "none" }}
        onLoad={loading ? () => {} : undefined}
      >
        <Table.Thead
          style={{
            backgroundColor: "var(--mantine-color-body)",
            zIndex: 1,
            boxShadow: scrolled ? "var(--mantine-shadow-sm)" : "none",
            transition: "box-shadow 150ms ease",
          }}
        >
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
                  <Skeleton height={20} width="100%" />
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
    </ScrollArea>
  );
}
