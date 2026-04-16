import {
  Container,
  Paper,
  Title,
  Anchor,
  Text,
  TextInput,
  PasswordInput,
  Checkbox,
  Fieldset,
  Button,
  Divider,
  Group,
  Modal,
} from "@mantine/core";
import { IconLock } from "@tabler/icons-react";
import { PATHS } from "../../routes/paths";
import { useState } from "react";
import PasswordStrengthInput, {
  requirements,
} from "../common/input/PasswordStrengthInput";
import { useRegister } from "../../hooks/authHooks";
import { useNavigate } from "react-router-dom";
import { useDisclosure } from "@mantine/hooks";

export default function RegisterFormPro() {
  const navigate = useNavigate();

  // SUB MODALS
  const [openedFreemium, { open: openFreemium, close: closeFreemium }] =
    useDisclosure(false);
  const [openedPremium, { open: openPremium, close: closePremium }] =
    useDisclosure(false);

  // password
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const validatePassword = (val: string) => {
    if (!val) {
      setPasswordError("Password is required");
      return false;
    }
    if (val.length < 12) {
      setPasswordError("Password must be at least 12 characters long");
      return false;
    }
    if (val.length > 60) {
      setPasswordError("Password must be at most 60 characters long");
      return false;
    }
    if (!requirements.every((requirement) => requirement.re.test(val))) {
      setPasswordError(
        "Password must contain at least one number, one uppercase letter, and one special character",
      );
      return false;
    }
    setPasswordError(null);
    return true;
  };

  // confirm password
  const [ConfirmPassword, setConfirmPassword] = useState("");
  const [ConfirmPasswordError, setConfirmPasswordError] = useState<
    string | null
  >(null);
  const validateConfirmPassword = (val: string) => {
    if (!val) {
      setConfirmPasswordError("You must confirm your password");
      return false;
    } else if (val !== password) {
      setConfirmPasswordError("Passwords do not match");
      return false;
    }
    setConfirmPasswordError(null);
    return true;
  };

  // email
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);

  const registerMutation = useRegister();

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

  // username
  const [Username, setUsername] = useState("");
  const [UsernameError, setUsernameError] = useState<string | null>(null);
  const validateUsername = (val: string) => {
    if (!val) {
      setUsernameError("Username is required");
      return false;
    }
    if (val.length < 4) {
      setUsernameError("Username must be at least 4 characters long");
      return false;
    }
    if (val.length > 20) {
      setUsernameError("Username must be at most 20 characters long");
      return false;
    }
    setUsernameError(null);
    return true;
  };

  // phone
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const validatePhone = (val: string) => {
    if (!val) {
      setPhoneError("Phone number is required");
      return false;
    }
    if (!val.match(/^[0-9]+$/)) {
      setPhoneError("Phone number must contain only numbers");
      return false;
    }
    if (val.length < 10) {
      setPhoneError("Phone number must be at least 10 characters long");
      return false;
    }
    if (val.length > 15) {
      setPhoneError("Phone number must be at most 15 characters long");
      return false;
    }
    setPhoneError(null);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevents page reload

    if (
      !validateEmail(email) ||
      !validatePassword(password) ||
      !validateConfirmPassword(ConfirmPassword) ||
      !validateUsername(Username) ||
      !validatePhone(phone)
    )
      return;

    registerMutation.mutate({
      email,
      password,
      username: Username,
      phone,
      role: "user",
    });
  };

  return (
    <Container size={520} my={40}>
      <Title ta="center">Let's grow your impact!</Title>

      <Text mt="sm" ta={"center"}>
        Already have an account?{" "}
        <Anchor href={PATHS.GUEST.LOGIN}>Sign in</Anchor>
      </Text>

      <Paper
        withBorder
        shadow="sm"
        p={22}
        mt={30}
        radius="md"
        variant="primary"
      >
        <form onSubmit={handleSubmit}>
          <Fieldset legend="Credentials" variant="unstyled">
            <TextInput
              variant="body-color"
              label="Email"
              placeholder="example@gmail.com"
              radius="md"
              error={emailError}
              mb="md"
              value={email}
              onChange={(event) => {
                const value = event.currentTarget.value;
                setEmail(value);
                validateEmail(value);
              }}
              disabled={registerMutation.isPending}
              required
            />

            <PasswordStrengthInput
              variant="body-color"
              withAsterisk
              label="Password"
              placeholder="Your super secret"
              value={password}
              disabled={registerMutation.isPending}
              leftSection={<IconLock size={14} />}
              onChange={(event) => {
                const value = event.currentTarget.value;
                setPassword(value);
                validatePassword(value);
              }}
              error={passwordError}
              required
            />

            <PasswordInput
              label="Confirm Password"
              variant="body-color"
              leftSection={<IconLock size={14} />}
              placeholder="Confirm your password"
              value={ConfirmPassword}
              mt="md"
              onChange={(event) => {
                const value = event.currentTarget.value;
                setConfirmPassword(value);
                validateConfirmPassword(value);
              }}
              disabled={registerMutation.isPending}
              error={ConfirmPasswordError}
              required
            />
          </Fieldset>
          <Divider my="xl" color="var(--border-color)" />

          <Fieldset legend="Personal information" variant="unstyled">
            <TextInput
              label="Username"
              variant="body-color"
              placeholder="John Doe"
              radius="md"
              mb="md"
              error={UsernameError}
              value={Username}
              onChange={(event) => {
                const value = event.currentTarget.value;
                setUsername(value);
                validateUsername(value);
              }}
              disabled={registerMutation.isPending}
              required
            />
            <TextInput
              label="Phone number"
              variant="body-color"
              placeholder="06 12 34 56 78"
              radius="md"
              error={phoneError}
              value={phone}
              onChange={(event) => {
                const value = event.currentTarget.value;
                setPhone(value);
                validatePhone(value);
              }}
              disabled={registerMutation.isPending}
            />
          </Fieldset>
          <Divider my="xl" color="var(--border-color)" />

          <Fieldset legend="Subscription" variant="unstyled">
            <Group justify="center">
              <Button
                variant="secondary"
                ta="center"
                onClick={openFreemium}
                disabled={registerMutation.isPending}
              >
                Freemium
              </Button>
              <Button
                variant="cta"
                ta="center"
                onClick={openPremium}
                disabled={registerMutation.isPending}
              >
                Premium
              </Button>
            </Group>
          </Fieldset>
          <Checkbox
            mt="lg"
            defaultChecked
            label="I agree to sell my privacy to UpAgain"
            color="teal"
            required
          />
          <Button
            fullWidth
            mt="xl"
            variant="primary"
            type="submit"
            loading={registerMutation.isPending}
          >
            Register
          </Button>
        </form>
        <Text c="dimmed" size="sm" ta="center" mt="md">
          Not a professional?{" "}
          <Anchor onClick={() => navigate(PATHS.GUEST.REGISTER)}>
            Register here
          </Anchor>
        </Text>
      </Paper>

      <Modal
        opened={openedFreemium}
        onClose={closeFreemium}
        title="Create container"
        size="lg"
        centered
      >
        <div>Hi</div>
      </Modal>

      <Modal
        opened={openedPremium}
        onClose={closePremium}
        title="Create container"
        size="lg"
        centered
      >
        <div>Hi</div>
      </Modal>
    </Container>
  );
}
