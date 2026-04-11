import { Carousel } from "@mantine/carousel";
import { Center, Image, Modal, UnstyledButton } from "@mantine/core";
import { useState } from "react";

interface PhotosCarouselProps {
  photos: string[];
  initialSlide?: number;
  slidesToScroll?: number;
}

export function PhotosCarousel({
  photos,
  initialSlide = 0,
  slidesToScroll = 1,
}: PhotosCarouselProps) {
  const [opened, setOpened] = useState(false);
  const [activeSlide, setActiveSlide] = useState(initialSlide);

  const handleImageClick = (index: number) => {
    setActiveSlide(index);
    setOpened(true);
  };

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  if (!photos || photos.length === 0) {
    return null;
  }

  return (
    <>
      {/* 1. Preview Carousel */}
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
        // Style the progress indicators to be more prominent
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
                src={`${baseUrl}/${path}`}
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

      {/* 2. Smaller Modal Carousel (similar to uploaded image) */}
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
                  src={`${baseUrl}/${path}`}
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
