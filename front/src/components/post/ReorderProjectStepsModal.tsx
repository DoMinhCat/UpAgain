import { useState, useEffect } from "react";
import { Modal, Group, Button, Box, Text, Stack } from "@mantine/core";
import { Tree, moveTreeNode, type TreeNodeData } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useReorderProjectStep } from "../../hooks/postHooks";
import type { Step } from "../../api/interfaces/step";
import { IconSelector } from "@tabler/icons-react";
import classes from "../../styles/GlobalStyles.module.css";

interface ReorderProjectStepsModalProps {
  opened: boolean;
  onClose: () => void;
  steps: Step[];
}

export function ReorderProjectStepsModal({
  opened,
  onClose,
  steps,
}: ReorderProjectStepsModalProps) {
  const { t } = useTranslation(["post", "common"]);
  const [data, setData] = useState<TreeNodeData[]>([]);
  const reorderMutation = useReorderProjectStep();

  useEffect(() => {
    if (opened && steps) {
      const treeData: TreeNodeData[] = steps.map((step) => ({
        value: String(step.id),
        label: step.title,
      }));
      setData(treeData);
    }
  }, [opened, steps]);

  const handleDragDrop = (payload: {
    draggedNode: string;
    targetNode: string;
    position: "before" | "after" | "inside";
  }) => {
    const nextData = moveTreeNode(data, payload);
    setData(nextData);
  };

  const handleSave = () => {
    if (data.length > 0) {
      const stepIds = data.map((item) => Number(item.value));
      reorderMutation.mutate(
        {
          id_step: Number(data[0].value),
          payload: {
            step_ids: stepIds,
          },
        },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    } else {
      onClose();
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t("project.reorder_modal_title", {
        defaultValue: "Reorder Project Steps",
      })}
      size="md"
      centered
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {t("project.reorder_instructions", {
            defaultValue: "Drag and drop the steps to change their ordering. Click confirm to save.",
          })}
        </Text>

        <Box
          p="md"
          style={{
            border: "1px solid var(--border-color, var(--mantine-color-default-border))",
            borderRadius: "var(--mantine-radius-md)",
            backgroundColor: "var(--paper-color, var(--mantine-color-default-hover))",
          }}
        >
          <Tree
            data={data}
            onDragDrop={handleDragDrop}
            allowDrop={(payload) => payload.position !== "inside"}
            renderNode={({ node, elementProps }) => {
              const { className, ...restProps } = elementProps;
              return (
                <div
                  {...restProps}
                  className={`${className} ${classes.treeCard}`}
                >
                  <IconSelector size={16} color="var(--mantine-color-dimmed)" />
                  <span className={classes.treeLabel}>{node.label}</span>
                </div>
              );
            }}
          />
        </Box>

        <Group justify="flex-end" mt="md">
          <Button variant="grey" onClick={onClose} disabled={reorderMutation.isPending}>
            {t("common:actions.cancel", { defaultValue: "Cancel" })}
          </Button>
          <Button variant="primary" onClick={handleSave} loading={reorderMutation.isPending}>
            {t("common:actions.confirm", { defaultValue: "Confirm" })}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
