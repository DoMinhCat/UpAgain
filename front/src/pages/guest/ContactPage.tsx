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

export default function ContactPage() {
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
      "First name is required",
      setErrorFirstName,
    );
    const lastNameValid = validateInput(
      lastName,
      "Last name is required",
      setErrorLastName,
    );
    const emailValid = validateInput(email, "Email is required", setErrorEmail);
    const subjectValid = validateInput(
      subject,
      "Subject is required",
      setErrorSubject,
    );
    const messageValid = validateInput(
      message,
      "Message is required",
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
        "Message sent",
        "Thank you for your message. We will get back to you as soon as possible.",
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
          Get In Touch
        </Badge>
        <Title
          order={1}
          ta="center"
          c={isDark ? "var(--upagain-yellow)" : "var(--upagain-dark-green)"}
        >
          We'd love to hear from you
        </Title>
        <Text c="dimmed" ta="center" maw={600} size="lg">
          Whether you have a question about dropping off items, running a
          workshop, or just want to say hello, our team is ready to answer all
          your questions.
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
                    Email
                  </Text>
                  <Text c="dimmed" size="sm">
                    Our friendly team is here to help.
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
                    Office
                  </Text>
                  <Text c="dimmed" size="sm">
                    Come say hello at our headquarters.
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
                    21 Erard street, 75012 Paris
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
                    Phone
                  </Text>
                  <Text c="dimmed" size="sm">
                    Mon-Fri from 9am to 6pm.
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
              Send us a message
            </Title>
            <form onSubmit={handleSubmit}>
              <Grid gap="md">
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="First Name"
                    placeholder="John"
                    required
                    error={errorFirstName}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    size="md"
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Last Name"
                    placeholder="Doe"
                    required
                    error={errorLastName}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    onBlur={() =>
                      validateInput(
                        lastName,
                        "Last name is required",
                        setErrorLastName,
                      )
                    }
                    size="md"
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <TextInput
                    type="email"
                    label="Email"
                    placeholder="johndoe@example.com"
                    error={errorEmail}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() =>
                      validateInput(email, "Email is required", setErrorEmail)
                    }
                    required
                    size="md"
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <TextInput
                    label="Subject"
                    placeholder="How can we help you?"
                    required
                    error={errorSubject}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    onBlur={() =>
                      validateInput(
                        subject,
                        "Subject is required",
                        setErrorSubject,
                      )
                    }
                    size="md"
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <Textarea
                    label="Message"
                    placeholder="Leave us a detailed message..."
                    minRows={5}
                    required
                    error={errorMessage}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onBlur={() =>
                      validateInput(
                        message,
                        "Message is required",
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
                    Send Message
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
