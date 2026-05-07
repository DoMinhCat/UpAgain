import {
  Button,
  Divider,
  Group,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import {
  useAccountDetails,
  useUpdateAccount,
  useUpdatePassword,
} from "../../../hooks/accountHooks";
import { useAuth } from "../../../context/AuthContext";
import FullScreenLoader from "../../../components/common/FullScreenLoader";
import { IconLock, IconMail, IconShield } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import {
  validateConfirmPassword,
  validateEmail,
  validatePassword,
} from "../../../utils/accountValidation";
import { useTranslation } from "react-i18next";

export default function SecurityTab() {
  const { user } = useAuth();
  const { t } = useTranslation("profile");
  const { data: accountDetails, isLoading: isLoadingAccountDetails } =
    useAccountDetails(user?.id || 0);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");

  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | null
  >(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  // UPDATE HOOKS
  const updatePasswordMutation = useUpdatePassword();
  const updateAccountMutation = useUpdateAccount();

  useEffect(() => {
    if (accountDetails?.email) {
      setEmail(accountDetails.email);
    }
  }, [accountDetails]);

  const handleUpdateEmail = () => {
    const error = validateEmail(email, t);
    setEmailError(error);
    if (error) return;

    if (!accountDetails) return;

    updateAccountMutation.mutate({
      id: accountDetails.id,
      username: accountDetails.username,
      email: email,
      phone: accountDetails.phone,
    });
  };

  const handleUpdatePassword = () => {
    const pError = validatePassword(password, t);
    const cpError = validateConfirmPassword(confirmPassword, password, t);

    setPasswordError(pError);
    setConfirmPasswordError(cpError);

    if (pError || cpError) return;

    if (!user) return;

    updatePasswordMutation.mutate(
      {
        id: user.id,
        newPassword: password,
      },
      {
        onSuccess: () => {
          setPassword("");
          setConfirmPassword("");
        },
      },
    );
  };

  if (isLoadingAccountDetails || !accountDetails) return <FullScreenLoader />;

  return (
    <Stack gap={40}>
      <Stack gap={5}>
        <Title order={1} size={42} fw={800}>
          {t("security.title")}
        </Title>
        <Text c="dimmed" size="lg">
          {t("security.subtitle")}
        </Text>
      </Stack>

      <Paper variant="primary" p={30} radius="lg">
        <Stack gap="xl">
          <Group gap="sm">
            <IconShield size={24} color="var(--upagain-neutral-green)" />
            <Title order={3} size={22}>
              {t("security.sensitive_info")}
            </Title>
          </Group>

          <Divider />

          {/* EMAIL SECTION */}
          <Stack gap="md">
            <Group gap="sm">
              <IconMail size={20} style={{ opacity: 0.7 }} />
              <Text fw={600} size="lg">
                {t("security.email_address")}
              </Text>
            </Group>
            <Text size="sm" c="dimmed">
              {t("security.email_description")}
            </Text>
            <Group align="flex-start" grow wrap="nowrap">
              <TextInput
                placeholder="your@email.com"
                value={email}
                size="md"
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError(null);
                }}
                error={emailError}
                style={{ flex: 1 }}
              />
              <Button
                variant="primary"
                size="md"
                onClick={handleUpdateEmail}
                loading={updateAccountMutation.isPending}
                disabled={email === accountDetails.email}
                style={{ flex: 0, minWidth: 150 }}
              >
                {t("common:actions.update")}
              </Button>
            </Group>
          </Stack>

          <Divider />

          {/* PASSWORD SECTION */}
          <Stack gap="md">
            <Group gap="sm">
              <IconLock size={20} style={{ opacity: 0.7 }} />
              <Text fw={600} size="lg">
                {t("security.change_password")}
              </Text>
            </Group>
            <Text size="sm" c="dimmed">
              {t("security.password_description")}
            </Text>

            <Stack gap="md" style={{ maxWidth: 500 }}>
              <PasswordInput
                label={t("security.new_password")}
                placeholder="********"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError(null);
                }}
                error={passwordError}
              />
              <PasswordInput
                label={t("security.confirm_password")}
                placeholder="********"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setConfirmPasswordError(null);
                }}
                error={confirmPasswordError}
              />
              <Group>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleUpdatePassword}
                  loading={updatePasswordMutation.isPending}
                  disabled={!password || !confirmPassword}
                >
                  {t("security.update_password")}
                </Button>
              </Group>
            </Stack>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}
