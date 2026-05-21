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
  Loader,
} from "@mantine/core";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../../routes/paths";
import {
  useAccountDetails,
  useAccountStats,
  useUpdateAccount,
  useUpdateAvatar,
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
import { resolveUrl } from "../../../utils/imageUtils";
import {
  validatePhone,
  validateUsername,
} from "../../../utils/validations/accountValidation";
import { useTranslation } from "react-i18next";
import ConfirmAccountUpdateModal from "../../../components/common/ConfirmAccountUpdateModal";

export default function AccountTab() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("profile");
  const [openedConfirm, { open: openConfirm, close: closeConfirm }] =
    useDisclosure(false);

  // UPDATE AVATAR
  const [openedAvatar, { open: openAvatar, close: closeAvatar }] =
    useDisclosure(false);
  const [files, setFiles] = useState<any[]>([]);
  const updateAvatar = useUpdateAvatar(user?.id || 0);

  const handleUpdateAvatar = () => {
    const newAvatarToSend = new FormData();
    newAvatarToSend.append("avatar", files[0]);
    updateAvatar.mutate(newAvatarToSend, {
      onSuccess: () => {
        closeAvatar();
      },
    });
  };

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
    }
  };

  const updateAccount = useUpdateAccount();

  const [errorPhone, setErrorPhone] = useState<string | null>(null);
  const [errorUsername, setErrorUsername] = useState<string | null>(null);

  const handleValidatePhone = (val: string) => {
    const phoneError = validatePhone(val, t);
    setErrorPhone(phoneError);
    return phoneError === null;
  };

  const handleValidateUsername = (val: string) => {
    const usernameError = validateUsername(val, t);
    setErrorUsername(usernameError);
    return usernameError === null;
  };

  const handleSave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    let phoneCorrect = true;
    if (formData.phone) {
      phoneCorrect = handleValidatePhone(formData.phone);
    }
    if (!phoneCorrect || !handleValidateUsername(formData.username)) return;
    openConfirm();
  };

  const handleConfirmSave = () => {
    updateAccount.mutate(
      {
        id: user?.id ?? 0,
        username: formData.username || "",
        email: accountDetails?.email || "",
        phone: formData.phone || "",
      },
      {
        onSuccess: () => {
          closeConfirm();
        },
      },
    );
  };

  if (isLoadingAccountDetails || !accountDetails) return <FullScreenLoader />;

  return (
    <Stack gap={40}>
      {/* PAGE HEADER */}
      <Stack gap={5}>
        <Title order={1} size={42} fw={800}>
          {t("account.title")}
        </Title>
        <Text c="dimmed" size="lg">
          {t("account.subtitle")}
        </Text>
      </Stack>

      {/* AVATAR SECTION */}
      <Stack justify="center" align="center">
        <Avatar
          src={resolveUrl(accountDetails?.avatar || "")}
          name={accountDetails?.username}
          color="initials"
          size="100"
        />
        <Title order={3}>{accountDetails?.username}</Title>
        <Button
          variant="secondary"
          color="var(--upagain-neutral-green)"
          onClick={() => openAvatar()}
        >
          {t("account.update_avatar")}
        </Button>
      </Stack>

      {/* PERSONAL DETAILS SECTION */}
      <Paper variant="primary" p={30} radius="lg">
        <Stack gap="xl">
          <Group justify="space-between">
            <Group gap="sm">
              <IconUser size={20} color="var(--upagain-neutral-green)" />
              <Title order={3} size={22}>
                {t("account.personal_details")}
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
                {t(`common:roles.${accountDetails?.role}`).toUpperCase()}
              </Badge>
            </Group>
            <Stack gap={5} align="flex-end">
              <Text fw={700} size="sm">
                {t("account.joined_on")}
              </Text>
              <Text size="sm" fw={600} c="dimmed">
                {new Date(
                  accountDetails?.created_at || Date.now(),
                ).toLocaleDateString(i18n.language, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </Stack>
          </Group>

          <TextInput
            label={t("account.username")}
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            onBlur={(e) => handleValidateUsername(e.target.value)}
            size="md"
            error={errorUsername}
          />

          <TextInput
            label={t("account.phone")}
            value={formData.phone || ""}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            onBlur={(e) => handleValidatePhone(e.target.value)}
            size="md"
            description={!formData.phone ? "N/A" : null}
            error={errorPhone}
          />

          <Stack gap={5}>
            <TextInput
              label={t("account.email")}
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
              {t("account.statistics")}
            </Title>
          </Group>
          <Anchor
            onClick={() =>
              navigate(PATHS.USER.SCORE, { state: { from: "profile" } })
            }
            underline="hover"
            c="var(--upagain-neutral-green)"
            fw={800}
            size="lg"
          >
            <Group gap={6}>
              <IconLeaf size={24} />
              <Text>
                {accountDetails?.score} {t("account.upcycling_points")}
              </Text>
            </Group>
          </Anchor>

          {isLoadingStats ? (
            <Loader />
          ) : (
            <>
              <Stack gap="md">
                <Group gap={6}>
                  <IconPackage size={24} />
                  <Title order={4}>{t("account.deposits_posted")}</Title>
                </Group>
                <Text>
                  {" "}
                  {stats?.total_deposits}{" "}
                  {stats?.total_deposits === 1
                    ? t("account.deposit_posted")
                    : t("account.deposits_posted_plural")}
                </Text>
              </Stack>
              <Stack gap="md">
                <Group gap={6}>
                  <IconClipboardList size={24} />
                  <Title order={4}>{t("account.listings_posted")}</Title>
                </Group>
                <Text>
                  {" "}
                  {stats?.total_listings}{" "}
                  {stats?.total_listings === 1
                    ? t("account.listing_posted")
                    : t("account.listings_posted_plural")}
                </Text>
              </Stack>
            </>
          )}
        </Stack>
      </Paper>

      {/* ACTION BUTTONS */}
      <Group justify="center" gap="xl" mt="xl">
        <Button
          size="lg"
          fw={700}
          disabled={updateAccount.isPending}
          c="dimmed"
          variant="secondary"
          onClick={handleDiscard}
        >
          {t("account.discard_changes")}
        </Button>
        <Button
          className="button"
          data-variant="primary"
          loading={updateAccount.isPending}
          size="lg"
          px={40}
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleSave(e)}
        >
          {t("account.save_changes")}
        </Button>
      </Group>

      <Modal
        size="lg"
        centered
        opened={openedAvatar}
        onClose={() => closeAvatar()}
        title={t("account.modal_avatar_title")}
      >
        <ImageDropzone
          files={files}
          maxSizeDescription="Maximum size: 5MB"
          extraDescription={null}
          setFiles={setFiles}
          props={{ maxFiles: 1, onDrop: (files) => setFiles(files) }}
        />
        <Group mt="md" justify="center">
          <Button variant="secondary" onClick={() => handleUpdateAvatar()}>
            {t("account.modal_avatar_cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={() => handleUpdateAvatar()}
            loading={updateAvatar.isPending}
          >
            {t("account.modal_avatar_confirm")}
          </Button>
        </Group>
      </Modal>

      <ConfirmAccountUpdateModal
        opened={openedConfirm}
        onClose={closeConfirm}
        onConfirm={handleConfirmSave}
        loading={updateAccount.isPending}
      />
    </Stack>
  );
}
