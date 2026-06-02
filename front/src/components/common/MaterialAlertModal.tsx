import {
  Modal,
  Button,
  Group,
  Stack,
  Text,
  SimpleGrid,
  UnstyledButton,
  Checkbox,
  ThemeIcon,
  Box,
} from "@mantine/core";
import {
  IconLeaf,
  IconFlame,
  IconDroplet,
  IconScale,
  IconCircleDot,
  IconShirt,
  IconLayersIntersect,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";

interface MaterialAlertModalProps {
  opened: boolean;
  onClose: () => void;
  selectedMaterials: string[];
  onSave: (materials: string[]) => void;
}

const MATERIALS = [
  "wood",
  "metal",
  "textile",
  "glass",
  "plastic",
  "mixed",
  "other",
];

const MATERIAL_METADATA: Record<
  string,
  { color: string; icon: React.ComponentType<any> }
> = {
  wood: { color: "orange", icon: IconLeaf },
  metal: { color: "gray", icon: IconScale },
  textile: { color: "indigo", icon: IconShirt },
  glass: { color: "teal", icon: IconDroplet },
  plastic: { color: "blue", icon: IconFlame },
  mixed: { color: "yellow", icon: IconLayersIntersect },
  other: { color: "grape", icon: IconCircleDot },
};

export default function MaterialAlertModal({
  opened,
  onClose,
  selectedMaterials,
  onSave,
}: MaterialAlertModalProps) {
  const { t } = useTranslation(["profile", "home"]);
  const [localSelected, setLocalSelected] =
    useState<string[]>(selectedMaterials);

  useEffect(() => {
    setLocalSelected(selectedMaterials);
  }, [selectedMaterials, opened]);

  const handleToggle = (material: string) => {
    setLocalSelected((prev) =>
      prev.includes(material)
        ? prev.filter((m) => m !== material)
        : [...prev, material],
    );
  };

  const handleSave = () => {
    onSave(localSelected);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Stack gap={2}>
          <Text fw={700} size="lg">
            {t("preferences.modal_title", "Smart Alert Settings")}
          </Text>
          <Text size="xs" c="dimmed">
            {t(
              "preferences.modal_subtitle",
              "Receive notifications when these materials are listed",
            )}
          </Text>
        </Stack>
      }
      size="lg"
      radius="md"
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
    >
      <Stack gap="xl" mt="md">
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          {MATERIALS.map((mat) => {
            const isChecked = localSelected.includes(mat);
            const meta = MATERIAL_METADATA[mat] || {
              color: "gray",
              icon: IconCircleDot,
            };
            const Icon = meta.icon;

            return (
              <UnstyledButton
                key={mat}
                onClick={() => handleToggle(mat)}
                p="md"
                bd="md"
                style={{
                  border: `2px solid ${
                    isChecked
                      ? `var(--mantine-color-${meta.color}-filled)`
                      : "var(--mantine-color-default-border)"
                  }`,
                  backgroundColor: isChecked
                    ? `var(--mantine-color-${meta.color}-light)`
                    : "transparent",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
                onMouseEnter={(e) => {
                  if (!isChecked) {
                    e.currentTarget.style.borderColor = `var(--mantine-color-${meta.color}-light-hover)`;
                    e.currentTarget.style.backgroundColor =
                      "var(--mantine-color-default-hover)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isChecked) {
                    e.currentTarget.style.borderColor =
                      "var(--mantine-color-default-border)";
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                <Group gap="sm">
                  <ThemeIcon
                    color={meta.color}
                    variant={isChecked ? "filled" : "light"}
                    size="lg"
                    radius="md"
                  >
                    <Icon size={20} />
                  </ThemeIcon>
                  <Box>
                    <Text fw={600} size="sm">
                      {t(
                        `home:pro.materials.${mat}`,
                        mat.charAt(0).toUpperCase() + mat.slice(1),
                      )}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {t(
                        `preferences.alert_for`,
                        "Get alert when new {{name}} listed",
                        {
                          name: mat,
                        },
                      )}
                    </Text>
                  </Box>
                </Group>
                <Checkbox
                  checked={isChecked}
                  onChange={() => {}} // handled by onClick on button
                  color={meta.color}
                  tabIndex={-1}
                  styles={{
                    input: { pointerEvents: "none" },
                  }}
                />
              </UnstyledButton>
            );
          })}
        </SimpleGrid>

        <Group justify="flex-end" mt="xl">
          <Button variant="secondary" onClick={onClose}>
            {t("common.cancel", "Cancel")}
          </Button>
          <Button variant="primary" onClick={handleSave}>
            {t("preferences.save_alerts", "Save Preferences")}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
