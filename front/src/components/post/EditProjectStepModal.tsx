import { useState, useEffect } from "react";
import {
  Modal,
  Stack,
  TextInput,
  MultiSelect,
  Group,
  Button,
  SimpleGrid,
  Box,
  Image,
  ActionIcon,
  Text,
} from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useUpdateProjectStep } from "../../hooks/postHooks";
import { useGetMyItems } from "../../hooks/itemHooks";
import { TextEditor } from "../input/TextEditor";
import { resolveUrl } from "../../utils/imageUtils";
import type { Step } from "../../api/interfaces/step";

interface EditProjectStepModalProps {
  opened: boolean;
  onClose: () => void;
  step: Step;
}

export function EditProjectStepModal({
  opened,
  onClose,
  step,
}: EditProjectStepModalProps) {
  const { t } = useTranslation(["marketplace", "common", "admin"]);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [itemIds, setItemIds] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [errorTitle, setErrorTitle] = useState<string>("");
  const [errorDescription, setErrorDescription] = useState<string>("");

  useEffect(() => {
    if (step && opened) {
      setTitle(step.title);
      setDescription(step.description);
      setItemIds(step.items ? step.items.map((item) => String(item.id)) : []);
      setImages(step.photos || []);
      setErrorTitle("");
      setErrorDescription("");
    }
  }, [step, opened]);

  // Get user's items to associate with this step
  const { data: myItemsData, isLoading: isLoadingItems } = useGetMyItems(
    1,
    100,
    undefined,
    undefined,
    "bought",
  );
  const myItems = myItemsData?.items || [];

  // Combine already associated items from the step with the user's purchased items
  const selectDataMap = new Map<string, string>();
  if (step.items) {
    step.items.forEach((item) => {
      selectDataMap.set(String(item.id), item.title);
    });
  }
  myItems.forEach((item: any) => {
    selectDataMap.set(String(item.id), item.title);
  });

  const selectData = Array.from(selectDataMap.entries()).map(([value, label]) => ({
    value,
    label,
  }));

  const validateTitle = () => {
    if (!title.trim()) {
      setErrorTitle(
        t("marketplace:my_item_detail.project_steps.errors.title", {
          defaultValue: "Title is required",
        }),
      );
      return false;
    } else {
      setErrorTitle("");
      return true;
    }
  };

  const validateDescription = () => {
    const stripped = description.replace(/<[^>]*>/g, "").trim();
    if (!description || stripped === "") {
      setErrorDescription(
        t("marketplace:my_item_detail.project_steps.errors.description", {
          defaultValue: "Description is required",
        }),
      );
      return false;
    } else {
      setErrorDescription("");
      return true;
    }
  };

  const handleClose = () => {
    setErrorTitle("");
    setErrorDescription("");
    onClose();
  };

  const updateStepMutation = useUpdateProjectStep();

  const handleUpdateStep = (e: React.FormEvent) => {
    e.preventDefault();
    const isTitleValid = validateTitle();
    const isDescValid = validateDescription();

    if (!isTitleValid || !isDescValid) {
      return;
    }

    updateStepMutation.mutate(
      {
        id_step: step.id,
        payload: {
          id_post: step.id_post,
          title: title.trim(),
          description: description.trim(),
          item_ids: itemIds.map(Number),
          images: images,
        },
      },
      {
        onSuccess: () => {
          handleClose();
        },
      },
    );
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={t("marketplace:my_item_detail.project_steps.edit_modal_title", {
        defaultValue: "Edit Project Step",
      })}
      size="xl"
    >
      <Stack mb="md">
        <TextInput
          data-autofocus
          withAsterisk
          placeholder={t(
            "marketplace:my_item_detail.project_steps.title_placeholder",
            { defaultValue: "e.g. Preparing the wood" },
          )}
          label={t("marketplace:my_item_detail.project_steps.title_label", {
            defaultValue: "Step Title",
          })}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
          }}
          onBlur={() => validateTitle()}
          error={errorTitle}
          disabled={updateStepMutation.isPending}
          required
        />

        <MultiSelect
          label={t("marketplace:my_item_detail.project_steps.items_label", {
            defaultValue: "Items Used",
          })}
          placeholder={t(
            "marketplace:my_item_detail.project_steps.items_placeholder",
            { defaultValue: "Select items used in this step" },
          )}
          data={selectData}
          value={itemIds}
          onChange={setItemIds}
          disabled={updateStepMutation.isPending || isLoadingItems}
          searchable
          clearable
          styles={{
            pill: {
              display: "inline-flex",
              backgroundColor: "var(--component-color-bg)",
              color: "var(--mantine-color-body)",
              width: "auto",
              minWidth: "unset",
            },
            label: {
              display: "block",
            },
          }}
          maxDropdownHeight={200}
          comboboxProps={{ shadow: "md" }}
          nothingFoundMessage={t(
            "marketplace:my_item_detail.project_steps.nothing_found",
            { defaultValue: "No items found" },
          )}
        />

        <TextEditor
          label={t(
            "marketplace:my_item_detail.project_steps.description_label",
            { defaultValue: "Step Description" },
          )}
          value={description}
          placeholder={t(
            "marketplace:my_item_detail.project_steps.description_placeholder",
            { defaultValue: "Describe what you did in this step..." },
          )}
          error={errorDescription}
          onChange={(value) => {
            setDescription(value);
          }}
        />

        {images.length > 0 && (
          <Box>
            <Text size="sm" fw={500} mb="xs">
              {t("marketplace:my_item_detail.no_photos", { defaultValue: "Step Photos" })}
            </Text>
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="xs">
              {images.map((url, idx) => (
                <Box
                  key={idx}
                  pos="relative"
                  style={{
                    borderRadius: "var(--mantine-radius-md)",
                    overflow: "hidden",
                  }}
                >
                  <Image src={resolveUrl(url)} h={100} style={{ objectFit: "cover" }} />
                  <ActionIcon
                    variant="filled"
                    color="red"
                    pos="absolute"
                    top={5}
                    right={5}
                    size="sm"
                    onClick={() => {
                      setImages((prev) => prev.filter((_, i) => i !== idx));
                    }}
                  >
                    <IconTrash size={14} />
                  </ActionIcon>
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        )}
      </Stack>

      <Group mt="lg" justify="center">
        <Button variant="grey" onClick={handleClose}>
          {t("common:actions.cancel", { defaultValue: "Cancel" })}
        </Button>
        <Button
          onClick={(e) => {
            handleUpdateStep(e);
          }}
          loading={updateStepMutation.isPending}
          variant="primary"
        >
          {t("common:actions.confirm")}
        </Button>
      </Group>
    </Modal>
  );
}
