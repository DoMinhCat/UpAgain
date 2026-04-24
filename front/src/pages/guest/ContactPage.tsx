import {
  Container,
  Title,
  Text,
  Grid,
  Paper,
  TextInput,
  Textarea,
  Button,
  Group,
  Stack,
  ThemeIcon,
  Badge,
} from "@mantine/core";
import { IconMail, IconPhone, IconMapPin, IconSend } from "@tabler/icons-react";
import { useComputedColorScheme } from "@mantine/core";
import { useState } from "react";
import { showSuccessNotification } from "../../components/common/NotificationToast";
import { useTranslation } from "react-i18next";

export default function ContactPage() {
  const { t } = useTranslation("contact");
  const scheme = useComputedColorScheme("light");
  const isDark = scheme !== "light";

  const [errorFirstName, setErrorFirstName] = useState("");
  const [errorLastName, setErrorLastName] = useState("");
  const [errorEmail, setErrorEmail] = useState("");
  const [errorSubject, setErrorSubject] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const validateInput = (
    value: string,
    error: string,
    setError: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    if (value.trim().length <= 0) {
      setError(error);
      return false;
    } else {
      setError("");
    }
    return true;
  };

  const validateForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const firstNameValid = validateInput(
      firstName,
      t("form.first_name.error"),
      setErrorFirstName,
    );
    const lastNameValid = validateInput(
      lastName,
      t("form.last_name.error"),
      setErrorLastName,
    );
    const emailValid = validateInput(email, t("form.email.error"), setErrorEmail);
    const subjectValid = validateInput(
      subject,
      t("form.subject.error"),
      setErrorSubject,
    );
    const messageValid = validateInput(
      message,
      t("form.message.error"),
      setErrorMessage,
    );
    return (
      firstNameValid &&
      lastNameValid &&
      emailValid &&
      subjectValid &&
      messageValid
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm(e)) {
      showSuccessNotification(
        t("form.success.title"),
        t("form.success.message"),
      );
      setFirstName("");
      setLastName("");
      setEmail("");
      setSubject("");
      setMessage("");
    }
  };
  return (
    <Container size="xl" py={60}>
      <Stack align="center" mb={50}>
        <Badge variant="light" color="var(--upagain-neutral-green)" size="lg">
          {t("header.badge")}
        </Badge>
        <Title
          order={1}
          ta="center"
          c={isDark ? "var(--upagain-yellow)" : "var(--upagain-dark-green)"}
        >
          {t("header.title")}
        </Title>
        <Text c="dimmed" ta="center" maw={600} size="lg">
          {t("header.description")}
        </Text>
      </Stack>

      <Grid gap={50}>
        {/* Contact Information */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="xl">
            <Paper
              radius="md"
              p="xl"
              withBorder
              shadow="sm"
              variant={isDark ? "primary" : ""}
            >
              <Group wrap="nowrap" align="flex-start">
                <ThemeIcon
                  size={46}
                  radius="md"
                  color="var(--upagain-neutral-green)"
                  variant="light"
                >
                  <IconMail size={24} />
                </ThemeIcon>
                <div>
                  <Text fw={700} size="lg" mb={5}>
                    {t("info.email.title")}
                  </Text>
                  <Text c="dimmed" size="sm">
                    {t("info.email.description")}
                  </Text>
                  <Text
                    fw={600}
                    mt={5}
                    c={
                      isDark
                        ? "var(--upagain-yellow)"
                        : "var(--upagain-dark-green)"
                    }
                  >
                    support@upagain.com
                  </Text>
                </div>
              </Group>
            </Paper>

            <Paper
              radius="md"
              p="xl"
              withBorder
              shadow="sm"
              variant={isDark ? "primary" : ""}
            >
              <Group wrap="nowrap" align="flex-start">
                <ThemeIcon
                  size={46}
                  radius="md"
                  color="var(--upagain-neutral-green)"
                  variant="light"
                >
                  <IconMapPin size={24} />
                </ThemeIcon>
                <div>
                  <Text fw={700} size="lg" mb={5}>
                    {t("info.office.title")}
                  </Text>
                  <Text c="dimmed" size="sm">
                    {t("info.office.description")}
                  </Text>
                  <Text
                    fw={600}
                    mt={5}
                    c={
                      isDark
                        ? "var(--upagain-yellow)"
                        : "var(--upagain-dark-green)"
                    }
                  >
                    {t("common:footer.address")}
                  </Text>
                </div>
              </Group>
            </Paper>

            <Paper
              radius="md"
              p="xl"
              withBorder
              shadow="sm"
              variant={isDark ? "primary" : ""}
            >
              <Group wrap="nowrap" align="flex-start">
                <ThemeIcon
                  size={46}
                  radius="md"
                  color="var(--upagain-neutral-green)"
                  variant="light"
                >
                  <IconPhone size={24} />
                </ThemeIcon>
                <div>
                  <Text fw={700} size="lg" mb={5}>
                    {t("info.phone.title")}
                  </Text>
                  <Text c="dimmed" size="sm">
                    {t("info.phone.description")}
                  </Text>
                  <Text
                    fw={600}
                    mt={5}
                    c={
                      isDark
                        ? "var(--upagain-yellow)"
                        : "var(--upagain-dark-green)"
                    }
                  >
                    +33 1 23 45 67 89
                  </Text>
                </div>
              </Group>
            </Paper>
          </Stack>
        </Grid.Col>

        {/* Contact Form */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper
            p={40}
            radius="md"
            withBorder
            shadow="sm"
            variant={isDark ? "primary" : ""}
          >
            <Title order={3} mb="xl">
              {t("form.title")}
            </Title>
            <form onSubmit={handleSubmit}>
              <Grid gap="md">
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label={t("form.first_name.label")}
                    placeholder={t("form.first_name.placeholder")}
                    required
                    error={errorFirstName}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    size="md"
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label={t("form.last_name.label")}
                    placeholder={t("form.last_name.placeholder")}
                    required
                    error={errorLastName}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    onBlur={() =>
                      validateInput(
                        lastName,
                        t("form.last_name.error"),
                        setErrorLastName,
                      )
                    }
                    size="md"
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <TextInput
                    type="email"
                    label={t("form.email.label")}
                    placeholder={t("form.email.placeholder")}
                    error={errorEmail}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() =>
                      validateInput(email, t("form.email.error"), setErrorEmail)
                    }
                    required
                    size="md"
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <TextInput
                    label={t("form.subject.label")}
                    placeholder={t("form.subject.placeholder")}
                    required
                    error={errorSubject}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    onBlur={() =>
                      validateInput(
                        subject,
                        t("form.subject.error"),
                        setErrorSubject,
                      )
                    }
                    size="md"
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <Textarea
                    label={t("form.message.label")}
                    placeholder={t("form.message.placeholder")}
                    minRows={5}
                    required
                    error={errorMessage}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onBlur={() =>
                      validateInput(
                        message,
                        t("form.message.error"),
                        setErrorMessage,
                      )
                    }
                    size="md"
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <Button
                    variant="primary"
                    size="lg"
                    mt="md"
                    type="submit"
                    rightSection={<IconSend size={18} />}
                  >
                    {t("form.submit")}
                  </Button>
                </Grid.Col>
              </Grid>
            </form>
          </Paper>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
