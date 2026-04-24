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
  IconHeart,
  IconBookmark,
} from "@tabler/icons-react";
import { getTimeAgo } from "../../utils/timeUtils";

interface PostCardProps {
  currentRole: string;
  title: string;
  description: string;
  image: string;
  category: string;
  authorName: string;
  authorAvatar: string;
  postedTime: string;
  views: number;
  likes: number;
  isLiked?: boolean;
  isSaved?: boolean;
  onClick?: () => void;
  onLike?: (e: React.MouseEvent) => void;
  onSave?: (e: React.MouseEvent) => void;
}

const CATEGORY_COLOR: Record<string, string> = {
  tutorial: "blue",
  project: "green",
  tips: "yellow",
  case_study: "violet",
  news: "red",
  other: "gray",
};

// TODO: Add crown if sponsored on the top left
export default function PostCard({
  currentRole,
  title,
  description,
  image,
  category,
  authorName,
  authorAvatar,
  postedTime,
  views,
  likes,
  isLiked,
  isSaved,
  onClick,
  onLike,
  onSave,
}: PostCardProps) {
  return (
    <Card
      className="paper"
      data-variant="primary"
      padding="lg"
      radius="lg"
      style={{
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.15s ease",
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (onClick) e.currentTarget.style.transform = "translateY(-3px)";
      }}
      onMouseLeave={(e) => {
        if (onClick) e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Image with Overlay Badge */}
      <Card.Section pos="relative">
        <Image src={image} alt={title} height={200} fit="cover" />
        <Badge
          className="badge"
          variant={CATEGORY_COLOR[category] ?? "gray"}
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
          <Group gap={6} c="dimmed">
            <IconEye size={18} stroke={1.5} />
            <Text size="xs" fw={500}>
              {views}
            </Text>
          </Group>

          <Group gap="sm">
            <Group gap={4}>
              <ActionIcon
                disabled={currentRole !== "user" && currentRole !== "pro"}
                className="actionIcon"
                data-variant="primary"
                variant="subtle"
                radius="xl"
                aria-label="Like post"
                onClick={(e) => {
                  e.stopPropagation();
                  onLike?.(e);
                }}
              >
                {isLiked ? (
                  <IconHeartFilled
                    size={18}
                    color="var(--mantine-color-red-6)"
                  />
                ) : (
                  <IconHeart size={18} color="var(--mantine-color-red-6)" />
                )}
              </ActionIcon>
              <Text size="xs" fw={600} c="var(--mantine-color-text)">
                {likes}
              </Text>
            </Group>

            <Tooltip
              label={isSaved ? "Unsave post" : "Save post"}
              position="top"
              withArrow
            >
              <ActionIcon
                disabled={currentRole !== "user" && currentRole !== "pro"}
                className="actionIcon"
                data-variant="primary"
                variant="subtle"
                radius="xl"
                aria-label="Save post"
                onClick={(e) => {
                  e.stopPropagation();
                  onSave?.(e);
                }}
              >
                {isSaved ? (
                  <IconBookmarkFilled size={18} color="var(--upagain-yellow)" />
                ) : (
                  <IconBookmark size={18} color="var(--upagain-yellow)" />
                )}
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </Card.Section>
    </Card>
  );
}
