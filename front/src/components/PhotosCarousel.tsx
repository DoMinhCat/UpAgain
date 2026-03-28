import { Carousel } from "@mantine/carousel";
import { Image } from "@mantine/core";

interface photosCarouselProps {
  photos: string[];
  initialSlide: number;
}

export function PhotosCarousel({ photos, initialSlide }: photosCarouselProps) {
  return (
    <Carousel
      initialSlide={initialSlide}
      withIndicators
      height={500}
      slideSize="100%"
      emblaOptions={{
        align: "center",
        slidesToScroll: 1,
      }}
    >
      {photos.map((path, index) => (
        <Carousel.Slide key={index}>
          <Image
            src={`${import.meta.env.VITE_API_BASE_URL}/${path}`}
            h={500}
            fit="contain"
            radius={0}
            alt={`Post photo ${index + 1}`}
            fallbackSrc="https://placehold.co/600x400?text=Image+not+found"
          />
        </Carousel.Slide>
      ))}
    </Carousel>
  );
}
