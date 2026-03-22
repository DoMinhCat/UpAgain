import {
  Dropzone,
  IMAGE_MIME_TYPE,
  type DropzoneProps,
} from "@mantine/dropzone";
import { Group, Text, Image, SimpleGrid } from "@mantine/core";
import { IconUpload, IconX, IconPhoto } from "@tabler/icons-react";
import { showErrorNotification } from "./NotificationToast";
import { type FileWithPath } from "@mantine/dropzone";

interface ImageDropzoneProps {
  loading?: boolean;
  disabled?: boolean;
  files: FileWithPath[];
  setFiles: React.Dispatch<React.SetStateAction<FileWithPath[]>>;
  props?: DropzoneProps;
}

export default function ImageDropzone({
  loading = false,
  disabled = false,
  files,
  setFiles,
  props,
}: ImageDropzoneProps) {

  const previews = files.map((file, index) => {
    const imageUrl = URL.createObjectURL(file);

    return (
      <div key={file.path || index} style={{ position: "relative" }}>
        <Image src={imageUrl} onLoad={() => URL.revokeObjectURL(imageUrl)} />
        <button
          onClick={() => removeFile(index)}
          style={{ position: "absolute", top: 0, right: 0 }}
        >
          ×
        </button>
      </div>
    );
  });
  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };
  return (
    <>
      <Dropzone
        loading={loading}
        disabled={disabled}
        onDrop={(acceptedFiles) => {
          setFiles((prev) => [...prev, ...acceptedFiles]);
        }}
        onReject={() =>
          showErrorNotification(
            "Error uploading image",
            "Invalid file type or file too large",
          )
        }
        maxSize={5 * 1024 ** 2}
        // accept only images
        accept={IMAGE_MIME_TYPE}
        {...props}
      >
        <Group
          justify="center"
          gap="xl"
          mih={160}
          style={{ pointerEvents: "none" }}
        >
          <Dropzone.Accept>
            <IconUpload
              size={52}
              color="var(--mantine-color-blue-6)"
              stroke={1.5}
            />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX size={52} color="var(--mantine-color-red-6)" stroke={1.5} />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconPhoto
              size={52}
              color="var(--mantine-color-dimmed)"
              stroke={1.5}
            />
          </Dropzone.Idle>

          <div>
            <Text size="xl" inline>
              Drag images here or click to select images
            </Text>
            <Text size="sm" c="dimmed" inline mt={7}>
              Attach as many images as you like, each image should not exceed
              5MB
            </Text>
          </div>
        </Group>
      </Dropzone>
      <SimpleGrid cols={{ base: 1, sm: 4 }} mt={previews.length > 0 ? "xl" : 0}>
        {previews}
      </SimpleGrid>
    </>
  );
}
