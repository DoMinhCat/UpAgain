import {
  Container,
  Title,
  Text,
  Stack,
  Group,
  Avatar,
  Button,
  TextInput,
  Paper,
  Anchor,
} from "@mantine/core";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../routes/paths";
import { useAccountDetails } from "../../hooks/accountHooks";
import FullScreenLoader from "../../components/common/FullScreenLoader";
import { useState, useEffect } from "react";
import {
  IconLeaf,
  IconCalendar,
  IconUser,
  IconTrophy,
} from "@tabler/icons-react";
import ImageDropzone from "../../components/input/ImageDropzone";

export default function UserProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: accountDetails, isLoading: isLoadingAccountDetails } =
    useAccountDetails(user?.id || 0);

  // Form State
  const [formData, setFormData] = useState({
    username: "",
    phone: "",
  });
  const [files, setFiles] = useState<any[]>([]);

  // Sync state with backend data when loaded
  useEffect(() => {
    if (accountDetails) {
      setFormData({
        username: accountDetails.username || "",
        phone: accountDetails.phone || "",
      });
      // If there is an existing avatar, we could potentially seed it into 'files'
      // but usually Dropzone is for *new* uploads. We'll show the current avatar next to it.
    }
  }, [accountDetails]);

  if (isLoadingAccountDetails) {
    return <FullScreenLoader />;
  }

  const handleDiscard = () => {
    if (accountDetails) {
      setFormData({
        username: accountDetails.username || "",
        phone: accountDetails.phone || "",
      });
      setFiles([]);
    }
  };

  const handleSave = () => {
    // BACKEND INTEGRATION: call update hook (multipart if avatar changed)
    console.log("Saving changes:", { ...formData, avatar: files[0] });
  };

  return (
    <Container size="md" py={60}>
      <Stack gap={40}>
        {/* PAGE HEADER */}
        <Stack gap={5}>
          <Title order={1} size={42} fw={800}>
            Account Settings
          </Title>
          <Text c="dimmed" size="lg">
            Manage your personal credentials, avatar, and environmental
            statistics.
          </Text>
        </Stack>

        {/* AVATAR SECTION */}
        <Paper variant="primary" p={30} radius="lg">
          <Stack gap="xl">
            <Group gap="sm">
              <IconUser size={20} color="var(--upagain-neutral-green)" />
              <Title order={3} size={22}>
                Update Avatar
              </Title>
            </Group>

            <Group gap={40} align="flex-start" wrap="nowrap">
              <Stack align="center" gap="xs">
                <Text size="xs" fw={700} c="dimmed">
                  CURRENT
                </Text>
                <Avatar
                  src={accountDetails?.avatar || undefined}
                  size={120}
                  radius="lg"
                  style={{ boxShadow: "var(--mantine-shadow-md)" }}
                >
                  {accountDetails?.username?.charAt(0).toUpperCase() || "U"}
                </Avatar>
              </Stack>

              <Stack style={{ flex: 1 }} gap="xs">
                <Text size="xs" fw={700} c="dimmed">
                  Update avatar
                </Text>
                <ImageDropzone
                  files={files}
                  setFiles={setFiles}
                  props={{ maxFiles: 1, onDrop: (files) => setFiles(files) }}
                />
              </Stack>
            </Group>
          </Stack>
        </Paper>

        {/* PERSONAL DETAILS SECTION */}
        <Paper variant="primary" p={30} radius="lg">
          <Stack gap="xl">
            <Group gap="sm">
              <IconCalendar size={20} color="var(--upagain-neutral-green)" />
              <Title order={3} size={22}>
                Personal Details
              </Title>
            </Group>

            <TextInput
              label="USERNAME"
              placeholder="@jthorne"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              variant="filled"
              size="md"
            />

            <TextInput
              label="PHONE NUMBER"
              placeholder="+33 X XX XX XX XX"
              value={formData.phone || ""}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              variant="filled"
              size="md"
              description={!formData.phone ? "N/A" : null}
            />

            <Stack gap={5}>
              <Text fw={700} size="sm">
                EMAIL ADDRESS
              </Text>
              <Paper
                p="sm"
                bg="var(--mantine-color-body)"
                radius="md"
                style={{ border: "1px solid var(--border-color)" }}
              >
                <Text size="sm" c="dimmed">
                  {accountDetails?.email}
                </Text>
              </Paper>
            </Stack>

            <Group justify="space-between" mt="md">
              <Stack gap={5}>
                <Text fw={700} size="sm">
                  ROLE
                </Text>
                <Text
                  size="sm"
                  fw={800}
                  tt="uppercase"
                  c="var(--upagain-neutral-green)"
                >
                  {accountDetails?.role}
                </Text>
              </Stack>

              <Stack gap={5} align="flex-end">
                <Text fw={700} size="sm">
                  MEMBER SINCE
                </Text>
                <Text size="sm" fw={600}>
                  {new Date(
                    accountDetails?.created_at || Date.now(),
                  ).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </Stack>
            </Group>
          </Stack>
        </Paper>

        {/* IMPACT STATISTICS */}
        <Paper variant="primary" p={30} radius="lg">
          <Group justify="space-between" align="center">
            <Group gap="sm">
              <IconTrophy size={20} color="var(--upagain-yellow)" />
              <Title order={3} size={22}>
                Environmental Impact
              </Title>
            </Group>

            <Anchor
              onClick={() => navigate(PATHS.USER.SCORE)}
              underline="hover"
              c="var(--upagain-neutral-green)"
              fw={800}
              size="lg"
            >
              <Group gap={6}>
                <IconLeaf size={24} />
                {accountDetails?.score || 0} Upcycling Points
              </Group>
            </Anchor>
          </Group>
        </Paper>

        {/* ACTION BUTTONS */}
        <Group justify="flex-end" gap="xl" mt="xl">
          <Anchor
            size="sm"
            fw={700}
            c="dimmed"
            underline="always"
            onClick={handleDiscard}
          >
            Discard Changes
          </Anchor>
          <Button
            className="button"
            data-variant="cta"
            size="lg"
            radius="xl"
            px={40}
            onClick={handleSave}
          >
            Save Profile Settings
          </Button>
        </Group>
      </Stack>
    </Container>
  );
}
