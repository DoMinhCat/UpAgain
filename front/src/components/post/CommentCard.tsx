import {
  Avatar,
  Group,
  Text,
  ActionIcon,
  Stack,
  Paper,
  Tooltip,
} from "@mantine/core";
import { IconHeartFilled, IconTrash, IconHeart } from "@tabler/icons-react";
import { getTimeAgo } from "../../utils/timeUtils";
import type { PostComment } from "../../api/interfaces/post";
import { useTranslation } from "react-i18next";

interface CommentCardProps {
  comment: PostComment;
  onLike?: (id: number) => void;
  onDelete?: (id: number) => void;
  isLiking?: boolean;
  isDeleting?: boolean;
  enableDelete?: boolean;
  role?: string;
  isLiked?: boolean;
}

export default function CommentCard({
  comment,
  onLike,
  onDelete,
  isLiking,
  isDeleting,
  enableDelete,
  role,
  isLiked,
}: CommentCardProps) {
  const { t } = useTranslation(["post", "admin"]);

  return (
    <Paper
      className="paper"
      data-variant="primary"
      p="md"
      radius="md"
      withBorder
    >
      <Group align="flex-start" gap="sm" wrap="nowrap">
        <Avatar
          src={comment.user_avatar}
          radius="xl"
          name={comment.user_name}
          color="initials"
          size="sm"
        />
        <Stack gap={4} style={{ flex: 1 }}>
          <Group justify="space-between" align="center">
            <Group gap="xs">
              <Text fw={700} size="sm">
                {comment.id_account !== 0
                  ? comment.user_name
                  : t("admin:posts.details.anonymous", {
                      defaultValue: "Anonymous",
                    })}
              </Text>
              <Text size="xs" c="dimmed">
                • {getTimeAgo(comment.created_at)}
              </Text>
            </Group>

            {enableDelete && (
              <Tooltip label={t("admin:posts.details.delete_comment_tooltip")}>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="sm"
                  onClick={() => onDelete?.(comment.id)}
                  loading={isDeleting}
                >
                  <IconTrash size={16} stroke={1.5} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>

          <Text size="sm" c="var(--mantine-color-text)" style={{ lineHeight: 1.5 }}>
            {comment.content}
          </Text>

          <Group gap="xs" mt={4}>
            <Group gap={4}>
              <ActionIcon
                className="actionIcon"
                disabled={role !== "user" && role !== "pro"}
                data-variant="primary"
                variant="subtle"
                size="xs"
                radius="xl"
                aria-label="Like comment"
                onClick={() => onLike?.(comment.id)}
                loading={isLiking}
              >
                {isLiked ? (
                  <IconHeartFilled size={14} color="var(--mantine-color-red-6)" />
                ) : (
                  <IconHeart size={14} color="var(--mantine-color-red-6)" />
                )}
              </ActionIcon>
              <Text size="xs" c="dimmed" fw={600}>
                {comment.like_count}
              </Text>
            </Group>
          </Group>
        </Stack>
      </Group>
    </Paper>
  );
}
