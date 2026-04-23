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
import { IconLeaf, IconDroplet, IconBolt } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../routes/paths";

interface UserImpactObjectCardProps {
  title: string;
  description?: string;
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
  description,
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
        minHeight: 180,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "var(--mantine-shadow-md)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* 1. IMAGE SECTION (LEFT) */}
      <Box
        style={{
          width: "22%",
          minWidth: 160,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Image
          src={image}
          alt={title}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <Badge
          className="badge"
          data-variant="gray"
          pos="absolute"
          top={12}
          right={12}
          size="xs"
          style={{
            backdropFilter: "blur(8px)",
            backgroundColor: "rgba(255,255,255,0.8)",
            color: "var(--upagain-dark-green)",
            boxShadow: "var(--mantine-shadow-xs)",
          }}
        >
          {material}
        </Badge>
      </Box>

      {/* 2. GENERAL INFO SECTION (MIDDLE) */}
      <Stack
        p="lg"
        gap="xs"
        style={{ flex: 1, borderRight: "1px solid var(--border-color)" }}
      >
        <Stack gap={4}>
          <Title
            order={4}
            className="text"
            data-variant="primary"
            lineClamp={1}
            mb="md"
          >
            {title}
          </Title>
          <Text size="sm" lineClamp={2} style={{ lineHeight: 1.4 }}>
            {description ||
              "A second-hand object carefully restored and redirected to a new home. A second-hand object carefully restored and redirected to a new home. A second-hand object carefully restored and redirected to a new home. A second-hand object carefully restored and redirected to a new home."}
          </Text>
        </Stack>

        <Stack gap={8} mt="auto">
          <Group gap={12} wrap="nowrap">
            <Text
              size="md"
              fw={800}
              c={
                theme === "dark"
                  ? "var(--upagain-light-green)"
                  : "var(--upagain-dark-green)"
              }
            >
              {price === 0 ? "FREE" : `${price}€`}
            </Text>
            <Box
              style={{
                width: 1,
                height: 12,
                backgroundColor: "var(--border-color)",
              }}
            />
            <Text size="xs" c="dimmed">
              Sold on {new Date(soldDate).toLocaleDateString()}
            </Text>
          </Group>

          <Text size="xs">
            Saved by{" "}
            <Anchor
              onClick={() => navigate(PATHS.USER.PROFILE)}
              fw={700}
              underline="hover"
            >
              {buyerName}
            </Anchor>
          </Text>
        </Stack>
      </Stack>

      {/* 3. IMPACT SECTION (RIGHT) */}
      <Stack
        p="lg"
        gap="md"
        style={{
          width: "28%",
          minWidth: 200,
          backgroundColor:
            theme === "dark"
              ? "rgba(69, 165, 117, 0.05)"
              : "rgba(69, 165, 117, 0.03)",
        }}
      >
        <Stack gap={2}>
          <Text
            size="xs"
            fw={800}
            tt="uppercase"
            c={
              theme === "dark"
                ? "var(--upagain-light-green)"
                : "var(--upagain-dark-green)"
            }
            style={{ letterSpacing: 0.5 }}
          >
            Resources Redirected
          </Text>
          <Text size="10px" c="dimmed">
            Your green contribution for this item.
          </Text>
        </Stack>

        <Stack gap="xs">
          <ImpactRow
            icon={<IconLeaf size={14} color="var(--upagain-neutral-green)" />}
            label="Carbon"
            value={`${impact.co2}kg`}
            color="var(--upagain-neutral-green)"
          />
          <ImpactRow
            icon={<IconDroplet size={14} color="var(--mantine-color-blue-5)" />}
            label="Water"
            value={`${impact.water}L`}
            color="var(--mantine-color-blue-5)"
          />
          <ImpactRow
            icon={<IconBolt size={14} color="var(--upagain-yellow)" />}
            label="Energy"
            value={`${impact.electricity}kWh`}
            color="var(--upagain-yellow)"
          />
        </Stack>
      </Stack>
    </Card>
  );
}

function ImpactRow({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <Group
      justify="space-between"
      wrap="nowrap"
      p="xs"
      style={{
        borderRadius: "var(--mantine-radius-sm)",
        backgroundColor: "var(--mantine-color-body)",
        border: "1px solid var(--border-color)",
      }}
    >
      <Group gap={8}>
        {icon}
        <Text size="xs" fw={600}>
          {label}
        </Text>
      </Group>
      <Text size="xs" fw={800} c={color}>
        {value}
      </Text>
    </Group>
  );
}
