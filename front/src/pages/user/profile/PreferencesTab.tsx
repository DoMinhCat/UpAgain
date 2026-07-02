import {
  Divider,
  Paper,
  Stack,
  Switch,
  Text,
  Title,
  Group,
  ActionIcon,
  Select,
  Image,
  useMantineColorScheme,
  useComputedColorScheme,
  Button,
  Badge,
} from "@mantine/core";
import EnableNotiCheckBox from "../../../components/common/EnableNotiCheckBox";
import { useAuth } from "../../../context/AuthContext";
import { usePushNotificationStatus } from "../../../hooks/notificationHooks";
import {
  useGetNotiSettings,
  useUpdateNotiSetting,
} from "../../../hooks/notificationHooks";
import { useTranslation } from "react-i18next";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { LANGUAGES } from "../../../i18n/index";
import { changeLanguage } from "../../../utils/langUtils";
import { useState } from "react";
import MaterialAlertModal from "../../../components/common/MaterialAlertModal";
import {
  useGetProAlertMaterials,
  useUpdateProAlertMaterials,
} from "../../../hooks/proHooks";

const MATERIAL_COLORS: Record<string, string> = {
  wood: "orange",
  metal: "gray",
  plastic: "blue",
  glass: "teal",
  textile: "indigo",
  mixed: "yellow",
  other: "grape",
};

