import { useState, useEffect } from "react";
import { Modal, Stack, TextInput, Select, Group, Button } from "@mantine/core";
import { TextEditor } from "../input/TextEditor";
import ImageDropzone from "../input/ImageDropzone";
import { useUpdatePost } from "../../hooks/postHooks";

interface EditPostModalProps {
  opened: boolean;
  onClose: () => void;
  postDetails: any;
  postId: number;
}

export const EditPostModal = ({
  opened,
  onClose,
  postDetails,
  postId,
}: EditPostModalProps) => {
  const [fileEdit, setFileEdit] = useState<any[]>([]);
  const [titleEdit, setTitleEdit] = useState<string>("");
  const [categoryEdit, setCategoryEdit] = useState<string>("");
  const [descriptionEdit, setDescriptionEdit] = useState<string>("");

  const [errorTitle, setErrorTitle] = useState<string>("");
  const [errorCategory, setErrorCategory] = useState<string>("");
  const [errorDescription, setErrorDescription] = useState<string>("");

  const updatePostMutate = useUpdatePost(postId);

  useEffect(() => {
    if (opened && postDetails) {
      setTitleEdit(postDetails.title || "");
      setCategoryEdit(postDetails.category || "");
      setDescriptionEdit(postDetails.content || "");
      const files = postDetails.photos?.map((path: string) => {
        return { path: path };
      });
      setFileEdit(files || []);

      setErrorTitle("");
      setErrorCategory("");
      setErrorDescription("");
    }
  }, [opened, postDetails]);

  const validateTitleEdit = () => {
    if (!titleEdit || titleEdit.trim() === "") {
      setErrorTitle("Title is required");
      return false;
    }
    setErrorTitle("");
    return true;
  };

  const validateCategoryEdit = () => {
    if (!categoryEdit || categoryEdit.trim() === "") {
      setErrorCategory("Category is required");
      return false;
    }
    setErrorCategory("");
    return true;
  };

  const validateDescriptionEdit = () => {
    const stripped = descriptionEdit.replace(/<[^>]*>/g, "").trim();
    if (!descriptionEdit || stripped === "") {
      setErrorDescription("Post's content is required");
      return false;
    }
    setErrorDescription("");
    return true;
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (postDetails) {
      const isValidTitle = validateTitleEdit();
      const isValidCategory = validateCategoryEdit();
      const isValidDescription = validateDescriptionEdit();

      if (!isValidTitle || !isValidCategory || !isValidDescription) {
        return;
      }

      const formData = new FormData();
      formData.append("title", titleEdit);
      formData.append("category", categoryEdit);
      formData.append("content", descriptionEdit);

      fileEdit.forEach((obj) => {
        if (obj instanceof File) {
          formData.append("new_images", obj);
        } else if (obj.path) {
          formData.append("existing_images", obj.path);
        }
      });

      updatePostMutate.mutate(formData, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  };

  return (
    <Modal
      title="Edit post"
      opened={opened}
      onClose={onClose}
      centered
      size="xl"
    >
      <Stack>
        <TextInput
          data-autofocus
          withAsterisk
          label="Title"
          value={titleEdit}
          onChange={(e) => {
            setTitleEdit(e.target.value);
          }}
          error={errorTitle}
          onBlur={() => validateTitleEdit()}
          disabled={updatePostMutate.isPending}
          required
        />
        <Select
          withAsterisk
          clearable
          label="Category"
          value={categoryEdit}
          error={errorCategory}
          onBlur={() => validateCategoryEdit()}
          data={[
            { value: "tutorial", label: "Tutorial" },
            { value: "project", label: "Project" },
            { value: "tips", label: "Tips" },
            { value: "news", label: "News" },
            { value: "case_study", label: "Case Study" },
            { value: "other", label: "Other" },
          ]}
          onChange={(value) => {
            setCategoryEdit(value as string);
          }}
        />
        <TextEditor
          label="Post's description"
          value={descriptionEdit}
          onChange={(value) => {
            setDescriptionEdit(value);
          }}
          error={errorDescription ?? ""}
        />
        <ImageDropzone
          loading={updatePostMutate.isPending}
          files={fileEdit}
          setFiles={setFileEdit}
        />
      </Stack>
      <Group mt="lg" justify="center">
        <Button onClick={onClose} variant="grey">
          Cancel
        </Button>
        <Button
          onClick={(e: React.FormEvent) => {
            handleEdit(e);
          }}
          variant="primary"
          loading={updatePostMutate.isPending}
        >
          Confirm
        </Button>
      </Group>
    </Modal>
  );
};
