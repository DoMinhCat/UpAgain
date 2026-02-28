import { RingProgress, Text, Paper, Center, Stack } from "@mantine/core";
import { IconLeaf } from "@tabler/icons-react";

export function ScoreRing({ score, size }: { score: number; size: number }) {
  return (
    <RingProgress
      size={size}
      thickness={8} // Slightly thicker for a premium feel
      roundCaps
      transitionDuration={1000}
      sections={[{ value: 100, color: "green" }]} // Value set to match label
      label={
        <Center>
          <Stack gap={4} align="center">
            <IconLeaf
              size={22}
              color={`var(--mantine-color-green-filled)`}
              stroke={1.5}
            />
            <Text
              ta="center"
              fz="xl" // Increased font size
              c="green"
              style={{ lineHeight: 1 }}
            >
              69
            </Text>
          </Stack>
        </Center>
      }
    />
  );
}
