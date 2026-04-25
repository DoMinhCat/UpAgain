import {
  Avatar,
  Badge,
  Card,
  Group,
  Image,
  Text,
  Stack,
  ActionIcon,
  Box,
  Title,
  Tooltip,
  useComputedColorScheme,
} from "@mantine/core";
import {
  IconMapPin,
  IconCalendarEvent,
  IconClock,
  IconUsers,
} from "@tabler/icons-react";
import { getTimeAgo } from "../../utils/timeUtils";
import { useTranslation } from "react-i18next";
import DOMPurify from "dompurify";
import { resolveUrl } from "../../utils/imageUtils";

interface EventCardProps {
  orientation?: "vertical" | "horizontal";
  category: string;
  title: string;
  description: string;
  authorName: string;
  authorAvatar: string;
  createdAt: string;
  eventDate: string;
  image: string;
  price: number | string; // e.g., 0 or "Free"
  city: string;
  registeredCount: number;
  onclick: () => void;
}

export function EventCard({
  onclick,
  orientation = "vertical",
  category,
  title,
  description,
  authorName,
  authorAvatar,
  createdAt,
  eventDate,
  image,
  price,
  city,
  registeredCount,
}: EventCardProps) {
  const { t } = useTranslation();
  const theme = useComputedColorScheme("light");
  const isHorizontal = orientation === "horizontal";
  const displayPrice = price === 0 || price === "Free" ? "Free" : `${price}€`;
  const categoryValue = t(`common:event_categories.${category}` as any, {
    defaultValue: category.charAt(0).toUpperCase() + category.slice(1),
  });
  return (
    <Card
      className="paper"
      data-variant="primary"
      onClick={onclick}
      radius="lg"
      p={0}
      withBorder
      shadow="md"
      style={{
        display: "flex",
        flexDirection: isHorizontal ? "row" : "column",
        overflow: "hidden",
        cursor: "pointer",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow = "var(--mantine-shadow-xl)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "var(--mantine-shadow-md)";
      }}
    >
      {/* 1. IMAGE SECTION */}
      <Box
        style={{
          width: isHorizontal ? "40%" : "100%",
          height: isHorizontal ? "auto" : 200,
          position: "relative",
        }}
      >
        <Image
          src={resolveUrl(image)}
          alt={title}
          fallbackSrc={`/banners/event-banner1-${theme}.png`}
          height="100%"
          fit="cover"
        />
        <Stack pos="absolute" top={12} left={12} gap={6}>
          <Badge
            className="badge"
            variant={
              category === "other"
                ? "gray"
                : category === "workshop"
                  ? "blue"
                  : category === "conference"
                    ? "green"
                    : category === "meetups"
                      ? "yellow"
                      : "red"
            }
            size="sm"
          >
            {categoryValue}
          </Badge>
          <Badge
            variant="default"
            size="sm"
            tt="lowercase"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              color: "#2a2a28",
              border: "none",
              backdropFilter: "blur(4px)",
            }}
            leftSection={<IconUsers size={12} />}
          >
            {t("events:detail.registered", { count: registeredCount })}
          </Badge>
        </Stack>
      </Box>

      {/* 2. CONTENT SECTION */}
      <Stack p="md" gap="xs" style={{ flex: 1 }} justify="space-between">
        <Box>
          <Group justify="space-between" mb={4}>
            <Group gap={4} c="dimmed">
              <IconClock size={14} />
              <Text size="xs" fw={500}>
                {getTimeAgo(createdAt)}
              </Text>
            </Group>
            <Text
              size="xs"
              fw={800}
              c={
                displayPrice === "Free"
                  ? "var(--upagain-neutral-green)"
                  : "var(--upagain-yellow)"
              }
            >
              {displayPrice}
            </Text>
          </Group>

          <Title order={4} className="text" variant="primary" lineClamp={1}>
            {title}
          </Title>

          <Text
            size="sm"
            c="dimmed"
            lineClamp={isHorizontal ? 3 : 2}
            mt={4}
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(description),
            }}
          />
        </Box>

        <Stack gap="sm">
          {/* Metadata: Location & Date */}
          <Group gap="md">
            <Group gap={4}>
              <IconMapPin size={14} />
              <Text size="xs" fw={600}>
                {city}
              </Text>
            </Group>
            <Group gap={4}>
              <IconCalendarEvent
                size={14}
                color="var(--upagain-neutral-green)"
              />
              <Text size="xs" fw={600}>
                {new Date(eventDate).toLocaleDateString()}
              </Text>
            </Group>
          </Group>

          {/* Footer: Creator info */}
          <Group justify="space-between">
            <Group gap={8}>
              <Avatar
                size="sm"
                src={authorAvatar}
                radius="xl"
                name={authorName}
                color="initials"
              />
              <Text size="xs" fw={700} c="var(--mantine-color-text)">
                {authorName}
              </Text>
            </Group>

            <Tooltip label="Register for this event">
              <ActionIcon
                className="actionIcon"
                data-variant="primary"
                radius="xl"
                size="sm"
              >
                <IconCalendarEvent size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Stack>
      </Stack>
    </Card>
  );
}
