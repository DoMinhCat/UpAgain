import { Carousel } from "@mantine/carousel";
import { Center, Image, Modal, UnstyledButton } from "@mantine/core";
import { useState } from "react";

interface PhotosCarouselProps {
  photos: string[];
  initialSlide?: number;
  slidesToScroll?: number;
  /** External control: when provided, only the lightbox modal is rendered (no preview carousel). */
  opened?: boolean;
  onClose?: () => void;
  /** Which slide to open on when using external control. */
  defaultActiveSlide?: number;
}

export function PhotosCarousel({
  photos,
  initialSlide = 0,
  slidesToScroll = 1,
  opened: externalOpened,
  onClose: externalOnClose,
  defaultActiveSlide,
}: PhotosCarouselProps) {
  const [internalOpened, setInternalOpened] = useState(false);
  const [activeSlide, setActiveSlide] = useState(initialSlide);

  // Determine if we're externally controlled
  const isControlled = externalOpened !== undefined;
  const modalOpened = isControlled ? externalOpened : internalOpened;
  const closeModal = isControlled
    ? () => externalOnClose?.()
    : () => setInternalOpened(false);

  const handleImageClick = (index: number) => {
    setActiveSlide(index);
    setInternalOpened(true);
  };

  // Sync defaultActiveSlide when externally opened
  if (isControlled && externalOpened && defaultActiveSlide !== undefined) {
    if (activeSlide !== defaultActiveSlide) {
      setActiveSlide(defaultActiveSlide);
    }
  }

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const resolveUrl = (path: string) =>
    path.startsWith("http") ? path : `${baseUrl}/${path}`;

  if (!photos || photos.length === 0) {
    return null;
  }

  return (
    <>
      {/* 1. Preview Carousel (only when not externally controlled) */}
      {!isControlled && (
        <Carousel
          initialSlide={initialSlide}
          withIndicators={photos.length > 1}
          withControls={photos.length > 1}
          height={400}
          slideSize="100%"
          emblaOptions={{
            align: "center",
            slidesToScroll: slidesToScroll,
            loop: photos.length > 1,
          }}
          styles={{
            indicator: {
              width: 8,
              height: 8,
              transition: "width 250ms ease",
              "&[dataActive]": { width: 24 },
            },
          }}
        >
          {photos.map((path, index) => (
            <Carousel.Slide key={index}>
              <UnstyledButton
                onClick={() => handleImageClick(index)}
                style={{ width: "100%", cursor: "zoom-in" }}
              >
                <Image
                  src={resolveUrl(path)}
                  h={400}
                  fit="contain"
                  bg="var(--mantine-color-body)"
                  radius="md"
                  alt={`Preview photo ${index + 1}`}
                  fallbackSrc="https://placehold.co/600x400?text=Image+not+found"
                />
              </UnstyledButton>
            </Carousel.Slide>
          ))}
        </Carousel>
      )}

      {/* 2. Fullscreen Modal Carousel */}
      <Modal
        opened={modalOpened}
        onClose={closeModal}
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
            flexDirection: "column",
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
        <Carousel
          initialSlide={activeSlide}
          withIndicators={photos.length > 1}
          withControls={photos.length > 1}
          height="100%"
          slideSize="100%"
          emblaOptions={{
            align: "center",
            slidesToScroll: 1,
            loop: photos.length > 1,
          }}
          styles={{
            root: { flex: 1 },
            viewport: { height: "100%" },
            container: { height: "100%" },
            indicator: {
              width: 8,
              height: 8,
              transition: "width 250ms ease",
              "&[data-active]": { width: 24 },
            },
          }}
        >
          {photos.map((path, index) => (
            <Carousel.Slide key={`full-${index}`}>
              <Center h="100%" w="100%">
                <Image
                  src={resolveUrl(path)}
                  // "Tight in middle" - limited by height to ensure it stays in view
                  mah="70vh"
                  maw="90%"
                  fit="contain"
                  alt={`Full photo ${index + 1}`}
                />
              </Center>
            </Carousel.Slide>
          ))}
        </Carousel>
      </Modal>
    </>
  );
}
