import { Modal, Image, Center } from "@mantine/core";

interface PhotoModalProps {
  opened: boolean;
  setOpened: (opened: boolean) => void;
  photos: string[]; // Keeping this as array to match your previous logic
  baseUrl: string;
  activeSlide: number; // Used as index to pick the single photo
}

export default function PhotoModal({
  opened,
  setOpened,
  photos,
  baseUrl,
  activeSlide,
}: PhotoModalProps) {
  const imagePath = photos[activeSlide] || photos[0];

  return (
    <Modal
      opened={opened}
      onClose={() => setOpened(false)}
      size="85vw"
      padding={0}
      centered
      withCloseButton={true}
      styles={{
        inner: { padding: "md" },
        body: {
          height: "80vh",
          backgroundColor: "var(--mantine-color-body)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
        content: {
          overflow: "hidden",
          boxShadow: "xl",
          borderRadius: "lg",
        },
        header: {
          background: "transparent",
          position: "absolute",
          right: 15,
          top: 15,
          zIndex: 1000,
        },
      }}
    >
      <Center h="100%" w="100%">
        <Image
          src={`${baseUrl}/${imagePath}`}
          mah="70vh" // Tight in the middle with white margins
          maw="90%"
          fit="contain"
          fallbackSrc="https://placehold.co/600x400?text=Image+not+found"
          alt="Full size view"
        />
      </Center>
    </Modal>
  );
}
