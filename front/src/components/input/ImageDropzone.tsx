import {
  Dropzone,
  IMAGE_MIME_TYPE,
  type DropzoneProps,
} from "@mantine/dropzone";
import { Group, Text, Image, SimpleGrid } from "@mantine/core";
import { IconUpload, IconX, IconPhoto } from "@tabler/icons-react";
import { showErrorNotification } from "../common/NotificationToast";

interface ImageDropzoneProps {
  loading?: boolean;
  disabled?: boolean;
  files: any[];
  setFiles: React.Dispatch<React.SetStateAction<any[]>>;
  props?: DropzoneProps;
  maxSizeDescription?: string;
  extraDescription?: string | null;
}

export default function ImageDropzone({
  loading = false,
  disabled = false,
  files,
  setFiles,
  maxSizeDescription = "Total upload size must not exceed 32MB (each image 5MB max)",
  extraDescription = "The first image will be used as the primary image",
  props,
}: ImageDropzoneProps) {
  const previews = files.map((file, index) => {
    const imageUrl =
      file instanceof Blob
        ? URL.createObjectURL(file)
        : `${import.meta.env.VITE_API_BASE_URL}/${file.path}`;

    return (
      <div key={file.path || index} style={{ position: "relative" }}>
        <Image
          src={imageUrl}
          onLoad={() => {
            if (file instanceof Blob) URL.revokeObjectURL(imageUrl);
          }}
          fallbackSrc="https://placehold.co/600x400?text=Image+not+found"
        />
        <button
          onClick={() => removeFile(index)}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            cursor: "pointer",
            background: "rgba(0,0,0,0.5)",
            color: "white",
          }}
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
              {maxSizeDescription}
            </Text>
            {extraDescription && (
              <Text size="sm" c="dimmed" inline mt={2}>
                {extraDescription}
              </Text>
            )}
          </div>
        </Group>
      </Dropzone>
      <SimpleGrid cols={{ base: 1, sm: 4 }} mt={previews.length > 0 ? "xl" : 0}>
        {previews}
      </SimpleGrid>
    </>
  );
}