export default function PreferencesTab() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation("profile");
  const { isSubscribed } = usePushNotificationStatus();
  const { data: settings, isLoading } = useGetNotiSettings(user?.id || 0);
  const updateNotiSetting = useUpdateNotiSetting(user?.id || 0);

  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light");

  const { data: alertMaterialsData } = useGetProAlertMaterials(
    user?.id,
    user?.role || "",
  );
  const updateAlertMaterials = useUpdateProAlertMaterials(user?.id);

  const alertMaterials = alertMaterialsData || [];
  const [modalOpen, setModalOpen] = useState(false);

  const handleSaveAlerts = (materials: string[]) => {
    updateAlertMaterials.mutate(materials);
  };

  const toggleColorScheme = () => {
    setColorScheme(computedColorScheme === "dark" ? "light" : "dark");
  };

  const currentLanguage =
    LANGUAGES.find((lang) => lang.lng === i18n.language)?.lng || "en";

  const roleSettings = {
    user: [
      {
        key: "user_object_status",
        label: t("notifications.user_object_status"),
      },
      {
        key: "user_validation_status",
        label: t("notifications.user_validation_status"),
      },
      {
        key: "user_object_retrieved",
        label: t("notifications.user_object_retrieved"),
      },
      {
        key: "user_event_updated",
        label: t("notifications.user_event_updated"),
      },
      {
        key: "user_code_expiring",
        label: t("notifications.user_code_expiring"),
      },
    ],
    pro: [
      {
        key: "pro_material_available",
        label: t("notifications.pro_material_available"),
      },
      {
        key: "pro_object_deposited",
        label: t("notifications.pro_object_deposited"),
      },
      {
        key: "pro_object_expired",
        label: t("notifications.pro_object_expired"),
      },
      {
        key: "pro_subscription_end",
        label: t("notifications.pro_subscription_end"),
      },
      {
        key: "pro_code_expiring",
        label: t("notifications.pro_code_expiring"),
      },
    ],
    employee: [
      {
        key: "emp_event_updated",
        label: t("notifications.emp_event_updated"),
      },
      {
        key: "emp_event_assigned",
        label: t("notifications.emp_event_assigned"),
      },
    ],
  };

  const currentRoleSettings =
    roleSettings[user?.role as keyof typeof roleSettings] || [];

  const handleToggle = (notiType: string, isEnabled: boolean) => {
    updateNotiSetting.mutate({ noti_type: notiType, is_enabled: isEnabled });
  };

  const isEnabled = (notiType: string) => {
    const setting = settings?.find((s) => s.noti_type === notiType);
    return setting ? setting.is_enabled : true;
  };

  return (
    <Stack gap={40}>
      <Stack gap={5}>
        <Title order={1} size={42} fw={800}>
          {t("preferences.title")}
        </Title>
        <Text c="dimmed" size="lg">
          {t("preferences.subtitle")}
        </Text>
      </Stack>

      {/* DISPLAY SETTINGS */}
      <Paper variant="primary" p={30} radius="lg">
        <Stack gap="xl">
          <Stack gap="xs">
            <Title order={3} size={22}>
              {t("preferences.display_settings")}
            </Title>
            <Text size="sm" c="dimmed">
              {t("preferences.display_settings_desc")}
            </Text>
          </Stack>

          <Divider />

          <Group justify="space-between">
            <Stack gap={0}>
              <Text fw={600}>{t("preferences.theme")}</Text>
              <Text size="sm" c="dimmed">
                {computedColorScheme === "dark"
                  ? t("profile:preferences.dark_mode")
                  : t("profile:preferences.light_mode")}
              </Text>
            </Stack>
            <ActionIcon
              onClick={toggleColorScheme}
              variant="default"
              size="xl"
              aria-label="Toggle color scheme"
            >
              {computedColorScheme === "dark" ? (
                <IconSun stroke={1.5} />
              ) : (
                <IconMoon stroke={1.5} />
              )}
            </ActionIcon>
          </Group>

          <Group justify="space-between">
            <Stack gap={0}>
              <Text fw={600}>{t("preferences.language")}</Text>
              <Text size="sm" c="dimmed">
                {LANGUAGES.find((l) => l.lng === currentLanguage)?.label}
              </Text>
            </Stack>
            <Select
              data={LANGUAGES.map((l) => ({ value: l.lng, label: l.label }))}
              value={currentLanguage}
              onChange={(value) => value && changeLanguage(value)}
              allowDeselect={false}
              renderOption={({ option }) => {
                const lang = LANGUAGES.find((l) => l.lng === option.value);
                return (
                  <Group gap="sm">
                    <Image src={`/flags/${lang?.path}.png`} w={20} />
                    <Text size="sm">{option.label}</Text>
                  </Group>
                );
              }}
              leftSection={
                <Image
                  src={`/flags/${LANGUAGES.find((l) => l.lng === currentLanguage)?.path}.png`}
                  w={20}
                />
              }
            />
          </Group>
        </Stack>
      </Paper>

      {/* NOTIFICATION SETTINGS */}
      <Paper variant="primary" p={30} radius="lg">
        <Stack gap="xl">
          <Stack gap="xs">
            <Title order={3} size={22}>
              {t("preferences.push_notifications")}
            </Title>
            <Text size="sm" c="dimmed">
              {t("preferences.push_notifications_desc")}
            </Text>
            {user?.role !== "admin" && <EnableNotiCheckBox />}
          </Stack>

          {currentRoleSettings.length > 0 && (
            <>
              <Divider />
              <Stack gap="md">
                <Title order={4} size={18}>
                  {t("preferences.notification_types")}
                </Title>
                <Text size="sm" c="dimmed">
                  {t("preferences.notification_types_desc")}
                </Text>

                <Stack gap="sm" mt="md">
                  {currentRoleSettings.map((setting) => (
                    <Switch
                      key={setting.key}
                      label={setting.label}
                      checked={isEnabled(setting.key)}
                      onChange={(event) =>
                        handleToggle(setting.key, event.currentTarget.checked)
                      }
                      disabled={!isSubscribed || isLoading}
                      size="md"
                    />
                  ))}
                </Stack>
              </Stack>
            </>
          )}
        </Stack>
      </Paper>

      {/* SMART ALERT SETTINGS (ONLY FOR PRO) */}
      {user?.role === "pro" && (
        <Paper variant="primary" p={30} radius="lg">
          <Stack gap="xl">
            <Stack gap="xs">
              <Title order={3} size={22}>
                {t("preferences.configure_alerts")}
              </Title>
              <Text size="sm" c="dimmed">
                {t("preferences.configure_alerts_desc")}
              </Text>
            </Stack>

            <Divider />

            <Stack gap="sm">
              <Text fw={600}>{t("preferences.selected_materials")}</Text>
              {alertMaterials.length === 0 ? (
                <Text size="sm" c="dimmed" fs="italic">
                  {t("preferences.no_materials_selected")}
                </Text>
              ) : (
                <Group gap="xs">
                  {alertMaterials.map((mat) => (
                    <Badge
                      key={mat}
                      color={MATERIAL_COLORS[mat] || "gray"}
                      variant="light"
                      size="lg"
                    >
                      {t(
                        `home:pro.materials.${mat}`,
                        mat.charAt(0).toUpperCase() + mat.slice(1),
                      )}
                    </Badge>
                  ))}
                </Group>
              )}
              <Button
                variant="secondary"
                onClick={() => setModalOpen(true)}
                style={{ alignSelf: "flex-start" }}
                mt="xs"
              >
                {t("preferences.configure_alerts")}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      )}

      {/* ONBOARDING TOUR */}
      <Paper variant="primary" p={30} radius="lg">
        <Stack gap="xl">
          <Stack gap="xs">
            <Title order={3} size={22}>
              {t("preferences.onboarding_tour")}
            </Title>
            <Text size="sm" c="dimmed">
              {t("preferences.onboarding_tour_desc")}
            </Text>
          </Stack>
          <Divider />
          <Button
            variant="secondary"
            color="var(--upagain-neutral-green)"
            onClick={() => {
              window.dispatchEvent(new Event("start-onboarding-test"));
            }}
            style={{ alignSelf: "flex-start" }}
          >
            {t("preferences.start_tour")}
          </Button>
        </Stack>
      </Paper>

      <MaterialAlertModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        selectedMaterials={alertMaterials}
        onSave={handleSaveAlerts}
      />
    </Stack>
  );
}
