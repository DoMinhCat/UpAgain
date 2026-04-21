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
  Badge,
} from "@mantine/core";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../../routes/paths";
import {
  useAccountDetails,
  useAccountStats,
} from "../../../hooks/accountHooks";
import FullScreenLoader from "../../../components/common/FullScreenLoader";
import { useState, useEffect } from "react";
import {
  IconLeaf,
  IconUser,
  IconTrophy,
  IconPackage,
  IconClipboardList,
} from "@tabler/icons-react";
import ImageDropzone from "../../../components/input/ImageDropzone";
import { useDisclosure } from "@mantine/hooks";

export default function AccountTab() {
  const { user } = useAuth();
  const navigate = useNavigate();
  // UPDATE AVATAR
  const [openedAvatar, { open: openAvatar, close: closeAvatar }] =
    useDisclosure(false);

  // GET ACCOUNT DATA
  const { data: accountDetails, isLoading: isLoadingAccountDetails } =
    useAccountDetails(user?.id || 0);
  const { data: stats, isLoading: isLoadingStats } = useAccountStats(
    user?.id || 0,
  );

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
          Manage your profile information
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
          <Group justify="space-between">
            <Group gap="sm">
              <IconUser size={20} color="var(--upagain-neutral-green)" />
              <Title order={3} size={22}>
                Personal Details
              </Title>
              <Badge
                color={
                  accountDetails?.role == "admin"
                    ? "red"
                    : accountDetails?.role == "user"
                      ? "var(--upagain-neutral-green)"
                      : accountDetails?.role == "pro"
                        ? "var(--upagain-yellow)"
                        : "var(--upagain-light-green)"
                }
              >
                {accountDetails?.role.toUpperCase()}
              </Badge>
            </Group>
            <Stack gap={5} align="flex-end">
              <Text fw={700} size="sm">
                Joined on
              </Text>
              <Text size="sm" fw={600} c="dimmed">
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

          <TextInput
            label="Username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            size="md"
          />

          <TextInput
            label="Phone"
            value={formData.phone || ""}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            size="md"
            description={!formData.phone ? "N/A" : null}
          />

          <Stack gap={5}>
            <TextInput
              label="Email"
              value={accountDetails?.email}
              disabled
              size="md"
            />
          </Stack>
        </Stack>
      </Paper>

      {/* STATISTICS */}
      <Paper variant="primary" p={30} radius="lg">
        <Stack gap="xl">
          <Group gap="sm">
            <IconTrophy size={20} color="var(--upagain-yellow)" />
            <Title order={3} size={22}>
              Statistics
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
              <Text>{accountDetails?.score} Upcycling points</Text>
            </Group>
          </Anchor>

          <Stack gap="md">
            <Group gap={6}>
              <IconPackage size={24} />
              <Title order={4}>Container deposits posted</Title>
            </Group>
            <Text>
              {" "}
              {stats?.total_deposits} container{" "}
              {stats?.total_deposits === 1 ? "deposit" : "deposits"} posted
            </Text>
          </Stack>
          <Stack gap="md">
            <Group gap={6}>
              <IconClipboardList size={24} />
              <Title order={4}>Listings posted</Title>
            </Group>
            <Text>
              {" "}
              {stats?.total_listings}{" "}
              {stats?.total_listings === 1 ? "listing" : "listings"} posted
            </Text>
          </Stack>
          {/* Total spendings are shown in billings tab */}
        </Stack>
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
        <Group mt="md" justify="center">
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
