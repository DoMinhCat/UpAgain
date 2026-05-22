import { RingProgress, Text, Center, Stack } from "@mantine/core";
import { IconLeaf } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useComputedColorScheme } from "@mantine/core";

export function ScoreRing({
  score,
  size = 120,
}: {
  score?: number;
  size?: number;
}) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const theme = useComputedColorScheme("light");

  useEffect(() => {
    // Fill up animation on mount
    const timeout = setTimeout(() => setAnimatedValue(100), 200);
    return () => clearTimeout(timeout);
  }, []);

  const strokeWidth = Math.max(size * 0.08, 6);
  const iconSize = size * 0.25;
  const fontSize = size * 0.22;

  const displayScore =
    score && score > 9999
      ? new Intl.NumberFormat("en-US", {
          notation: "compact",
          maximumFractionDigits: 0,
        }).format(score)
      : (score ?? 0);

  return (
    <RingProgress
      size={size}
      thickness={strokeWidth}
      roundCaps
      transitionDuration={1500}
      rootColor="rgba(100, 100, 100, 0.1)"
      style={{
        filter: "drop-shadow(0 6px 12px rgba(43, 138, 62, 0.25))",
      }}
      sections={[
        {
          value: animatedValue,
          color: "var(--upagain-neutral-green, #69db7c)",
        },
      ]}
      label={
        <Center>
          <Stack gap={2} align="center">
            <IconLeaf
              size={iconSize}
              color="var(--upagain-dark-green, #2b8a3e)"
              stroke={2}
            />
            <Text
              ta="center"
              fw={800}
              c={
                theme == "dark"
                  ? "var(--upagain-light-green)"
                  : "var(--upagain-dark-green)"
              }
              style={{
                lineHeight: 1,
                fontSize: `${fontSize}px`,
                letterSpacing: "-0.5px",
              }}
            >
              {displayScore}
            </Text>
          </Stack>
        </Center>
      }
    />
  );
}
