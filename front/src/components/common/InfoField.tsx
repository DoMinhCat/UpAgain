import { Text } from "@mantine/core";
import { type ReactNode } from "react";

interface InfoFieldProps {
  label: string;
  children: ReactNode;
  mt?: string;
}

export default function InfoField({ label, children, mt }: InfoFieldProps) {
  return (
    <>
      <Text fw={700} mt={mt}>
        {label}
      </Text>
      {children}
    </>
  );
}
