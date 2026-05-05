import { useState } from "react";
import { Modal, Stack, TextInput, Select, Group, Button } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useCreatePost } from "../../hooks/postHooks";
import { showSuccessNotification } from "../common/NotificationToast";
import ImageDropzone from "../input/ImageDropzone";
import { TextEditor } from "../input/TextEditor";

interface CreatePostModalProps {
  opened: boolean;
  onClose: () => void;
  role: string;
}

export function CreatePostModal({
  opened,
  onClose,
  role,
}: CreatePostModalProps) {
  const { t } = useTranslation(["admin", "common"]);
  const [files, setFiles] = useState<any[]>([]);
  const [title, setTitle] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [errorTitle, setErrorTitle] = useState<string>("");
  const [errorCategory, setErrorCategory] = useState<string>("");
  const [errorDescription, setErrorDescription] = useState<string>("");

  const validateTitle = () => {
    if (!title) {
      setErrorTitle(t("admin:posts.create_modal.errors.title"));
      return false;
    } else {
      setErrorTitle("");
      return true;
    }
  };
  const validateCategory = () => {
    if (!category) {
      setErrorCategory(t("admin:posts.create_modal.errors.category"));
      return false;
    } else if (category === "project") {
      setErrorCategory(t("admin:posts.create_modal.errors.category_project"));
      return false;
    } else {
      setErrorCategory("");
      return true;
    }
  };
  const validateDescription = () => {
    const stripped = description.replace(/<[^>]*>/g, "").trim();
    if (!description || stripped === "") {
      setErrorDescription(t("admin:posts.create_modal.errors.description"));
      return false;
    } else {
      setErrorDescription("");
      return true;
    }
  };

  const handleCloseCreate = () => {
    setErrorTitle("");
    setErrorCategory("");
    setErrorDescription("");
    setFiles([]);
    setTitle("");
    setCategory("");
    setDescription("");
    onClose();
  };

  const createPostMutation = useCreatePost();
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    const isTitleValid = validateTitle();
    const isCategoryValid = validateCategory();
    const isDescValid = validateDescription();

    if (!isTitleValid || !isCategoryValid || !isDescValid) {
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("content", description);
    files.forEach((file) => {
      formData.append("images", file);
    });
    createPostMutation.mutate(formData, {
      onSuccess: () => {
        showSuccessNotification(
          t("admin:posts.notifications.created_title"),
          t("admin:posts.notifications.created_msg"),
        );
        handleCloseCreate();
      },
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={handleCloseCreate}
      title={t("admin:posts.create_modal.title")}
      size="xl"
    >
      <Stack mb="md">
        <TextInput
          data-autofocus
          withAsterisk
          placeholder={t("admin:posts.create_modal.title_placeholder")}
          label={t("admin:posts.create_modal.title_label")}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
          }}
          onBlur={() => validateTitle()}
          error={errorTitle}
          disabled={createPostMutation.isPending}
          required
        />
        <Select
          withAsterisk
          clearable
          label={t("admin:posts.create_modal.category_label")}
          value={category}
          disabled={createPostMutation.isPending}
          placeholder={t("admin:posts.create_modal.category_placeholder")}
          error={errorCategory}
          onBlur={() => validateCategory()}
          data={[
            {
              value: "project",
              label: t("admin:posts.categories.project"),
              disabled: role !== "pro",
            },
            ...(role !== "pro"
              ? [
                  {
                    value: "project",
                    label: t("admin:posts.categories.project"),
                    disabled: role !== "pro",
                  },
                  { value: "tips", label: t("admin:posts.categories.tips") },
                  { value: "news", label: t("admin:posts.categories.news") },
                  {
                    value: "case_study",
                    label: t("admin:posts.categories.case_study"),
                  },
                  { value: "other", label: t("admin:posts.categories.other") },
                ]
              : []),
          ]}
          onChange={(value) => {
            setCategory(value as string);
          }}
        />
        <TextEditor
          label={t("admin:posts.create_modal.content_label")}
          value={description}
          placeholder={t("admin:posts.create_modal.content_placeholder")}
          error={errorDescription}
          onChange={(value) => {
            setDescription(value);
          }}
        />
      </Stack>
      <ImageDropzone
        loading={createPostMutation.isPending}
        files={files}
        setFiles={setFiles}
      />
      <Group mt="lg" justify="center">
        <Button variant="grey" onClick={handleCloseCreate}>
          {t("admin:posts.create_modal.cancel", { defaultValue: "Cancel" })}
        </Button>
        <Button
          onClick={(e) => {
            handleCreatePost(e);
          }}
          loading={createPostMutation.isPending}
          variant="primary"
        >
          {t("common:actions.confirm")}
        </Button>
      </Group>
    </Modal>
  );
}
