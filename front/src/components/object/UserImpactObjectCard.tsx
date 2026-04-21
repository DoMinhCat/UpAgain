import {
  Badge,
  Card,
  Group,
  Image,
  Text,
  Stack,
  Box,
  Title,
  Anchor,
  useComputedColorScheme,
} from "@mantine/core";
import { useColorScheme } from "@mantine/hooks";
import { IconLeaf, IconDroplet, IconBolt } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

interface UserImpactObjectCardProps {
  title: string;
  image: string;
  price: number;
  material: string;
  buyerName: string;
  soldDate: string;
  impact: {
    co2: number; // kg
    water: number; // L
    electricity: number; // kWh
  };
}

export function UserImpactObjectCard({
  title,
  image,
  price,
  material,
  buyerName,
  soldDate,
  impact,
}: UserImpactObjectCardProps) {
  const navigate = useNavigate();
  const theme = useComputedColorScheme("light");
  return (
    <Card
      className="paper"
      data-variant="primary"
      radius="lg"
      p={0}
      style={{
        display: "flex",
        flexDirection: "row",
        overflow: "hidden",
        minHeight: 160,
      }}
    >
      {/* 1. IMAGE SECTION (LEFT) */}
      <Box style={{ width: "25%", minWidth: 140, position: "relative" }}>
        <Image
          src={image}
          alt={title}
          height="100%"
          style={{ objectFit: "cover" }}
        />
        <Badge
          className="badge"
          data-variant="gray"
          pos="absolute"
          bottom={8}
          left={8}
          size="xs"
        >
          {material}
        </Badge>
      </Box>

      {/* 2. GENERAL INFO SECTION (MIDDLE) */}
      <Stack
        p="md"
        gap="xs"
        style={{ flex: 1, borderRight: "1px solid var(--border-color)" }}
      >
        <Box>
          <Title
            order={4}
            className="text"
            data-variant="primary"
            lineClamp={1}
          >
            {title}
          </Title>
        </Box>

        <Stack gap={4}>
          <Group gap={8}>
            <Text size="sm" fw={600}>
              {price}€
            </Text>
            <Text c="dimmed" size="xs">
              •
            </Text>
            <Text size="xs" c="dimmed">
              Sold on {new Date(soldDate).toLocaleDateString()}
            </Text>
          </Group>

          <Text size="xs">
            Sold to{" "}
            <Anchor onClick={() => navigate("/user/profile")} fw={700}>
              {buyerName}
            </Anchor>
          </Text>
        </Stack>
      </Stack>

      {/* 3. IMPACT SECTION (RIGHT) */}
      <Box
        p="md"
        style={{ width: "30%", backgroundColor: "rgba(69, 165, 117, 0.03)" }}
      >
        <Text
          size="xs"
          fw={800}
          tt="uppercase"
          c={
            theme === "dark"
              ? "var(--upagain-light-green)"
              : "var(--upagain-dark-green)"
          }
          ta="center"
          mb="sm"
        >
          Resources saved
        </Text>

        <Stack gap="xs">
          {/* CO2 Savings */}
          <Group justify="space-between" wrap="nowrap">
            <Group gap={6}>
              <IconLeaf size={14} color="var(--upagain-neutral-green)" />
              <Text size="xs" fw={600}>
                CO2
              </Text>
            </Group>
            <Text size="xs" fw={800} c="var(--upagain-neutral-green)">
              {impact.co2}kg
            </Text>
          </Group>

          {/* Water Savings */}
          <Group justify="space-between" wrap="nowrap">
            <Group gap={6}>
              <IconDroplet size={14} color="var(--mantine-color-blue-5)" />
              <Text size="xs" fw={600}>
                Water
              </Text>
            </Group>
            <Text size="xs" fw={800} c="var(--mantine-color-blue-5)">
              {impact.water}L
            </Text>
          </Group>

          {/* Electricity Savings */}
          <Group justify="space-between" wrap="nowrap">
            <Group gap={6}>
              <IconBolt size={14} color="var(--upagain-yellow)" />
              <Text size="xs" fw={600}>
                Energy
              </Text>
            </Group>
            <Text size="xs" fw={800} c="var(--upagain-yellow)">
              {impact.electricity}kWh
            </Text>
          </Group>
        </Stack>
      </Box>
    </Card>
  );
}
