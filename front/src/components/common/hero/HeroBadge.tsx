import { Badge } from "@mantine/core";

export default function HeroBadge({
  text,
  height,
}: {
  text: string;
  height?: number;
}) {
  return (
    <Badge
      bg="var(--component-color-bg)"
      c="var(--mantine-color-body)"
      size="lg"
      radius="xl"
      h={height}
      px="xl"
      styles={{ root: { textTransform: "none" } }}
    >
      {text}
    </Badge>
  );
}
