import { Divider, Paper, Stack, Switch, Text, Title } from "@mantine/core";
import EnableNotiCheckBox from "../../../components/common/EnableNotiCheckBox";
import { useAuth } from "../../../context/AuthContext";
import { usePushNotificationStatus } from "../../../hooks/notificationHooks";
import {
  useGetNotiSettings,
  useUpdateNotiSetting,
} from "../../../hooks/notificationHooks";
import { useTranslation } from "react-i18next";

export default function PreferencesTab() {
  const { user } = useAuth();
  const { t } = useTranslation("admin");
  const { isSubscribed } = usePushNotificationStatus();
  const { data: settings, isLoading } = useGetNotiSettings(user?.id || 0);
  const updateNotiSetting = useUpdateNotiSetting(user?.id || 0);

  const roleSettings = {
    user: [
      {
        key: "user_object_status",
        label: t("notifications.user_object_status", "Object Status Update"),
      },
      {
        key: "user_validation_status",
        label: t(
          "notifications.user_validation_status",
          "Validation Status Update",
        ),
      },
      {
        key: "user_object_retrieved",
        label: t("notifications.user_object_retrieved", "Object Retrieved"),
      },
      {
        key: "user_event_updated",
        label: t("notifications.user_event_updated", "Event Updated"),
      },
      {
        key: "user_code_expiring",
        label: t("notifications.user_code_expiring", "Code Expiring (24h)"),
      },
    ],
    pro: [
      {
        key: "pro_material_available",
        label: t(
          "notifications.pro_material_available",
          "New Material Available",
        ),
      },
      {
        key: "pro_object_deposited",
        label: t("notifications.pro_object_deposited", "Object Deposited"),
      },
      {
        key: "pro_subscription_end",
        label: t(
          "notifications.pro_subscription_end",
          "Subscription Ending Soon",
        ),
      },
      {
        key: "pro_code_expiring",
        label: t("notifications.pro_code_expiring", "Retrieve Code Expiring"),
      },
    ],
    employee: [
      {
        key: "emp_event_updated",
        label: t("notifications.emp_event_updated", "Assigned Event Updated"),
      },
      {
        key: "emp_event_assigned",
        label: t("notifications.emp_event_assigned", "New Event Assigned"),
      },
    ],
  };

  const currentRoleSettings =
    roleSettings[user?.role as keyof typeof roleSettings] || [];

  const handleToggle = (notiType: string, isEnabled: boolean) => {
    updateNotiSetting.mutate({ noti_type: notiType, is_enabled: isEnabled });
  };

  const isEnabled = (notiType: string) => {
    // If setting doesn't exist in DB, it's enabled by default (per schema default true)
    const setting = settings?.find((s) => s.noti_type === notiType);
    return setting ? setting.is_enabled : true;
  };

  return (
    <Stack gap={40}>
      <Stack gap={5}>
        <Title order={1} size={42} fw={800}>
          {t("preferences.title", "Preferences")}
        </Title>
        <Text c="dimmed" size="lg">
          {t(
            "preferences.subtitle",
            "Manage your notification settings and display preferences",
          )}
        </Text>
      </Stack>

      <Paper variant="primary" p={30} radius="lg">
        <Stack gap="xl">
          <Stack gap="xs">
            <Title order={3} size={22}>
              {t("preferences.push_notifications", "Push Notifications")}
            </Title>
            <Text size="sm" c="dimmed">
              {t(
                "preferences.push_notifications_desc",
                "Enable push notifications to receive real-time updates on your device.",
              )}
            </Text>
            {user?.role !== "admin" && <EnableNotiCheckBox />}
          </Stack>

          {currentRoleSettings.length > 0 && (
            <>
              <Divider />
              <Stack gap="md">
                <Title order={4} size={18}>
                  {t("preferences.notification_types", "Notification Types")}
                </Title>
                <Text size="sm" c="dimmed">
                  {t(
                    "preferences.notification_types_desc",
                    "Choose which events you want to be notified about.",
                  )}
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
    </Stack>
  );
}
