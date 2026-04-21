import {
  Stack,
  Group,
  Avatar,
  Button,
  TextInput,
  Paper,
  Anchor,
  Modal,
  Title,
  Text,
} from "@mantine/core";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../../routes/paths";
import { useAccountDetails } from "../../../hooks/accountHooks";
import FullScreenLoader from "../../../components/common/FullScreenLoader";
import { useState, useEffect } from "react";
import { IconLeaf, IconUser, IconTrophy } from "@tabler/icons-react";
import ImageDropzone from "../../../components/input/ImageDropzone";
import { useDisclosure } from "@mantine/hooks";

export default function AccountTab() {
  const { user } = useAuth();
  const navigate = useNavigate();
  // UPDATE AVATAR
  const [openedAvatar, { open: openAvatar, close: closeAvatar }] =
    useDisclosure(false);

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
    }
  }, [accountDetails]);

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

  if (isLoadingAccountDetails || !accountDetails) return <FullScreenLoader />;

  return (
    <Stack gap={40}>
      {/* PAGE HEADER */}
      <Stack gap={5}>
        <Title order={1} size={42} fw={800}>
          Account Settings
        </Title>
        <Text c="dimmed" size="lg">
          Manage your account, preferences, and billing information.
        </Text>
      </Stack>

      {/* AVATAR SECTION */}
      <Stack justify="center" align="center">
        <Avatar
          src={accountDetails?.avatar}
          name="User's name"
          color="initials"
          size="100"
        />
        <Title order={3}>{accountDetails?.username}</Title>
        <Button
          variant="secondary"
          color="var(--upagain-neutral-green)"
          onClick={() => openAvatar()}
        >
          Update avatar
        </Button>
      </Stack>

      {/* PERSONAL DETAILS SECTION */}
      <Paper variant="primary" p={30} radius="lg">
        <Stack gap="xl">
          <Group gap="sm">
            <IconUser size={20} color="var(--upagain-neutral-green)" />
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
            <TextInput
              label="EMAIL ADDRESS"
              placeholder="[EMAIL_ADDRESS]"
              value={accountDetails?.email}
              variant="filled"
              disabled
              size="md"
            />
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
      <Group justify="center" gap="xl" mt="xl">
        <Button
          size="lg"
          fw={700}
          c="dimmed"
          variant="secondary"
          onClick={handleDiscard}
        >
          Discard changes
        </Button>
        <Button
          className="button"
          data-variant="cta"
          size="lg"
          px={40}
          onClick={handleSave}
        >
          Save changes
        </Button>
      </Group>

      <Modal
        size="lg"
        centered
        opened={openedAvatar}
        onClose={() => closeAvatar()}
        title="Update avatar"
      >
        <ImageDropzone
          files={files}
          maxSizeDescription="Maximum size: 5MB"
          extraDescription={null}
          setFiles={setFiles}
          props={{ maxFiles: 1, onDrop: (files) => setFiles(files) }}
        />
        <Group justify="center">
          <Button variant="secondary" onClick={() => closeAvatar()}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => closeAvatar()}>
            Confirm
          </Button>
        </Group>
      </Modal>
    </Stack>
  );
}
