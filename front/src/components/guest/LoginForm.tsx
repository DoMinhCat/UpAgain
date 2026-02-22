import {
  Anchor,
  Button,
  Container,
  Group,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
  Box,
  Progress,
  Popover,
} from "@mantine/core";
import { IconX, IconCheck } from "@tabler/icons-react";
import { PATHS } from "../../routes/paths";
import { useState } from "react";
import { LoginRequest } from "../../api/auth";

// const requirements = [
//   { re: /[0-9]/, label: "Includes number" },
//   { re: /[A-Z]/, label: "Includes uppercase letter" },
//   { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: "Includes special character" },
// ];

// function getStrength(password: string) {
//   let multiplier = password.length > 11 ? 0 : 1;

//   requirements.forEach((requirement) => {
//     if (!requirement.re.test(password)) {
//       multiplier += 1;
//     }
//   });

//   return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 10);
// }

// function PasswordRequirement({
//   meets,
//   label,
// }: {
//   meets: boolean;
//   label: string;
// }) {
//   return (
//     <Text
//       c={meets ? "teal" : "red"}
//       style={{ display: "flex", alignItems: "center" }}
//       mt={7}
//       size="sm"
//     >
//       {meets ? <IconCheck size={14} /> : <IconX size={14} />}
//       <Box ml={10}>{label}</Box>
//     </Text>
//   );
// }

export function LoginForm() {
  // const [popoverOpened, setPopoverOpened] = useState(false);
  // const [value, setValue] = useState("");
  // const checks = requirements.map((requirement, index) => (
  //   <PasswordRequirement
  //     key={index}
  //     label={requirement.label}
  //     meets={requirement.re.test(value)}
  //   />
  // ));

  // const strength = getStrength(value);
  // const color = strength === 100 ? "teal" : strength > 50 ? "yellow" : "red";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const validateEmail = (val: string) => {
    const regex = /^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,4}$/;
    if (!val) {
      setEmailError("Email is required");
      return false;
    } else if (!regex.test(val)) {
      setEmailError("Invalid email format");
      return false;
    }
    setEmailError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevents page reload

    const isEmailValid = validateEmail(email);
    if (isEmailValid) {
      console.log("Sending to backend:", { email, password });
      // Call axios
      try {
        const JWT = await LoginRequest({ email, password });
        console.log("Login success with token:", JWT);
      } catch (error: any) {
        console.error("Login failed:", error.response?.data || error.message);
      }
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center">Welcome back!</Title>

      <Text mt="sm">
        Do not have an account yet?{" "}
        <Anchor href={PATHS.GUEST.REGISTER}>Create account</Anchor>
      </Text>

      <Paper
        withBorder
        shadow="sm"
        p={22}
        mt={30}
        radius="md"
        variant="primary"
      >
        {/* Password sign up*/}
        {/* <Popover
          opened={popoverOpened}
          position="bottom"
          width="target"
          transitionProps={{ transition: "pop" }}
        >
          <Popover.Target>
            <div
              onFocusCapture={() => setPopoverOpened(true)}
              onBlurCapture={() => setPopoverOpened(false)}
            >
              <PasswordInput
                withAsterisk
                label="Your password"
                placeholder="Your super secret"
                value={value}
                onChange={(event) => setValue(event.currentTarget.value)}
              />
            </div>
          </Popover.Target>
          <Popover.Dropdown>
            <Progress color={color} value={strength} size={5} mb="xs" />
            <PasswordRequirement
              label="Includes at least 12 characters"
              meets={value.length > 11}
            />
            {checks}
          </Popover.Dropdown>
        </Popover> */}
        <form onSubmit={handleSubmit}>
          <TextInput
            label="Email"
            placeholder="example@gmail.com"
            radius="md"
            error={emailError}
            mb="md"
            onChange={(event) => setEmail(event.currentTarget.value)}
            onBlur={() => validateEmail(email)}
            required
          />
          <PasswordInput
            label="Password"
            placeholder="Your secret"
            onChange={(event) => setPassword(event.currentTarget.value)}
            required
          />

          <Group justify="center" mt="lg">
            <Anchor size="sm" href={PATHS.GUEST.FORGOT}>
              Forgot password?
            </Anchor>
          </Group>
          <Button fullWidth mt="xl" variant="primary" type="submit">
            Sign in
          </Button>
        </form>
      </Paper>
    </Container>
  );
}
