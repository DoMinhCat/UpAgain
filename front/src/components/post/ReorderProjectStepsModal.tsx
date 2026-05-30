import { useState, useEffect } from "react";
import { Modal, Group, Button, Box, Text, Stack } from "@mantine/core";
import { Tree, moveTreeNode, type TreeNodeData } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useReorderProjectStep } from "../../hooks/postHooks";
import type { Step } from "../../api/interfaces/step";
import { IconSelector } from "@tabler/icons-react";

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

    const index = nextData.findIndex((item) => item.value === payload.draggedNode);
    if (index !== -1) {
      const prevId = index > 0 ? Number(nextData[index - 1].value) : null;
      const nextId = index < nextData.length - 1 ? Number(nextData[index + 1].value) : null;

      reorderMutation.mutate({
        id_step: Number(payload.draggedNode),
        payload: {
          prev_step_id: prevId,
          next_step_id: nextId,
        },
      });
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
            defaultValue: "Drag and drop the steps to change their ordering. The order will save automatically.",
          })}
        </Text>

        <Box
          p="md"
          style={{
            border: "1px solid var(--mantine-color-default-border)",
            borderRadius: "var(--mantine-radius-md)",
            backgroundColor: "var(--mantine-color-default-hover)",
          }}
        >
          <Tree
            data={data}
            onDragDrop={handleDragDrop}
            allowDrop={(payload) => payload.position !== "inside"}
            renderNode={({ node, elementProps }) => (
              <Group
                {...elementProps}
                py="xs"
                px="sm"
                my={4}
                style={{
                  backgroundColor: "var(--component-color-bg, var(--mantine-color-body))",
                  border: "1px solid var(--mantine-color-default-border)",
                  borderRadius: "var(--mantine-radius-sm)",
                  cursor: "grab",
                  userSelect: "none",
                }}
              >
                <IconSelector size={16} color="var(--mantine-color-dimmed)" />
                <Text fw={500}>{node.label}</Text>
              </Group>
            )}
          />
        </Box>

        <Group justify="flex-end" mt="md">
          <Button variant="primary" onClick={onClose}>
            {t("common:actions.done", { defaultValue: "Done" })}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
