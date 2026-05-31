import { useState, useEffect } from "react";
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
  useComputedColorScheme,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import DOMPurify from "dompurify";
import {
  IconHeartFilled,
  IconBookmarkFilled,
  IconEye,
  IconHeart,
  IconBookmark,
  IconCrownFilled,
} from "@tabler/icons-react";
import { getTimeAgo } from "../../utils/timeUtils";
import { resolveUrl } from "../../utils/imageUtils";

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
  isSponsored?: boolean;
  onClick?: () => void;
  onLike?: (e: React.MouseEvent) => Promise<any> | void;
  onSave?: (e: React.MouseEvent) => Promise<any> | void;
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
  isSponsored,
  onClick,
  onLike,
  onSave,
}: PostCardProps) {
  const { t } = useTranslation(["post", "common", "admin"]);
  const theme = useComputedColorScheme("light");

  const [localLiked, setLocalLiked] = useState<boolean | undefined>(undefined);
  const [localSaved, setLocalSaved] = useState<boolean | undefined>(undefined);
  const [localLikeCount, setLocalLikeCount] = useState<number | undefined>(
    undefined,
  );
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalLiked(undefined);
    setLocalLikeCount(undefined);
  }, [isLiked, likes]);

  useEffect(() => {
    setLocalSaved(undefined);
  }, [isSaved]);

  const displayLiked = localLiked !== undefined ? localLiked : isLiked;
  const displaySaved = localSaved !== undefined ? localSaved : isSaved;
  const displayLikes = localLikeCount !== undefined ? localLikeCount : likes;

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLike) {
      setIsLiking(true);
      try {
        await onLike(e);
        setLocalLiked(!displayLiked);
        setLocalLikeCount(displayLikes + (displayLiked ? -1 : 1));
      } finally {
        setIsLiking(false);
      }
    }
  };

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSave) {
      setIsSaving(true);
      try {
        await onSave(e);
        setLocalSaved(!displaySaved);
      } finally {
        setIsSaving(false);
      }
    }
  };
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
        <Image
          src={resolveUrl(image)}
          alt={title}
          fallbackSrc={`/banners/guest-banner1-${theme}.png`}
          height={200}
          fit="cover"
        />
        {isSponsored && (
          <Badge
            variant="gradient"
            gradient={{ from: "var(--upagain-yellow)", to: "orange" }}
            pos="absolute"
            top={12}
            left={12}
            leftSection={<IconCrownFilled size={10} style={{ display: "block" }} />}
          >
            {t("admin:posts.categories.sponsored", { defaultValue: "Sponsored" })}
          </Badge>
        )}
        <Badge
          className="badge"
          variant={CATEGORY_COLOR[category] ?? "gray"}
          pos="absolute"
          top={12}
          right={12}
        >
          {t(`community:filters.${category}`)}
        </Badge>
      </Card.Section>

      {/* Main Content */}
      <Stack mt="lg" gap="xs">
        <Title order={4} className="text" lineClamp={2} h={24}>
          {title}
        </Title>

        <Text
          size="sm"
          c="dimmed"
          lineClamp={2}
          h={42}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(
              description
                .replace(/<[^>]*>/g, " ")
                .replace(/\s+/g, " ")
                .trim(),
            ),
          }}
        />
      </Stack>

      {/* Author & Time */}
      <Group mt="lg" gap="sm">
        <Avatar
          src={resolveUrl(authorAvatar)}
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
            {getTimeAgo(postedTime, t)}
          </Text>
        </div>
      </Group>

      {/* Footer with Actions */}
      <Card.Section inheritPadding py="sm" mt="md" withBorder>
        <Group justify="space-between">
          <Tooltip label="Views" withArrow>
            <Group gap={6} c="dimmed">
              <IconEye size={18} stroke={1.5} />
              <Text size="xs" fw={500}>
                {views}
              </Text>
            </Group>
          </Tooltip>

          <Group gap="sm">
            <Group gap={4}>
              <Tooltip
                withArrow
                label={
                  currentRole !== "user" && currentRole !== "pro"
                    ? "You are not allowed to interact with this post"
                    : displayLiked
                      ? "Unlike"
                      : "Like post"
                }
              >
                <ActionIcon
                  disabled={currentRole !== "user" && currentRole !== "pro"}
                  className="actionIcon"
                  data-variant="primary"
                  variant="subtle"
                  radius="xl"
                  aria-label="Like post"
                  loading={isLiking}
                  onClick={handleLikeClick}
                >
                  {displayLiked ? (
                    <IconHeartFilled
                      size={18}
                      color="var(--mantine-color-red-6)"
                    />
                  ) : (
                    <IconHeart size={18} color="var(--mantine-color-red-6)" />
                  )}
                </ActionIcon>
              </Tooltip>
              <Text size="xs" fw={600} c="var(--mantine-color-text)">
                {displayLikes}
              </Text>
            </Group>

            <Tooltip
              label={
                currentRole !== "user" && currentRole !== "pro"
                  ? "You are not allowed to interact with this post"
                  : displaySaved
                    ? "Unsave post"
                    : "Save post"
              }
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
                loading={isSaving}
                onClick={handleSaveClick}
              >
                {displaySaved ? (
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
