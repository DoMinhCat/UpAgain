import { Avatar, Group, Text, ActionIcon, Stack, Paper } from "@mantine/core";
import { IconHeartFilled } from "@tabler/icons-react";
import { getTimeAgo } from "../../utils/timeUtils";
import type { PostComment } from "../../api/interfaces/post";

interface PostCommentCardProps {
  comment: PostComment;
  onLike?: (id: number) => void;
  isLiking?: boolean;
  role?: string;
}

export default function PostCommentCard({
  comment,
  onLike,
  isLiking,
  role,
}: PostCommentCardProps) {
  return (
    <Paper className="paper" data-variant="primary" p="md" radius="md">
      <Group align="flex-start" gap="sm">
        <Avatar
          src={comment.user_avatar}
          radius="xl"
          name={comment.user_name}
          color="initials"
          size="sm"
        />
        <Stack gap={4} style={{ flex: 1 }}>
          <Group justify="space-between" align="center">
            <Text fw={600} size="sm">
              {comment.user_name}
            </Text>
            <Text size="xs" c="dimmed">
              {getTimeAgo(comment.created_at)}
            </Text>
          </Group>
          <Text size="sm" c="var(--mantine-color-text)">
            {comment.content}
          </Text>
          <Group gap={4} mt={4}>
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
              <IconHeartFilled size={14} color="var(--mantine-color-red-6)" />
            </ActionIcon>
            <Text size="xs" c="dimmed" fw={500}>
              {comment.like_count}
            </Text>
          </Group>
        </Stack>
      </Group>
    </Paper>
  );
}
