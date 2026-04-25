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
import { useTranslation } from "react-i18next";
import { IconLock } from "@tabler/icons-react";
import { PATHS } from "../../routes/paths";
import { useState } from "react";
import PasswordStrengthInput, {
  requirements,
} from "../input/PasswordStrengthInput";
import { useRegister } from "../../hooks/authHooks";
import { useNavigate } from "react-router-dom";
import { useDisclosure } from "@mantine/hooks";
import { PremiumCard } from "./PremiumCard";
import { FreemiumCard } from "./FreemiumCard";
import { useGetFinanceSettingByKey } from "../../hooks/financeHooks";
import { showErrorNotification } from "../common/NotificationToast";

export default function RegisterFormPro() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();

  // SUB MODAL
  const [openedPremium, { open: openPremium, close: closePremium }] =
    useDisclosure(false);
  const [selectedPlan, setSelectedPlan] = useState<
    "freemium" | "premium" | "trial" | null
  >(null);

  const { data: trialDays } = useGetFinanceSettingByKey("trial_days");

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
    if (selectedPlan == null) {
      showErrorNotification(t("register.errors.failed"), t("register.errors.plan_required"));
      return;
    }

    registerMutation.mutate({
      email,
      password,
      username: Username,
      phone,
      role: "pro",
      is_trial: selectedPlan === "trial",
      is_premium: selectedPlan === "premium" || selectedPlan === "trial",
    });
  };

  return (
    <Container size={520} my={40}>
      <Title ta="center">{t("register.pro_title")}</Title>

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
              placeholder={t("login.password_placeholder")}
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
          <Divider my="xl" color="var(--border-color)" />

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

          <Fieldset legend={t("register.subscription_legend")} variant="unstyled">
            <Group justify="center">
              <Button
                variant={
                  !selectedPlan ||
                  selectedPlan === "premium" ||
                  selectedPlan === "trial"
                    ? "cta"
                    : "secondary"
                }
                ta="center"
                onClick={openPremium}
                disabled={registerMutation.isPending}
              >
                {selectedPlan === "freemium"
                  ? t("register.pro.plan_freemium")
                  : selectedPlan === "premium"
                    ? t("register.pro.plan_premium")
                    : selectedPlan === "trial"
                      ? t("register.pro.plan_trial", { count: trialDays })
                      : t("register.pro.see_subscriptions")}
              </Button>
            </Group>
          </Fieldset>
          <Checkbox
            mt="lg"
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
            loading={registerMutation.isPending}
          >
            {t("register.submit")}
          </Button>
        </form>
        <Text c="dimmed" size="sm" ta="center" mt="md">
          {t("register.not_pro")}{" "}
          <Anchor onClick={() => navigate(PATHS.GUEST.REGISTER)}>
            {t("register.register_here")}
          </Anchor>
        </Text>
      </Paper>

      <Modal
        opened={openedPremium}
        onClose={closePremium}
        size="xl"
        fullScreen
        centered
      >
        <Title ta="center" mb="xl">
          {t("register.pro.choose_plan")}
        </Title>
        <Group justify="center" mt="md" gap="xl">
          <FreemiumCard
            selected={selectedPlan === "freemium"}
            onClick={() => setSelectedPlan("freemium")}
          />
          <PremiumCard
            selected={selectedPlan === "premium" || selectedPlan === "trial"}
            onClick={() => setSelectedPlan("premium")}
            onTrialClick={() => setSelectedPlan("trial")}
            selectedTrial={selectedPlan === "trial"}
          />
        </Group>
        <Group justify="center" mt="xl">
          <Button
            size="lg"
            variant="grey"
            ta="center"
            onClick={closePremium}
            disabled={registerMutation.isPending}
          >
            {t("register.pro.close")}
          </Button>
          <Button
            size="lg"
            variant="primary"
            ta="center"
            onClick={closePremium}
            disabled={!selectedPlan || registerMutation.isPending}
          >
            {t("register.pro.confirm")}
          </Button>
        </Group>
      </Modal>
    </Container>
  );
}
