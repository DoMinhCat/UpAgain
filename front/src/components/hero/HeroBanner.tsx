import {
  BackgroundImage,
  Center,
  Box,
  Overlay,
  Container,
} from "@mantine/core";
import { type ReactNode } from "react";

interface HeroBannerProps {
  src: string;
  height?: number | string;
  overlayOpacity?: number;
  style?: React.CSSProperties;
  children: ReactNode;
}

export function HeroBanner({
  src,
  height = 400,
  overlayOpacity = 0,
  style,
  children,
}: HeroBannerProps) {
  return (
    <Box w="100%">
      <BackgroundImage
        src={src}
        h={height}
        pos="relative"
        style={{ display: "flex", flexDirection: "column", ...style }}
      >
        <Overlay color="#000" backgroundOpacity={overlayOpacity} zIndex={1} />

        <Center p="md" style={{ flex: 1, zIndex: 2 }}>
          <Container size="lg">{children}</Container>
        </Center>
      </BackgroundImage>
    </Box>
  );
}
