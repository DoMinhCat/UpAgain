import {
  Timeline,
  Group,
  Stack,
  Text,
  Tooltip,
  ActionIcon,
  Box,
  Anchor,
} from "@mantine/core";
import { IconTrash, IconLink } from "@tabler/icons-react";
import dayjs from "dayjs";
import { PhotosCarousel } from "../photo/PhotosCarousel";
import { useNavigate } from "react-router-dom";
import type { Step } from "../../api/interfaces/step";

interface ProjectStepTimelineProps {
  role: "admin" | "user";
  enableDeleteStep?: boolean;
  projectSteps?: Step[];
  onDeleteStep?: (id: number) => void;
  postId?: number;
}

export const ProjectStepTimeline = ({
  role,
  enableDeleteStep = false,
  projectSteps,
  onDeleteStep,
  postId,
}: ProjectStepTimelineProps) => {
  const navigate = useNavigate();

  if (!projectSteps || projectSteps.length === 0) {
    return null;
  }

  return (
    <Timeline mt="xl" lineWidth={4} active={1} bulletSize={24}>
      {projectSteps.map((step, index) => (
        <Timeline.Item
          key={step.id}
          title={
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <Stack gap={2}>
                <Text fw={700} size="lg">
                  {index + 1}. {step.title}
                </Text>
                <Text c="dimmed" size="xs">
                  {dayjs(step.created_at).format("DD/MM/YYYY HH:mm A")}
                </Text>
              </Stack>

              {enableDeleteStep && onDeleteStep && (
                <Tooltip label="Delete this step" position="left">
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={() => onDeleteStep(step.id)}
                    size="lg"
                  >
                    <IconTrash size={20} stroke={1.5} />
                  </ActionIcon>
                </Tooltip>
              )}
            </Group>
          }
        >
          {/* Body Content */}
          <Box mt="md">
            <div dangerouslySetInnerHTML={{ __html: step.description }} />
          </Box>

          {/* Media Section */}
          {step.photos && step.photos.length > 0 && (
            <Box mt="lg">
              <PhotosCarousel
                photos={step.photos}
                initialSlide={0}
                slidesToScroll={step.photos.length > 1 ? 3 : 1}
              />
            </Box>
          )}

          {/* Metadata/Assets Section */}
          {step.items && step.items.length > 0 && (
            <Stack gap="xs" mt="xl" p="sm">
              <Text size="sm" fw={700} c="dimmed" tt="uppercase">
                Items used in this step
              </Text>
              <Group gap="sm">
                <IconLink size={14} color="var(--mantine-color-dimmed)" />
                {step.items.map((item) => (
                  <Anchor
                    key={item.id}
                    size="sm"
                    fw={500}
                    style={{ color: "var(--component-color-primary)" }}
                    onClick={() => {
                      if (role === "admin") {
                        navigate(`/admin/listings/${item.id}`, {
                          state: {
                            from: "postDetails",
                            id_post: postId,
                          },
                        });
                      } else {
                        navigate(`/marketplace/${item.id}`, {
                          state: {
                            from: "postDetails",
                            id_post: postId,
                          },
                        });
                      }
                    }}
                  >
                    {item.title}
                  </Anchor>
                ))}
              </Group>
            </Stack>
          )}
        </Timeline.Item>
      ))}
    </Timeline>
  );
};
