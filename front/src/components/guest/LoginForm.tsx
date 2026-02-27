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
} from "@mantine/core";
import { PATHS } from "../../routes/paths";
import { useState } from "react";
import { LoginRequest } from "../../api/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { showErrorNotification } from "../NotificationToast";

export function LoginForm() {

  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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

  const validatePassword = (val: string) => {
    if (!val) {
      setPasswordError("Password is required");
      return false;
    }
    setPasswordError(null);
    return true;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevents page reload

    if (!validateEmail(email)) return;
    setIsLoading(true);
    try {
      // Call axios
      const data = await LoginRequest({ email, password });
      const user = login(data.token);

      // redirect
      if (user.role === "admin") {
        navigate(PATHS.ADMIN.HOME);
      } else {
        navigate(PATHS.HOME);
      }
    } catch (error: any) {
      showErrorNotification("Login Failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container size={520} my={40}>
      <Title ta="center">Welcome back!</Title>

      <Text mt="sm" ta={"center"}>
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
        <form onSubmit={handleSubmit}>
          <TextInput
            label="Email"
            placeholder="example@gmail.com"
            radius="md"
            error={emailError}
            mb="md"
            onChange={(event) => { const email = event.currentTarget.value; setEmail(email); validateEmail(email); }}
            onBlur={() => validateEmail(email)}
            disabled={isLoading}
            required
          />
          <PasswordInput
            label="Password"
            placeholder="Your secret"
            onChange={(event) => { const password = event.currentTarget.value; setPassword(password); validatePassword(password); }}
            onBlur={() => validatePassword(password)}
            disabled={isLoading}
            error={passwordError}
            required
          />

          <Group justify="center" mt="lg">
            <Anchor size="sm" href={PATHS.GUEST.FORGOT}>
              Forgot password?
            </Anchor>
          </Group>
          <Button
            fullWidth
            mt="xl"
            variant="primary"
            type="submit"
            disabled={isLoading}
            loading={isLoading}
          >
            Sign in
          </Button>
        </form>
      </Paper>
    </Container>
  );

}
