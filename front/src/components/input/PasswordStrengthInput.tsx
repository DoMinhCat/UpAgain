import {
  Box,
  PasswordInput,
  type PasswordInputProps,
  Popover,
  Progress,
  Stack,
  Text,
} from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useState } from "react";

export const requirements = [
  { re: /[0-9]/, label: "Includes number" },
  { re: /[A-Z]/, label: "Includes uppercase letter" },
  { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: "Includes special character" },
];

function getStrength(password: string) {
  let multiplier = password.length > 11 ? 0 : 1;

  requirements.forEach((requirement) => {
    if (!requirement.re.test(password)) {
      multiplier += 1;
    }
  });

  return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 10);
}

function PasswordRequirement({
  meets,
  label,
}: {
  meets: boolean;
  label: string;
}) {
  return (
    <Text
      component="div"
      c={meets ? "teal" : "red"}
      style={{ display: "flex", alignItems: "center" }}
      mt={7}
      size="sm"
    >
      {meets ? <IconCheck size={14} /> : <IconX size={14} />}
      <Box ml={10}>{label}</Box>
    </Text>
  );
}

export default function PasswordStrengthInput(props: PasswordInputProps) {
  const [popoverOpened, setPopoverOpened] = useState(false);

  const password = (props.value as string) || "";

  const checks = requirements.map((requirement, index) => (
    <PasswordRequirement
      key={index}
      label={requirement.label}
      meets={requirement.re.test(password)}
    />
  ));

  const strength = getStrength(password);
  const color = strength === 100 ? "teal" : strength > 50 ? "yellow" : "red";

  return (
    <Popover
      opened={popoverOpened}
      position="bottom"
      width="target"
      transitionProps={{ transition: "pop" }}
    >
      <Popover.Target>
        <PasswordInput
          {...props}
          onFocus={(e) => {
            setPopoverOpened(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setPopoverOpened(false);
            props.onBlur?.(e);
          }}
        />
      </Popover.Target>

      <Popover.Dropdown>
        <Stack gap="xs">
          <Progress color={color} value={strength} size={5} mb="xs" />

          <PasswordRequirement
            label="Includes at least 12 characters"
            meets={password.length > 11}
          />
          {checks}
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}
