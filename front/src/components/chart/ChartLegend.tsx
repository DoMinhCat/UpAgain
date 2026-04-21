import {
  Group,
  ColorSwatch,
  Text,
  useMantineTheme,
  parseThemeColor,
} from "@mantine/core";

interface LegendItem {
  label: string;
  color: string;
}

interface ChartLegendProps {
  data: LegendItem[];
}

export function ChartLegend({ data }: ChartLegendProps) {
  const theme = useMantineTheme();

  return (
    <Group gap="lg" justify="center" wrap="wrap">
      {data.map((item) => {
        const parsedColor = parseThemeColor({ color: item.color, theme });
        return (
          <Group key={item.label} gap="xs" wrap="nowrap">
            <ColorSwatch
              color={parsedColor.value}
              size={12}
              withShadow={false}
            />
            <Text size="sm" fw={500} c="dimmed">
              {item.label}
            </Text>
          </Group>
        );
      })}
    </Group>
  );
}
