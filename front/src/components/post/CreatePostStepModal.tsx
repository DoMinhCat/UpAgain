import { useState } from "react";
import {
  Modal,
  Stack,
  TextInput,
  MultiSelect,
  Group,
  Button,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useCreateProjectStep } from "../../hooks/postHooks";
import { useGetMyItems } from "../../hooks/itemHooks";
import ImageDropzone from "../input/ImageDropzone";
import { TextEditor } from "../input/TextEditor";

interface CreatePostStepModalProps {
  opened: boolean;
  onClose: () => void;
  postId: number;
}

export function CreatePostStepModal({
  opened,
  onClose,
  postId,
}: CreatePostStepModalProps) {
  const { t } = useTranslation(["marketplace", "common", "admin"]);
  const [files, setFiles] = useState<any[]>([]);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [itemIds, setItemIds] = useState<string[]>([]);
  const [errorTitle, setErrorTitle] = useState<string>("");
  const [errorDescription, setErrorDescription] = useState<string>("");

  // Get user's items to associate with this step
  // !important: only get those that are purchased or completed
  const { data: myItemsData, isLoading: isLoadingItems } = useGetMyItems(
    1,
    100,
    undefined,
    undefined,
    "bought",
  );
  const myItems = myItemsData?.items || [];

  const selectData = myItems.map((item: any) => ({
    value: String(item.id),
    label: item.title,
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
    setFiles([]);
    setTitle("");
    setDescription("");
    setItemIds([]);
    onClose();
  };

  const createStepMutation = useCreateProjectStep(postId);

  const handleCreateStep = (e: React.FormEvent) => {
    e.preventDefault();
    const isTitleValid = validateTitle();
    const isDescValid = validateDescription();

    if (!isTitleValid || !isDescValid) {
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());

    itemIds.forEach((id) => {
      formData.append("item_ids", id);
    });

    files.forEach((file) => {
      formData.append("images", file);
    });

    createStepMutation.mutate(formData, {
      onSuccess: () => {
        handleClose();
      },
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={t("marketplace:my_item_detail.project_steps.modal_title", {
        defaultValue: "Add Step to Project",
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
          disabled={createStepMutation.isPending}
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
          disabled={createStepMutation.isPending || isLoadingItems}
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
      </Stack>
      <ImageDropzone
        loading={createStepMutation.isPending}
        files={files}
        setFiles={setFiles}
      />
      <Group mt="lg" justify="center">
        <Button variant="grey" onClick={handleClose}>
          {t("common:actions.cancel", { defaultValue: "Cancel" })}
        </Button>
        <Button
          onClick={(e) => {
            handleCreateStep(e);
          }}
          loading={createStepMutation.isPending}
          variant="primary"
        >
          {t("common:actions.confirm")}
        </Button>
      </Group>
    </Modal>
  );
}
