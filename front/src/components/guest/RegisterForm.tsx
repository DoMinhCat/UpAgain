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
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { IconLock } from "@tabler/icons-react";
import { PATHS } from "../../routes/paths";
import { useState } from "react";
import PasswordStrengthInput, {
  requirements,
} from "../input/PasswordStrengthInput";
import { useRegister } from "../../hooks/authHooks";
import { useNavigate } from "react-router-dom";

export default function RegisterForm() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  // password
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const validatePassword = (val: string) => {
    if (!val) {
      setPasswordError(t("register.errors.password_required"));
      return false;
    }
    if (val.length < 12) {
      setPasswordError(t("register.errors.password_min"));
      return false;
    }
    if (val.length > 60) {
      setPasswordError(t("register.errors.password_max"));
      return false;
    }
    if (!requirements.every((requirement) => requirement.re.test(val))) {
      setPasswordError(t("register.errors.password_complexity"));
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
      setConfirmPasswordError(t("register.errors.confirm_required"));
      return false;
    } else if (val !== password) {
      setConfirmPasswordError(t("register.errors.confirm_mismatch"));
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
      setEmailError(t("login.errors.email_required"));
      return false;
    } else if (!regex.test(val)) {
      setEmailError(t("login.errors.email_invalid"));
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
      setUsernameError(t("register.errors.username_required"));
      return false;
    }
    if (val.length < 4) {
      setUsernameError(t("register.errors.username_min"));
      return false;
    }
    if (val.length > 20) {
      setUsernameError(t("register.errors.username_max"));
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
      setPhoneError(t("register.errors.phone_required"));
      return false;
    }
    if (!val.match(/^[0-9]+$/)) {
      setPhoneError(t("register.errors.phone_numbers_only"));
      return false;
    }
    if (val.length < 10) {
      setPhoneError(t("register.errors.phone_min"));
      return false;
    }
    if (val.length > 15) {
      setPhoneError(t("register.errors.phone_max"));
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
      <Title ta="center">{t("register.title")}</Title>

      <Text mt="sm" ta={"center"}>
        {t("register.already_account")}{" "}
        <Anchor href={PATHS.GUEST.LOGIN}>{t("login.submit")}</Anchor>
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
          <Fieldset legend={t("register.credentials_legend")} variant="unstyled">
            <TextInput
              variant="body-color"
              label={t("login.email_label")}
              placeholder={t("login.email_placeholder")}
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
              label={t("login.password_label")}
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
              label={t("register.confirm_password_label")}
              variant="body-color"
              leftSection={<IconLock size={14} />}
              placeholder={t("register.confirm_password_placeholder")}
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
          <Divider my="md" color="gray.5" />

          <Fieldset legend={t("register.personal_legend")} variant="unstyled">
            <TextInput
              label={t("register.username_label")}
              variant="body-color"
              placeholder={t("register.username_placeholder")}
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
              label={t("register.phone_label")}
              variant="body-color"
              placeholder={t("register.phone_placeholder")}
              withAsterisk
              radius="md"
              mb="md"
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
          <Checkbox
            mt="md"
            defaultChecked
            label={t("register.privacy_agreement")}
            color="teal"
            required
          />
          <Button
            fullWidth
            mt="xl"
            variant="primary"
            type="submit"
            disabled={registerMutation.isPending}
            loading={registerMutation.isPending}
          >
            {t("register.submit")}
          </Button>
        </form>
        <Text c="dimmed" size="sm" ta="center" mt="md">
          {t("register.is_pro")}{" "}
          <Anchor
            onClick={() =>
              navigate(PATHS.GUEST.REGISTER, { state: { role: "pro" } })
            }
          >
            {t("register.register_here")}
          </Anchor>
        </Text>
      </Paper>
    </Container>
  );
}
