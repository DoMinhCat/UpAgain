import { Table } from "@mantine/core";
import type React from "react";

export interface AdminTableProps {
  header: string[];
  body: (string | number)[][];
  footer?: React.ReactNode;
}

export default function AdminTable({ header, body, footer }: AdminTableProps) {
  return (
    <Table striped highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          {header.map((title, index) => (
            <Table.Th key={index}>{title}</Table.Th>
          ))}
        </Table.Tr>
      </Table.Thead>

      <Table.Tbody>
        {body.map((row, rowIndex) => (
          <Table.Tr key={rowIndex}>
            {row.map((cell, cellIndex) => (
              <Table.Td key={cellIndex}>{cell}</Table.Td>
            ))}
          </Table.Tr>
        ))}
      </Table.Tbody>

      <Table.Caption>{footer}</Table.Caption>
    </Table>
  );
}
