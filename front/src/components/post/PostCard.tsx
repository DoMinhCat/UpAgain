import {
  Stack,
  Text,
  Title,
  Card,
  Image,
  Badge,
  Group,
  Avatar,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import {
  IconHeartFilled,
  IconBookmarkFilled,
  IconEye,
} from "@tabler/icons-react";
import { getTimeAgo } from "../../utils/timeUtils";

interface PostCardProps {
  title: string;
  description: string;
  image: string;
  category: string;
  authorName: string;
  authorAvatar: string;
  postedTime: string; // Should be an ISO string, e.g., "2026-04-19T14:30:00Z"
  views: number;
  likes: number;
}

// TODO: Add crown if sponsored on the top left
export default function PostCard({
  title,
  description,
  image,
  category,
  authorName,
  authorAvatar,
  postedTime,
  views,
  likes,
}: PostCardProps) {
  return (
    <Card
      className="paper"
      data-variant="primary"
      padding="lg"
      radius="lg" // UpAgain prefers rounder borders
      style={{ overflow: "hidden" }}
    >
      {/* Image with Overlay Badge */}
      <Card.Section pos="relative">
        <Image src={image} alt={title} height={200} fit="cover" />
        <Badge
          className="badge"
          variant={
            category === "other"
              ? "gray"
              : category === "tutorial"
                ? "blue"
                : category === "project"
                  ? "green"
                  : category === "tips"
                    ? "yellow"
                    : category === "case_study"
                      ? "violet"
                      : "red"
          }
          pos="absolute"
          top={12}
          right={12}
        >
          {category}
        </Badge>
      </Card.Section>

      {/* Main Content */}
      <Stack mt="lg" gap="xs">
        <Title order={4} className="text" lineClamp={2}>
          {title}
        </Title>

        <Text size="sm" c="dimmed" lineClamp={2}>
          {description}
        </Text>
      </Stack>

      {/* Author & Time */}
      <Group mt="lg" gap="sm">
        <Avatar
          src={authorAvatar}
          radius="xl"
          alt={authorName}
          name={authorName}
          color="initials"
        />
        <div style={{ flex: 1 }}>
          <Text fw={600} size="sm" c="var(--mantine-color-text)">
            {authorName}
          </Text>
          <Text size="xs" c="dimmed">
            {getTimeAgo(postedTime)}
          </Text>
        </div>
      </Group>

      {/* Footer with Actions */}
      <Card.Section inheritPadding py="sm" mt="md" withBorder>
        <Group justify="space-between">
          {/* Left side: Views */}
          <Group gap={6} c="dimmed">
            <IconEye size={18} stroke={1.5} />
            <Text size="xs" fw={500}>
              {views}
            </Text>
          </Group>

          {/* Right side: Immediate Actions */}
          <Group gap="sm">
            {/* Action 1: Like (Proper Grouping) */}
            <Group gap={4}>
              <ActionIcon
                className="actionIcon"
                data-variant="primary"
                variant="subtle"
                radius="xl"
                aria-label="Like post"
              >
                <IconHeartFilled size={18} color="var(--mantine-color-red-6)" />
              </ActionIcon>
              <Text size="xs" fw={600} c="var(--mantine-color-text)">
                {likes}
              </Text>
            </Group>

            {/* Action 2: Save */}
            <Tooltip label="Save post" position="top" withArrow>
              <ActionIcon
                className="actionIcon"
                data-variant="primary"
                variant="subtle"
                radius="xl"
                aria-label="Save post"
              >
                <IconBookmarkFilled size={18} color="var(--upagain-yellow)" />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </Card.Section>
    </Card>
  );
}
