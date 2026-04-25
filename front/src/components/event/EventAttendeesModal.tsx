import { Modal, Stack, Group, Text, Avatar } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import type { Account } from "../../api/interfaces/account";

interface EventAttendeesModalProps {
  opened: boolean;
  onClose: () => void;
  attendees: Account[];
}

export function EventAttendeesModal({
  opened,
  onClose,
  attendees,
}: EventAttendeesModalProps) {
  const navigate = useNavigate();

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Event Attendees"
      centered
      size="sm"
    >
      <Stack gap="xs">
        {attendees && attendees.length > 0 ? (
          <Group gap="sm" wrap="wrap" mt="sm">
            {attendees.map((attendee) => (
              <Group
                key={attendee.id}
                gap={8}
                onClick={() => {
                  navigate("#"); // TODO: Navigate to their profile
                  onClose?.();
                }}
                style={{
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  padding: "4px 12px",
                  borderRadius: "100px", // Pill shape to match your inputs/buttons
                  border: "1px solid transparent",
                  backgroundColor: "rgba(0,0,0,0.03)", // Subtle background
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor =
                    "var(--upagain-neutral-green)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.03)";
                  e.currentTarget.style.borderColor = "transparent";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <Avatar
                  src={attendee.avatar}
                  size={24}
                  radius="xl"
                  alt={attendee.username}
                  name={attendee.username}
                  color="initials"
                />

                <Text
                  size="sm"
                  fw={600}
                  style={{ color: "inherit" }} // Inherits color changes from group if needed
                >
                  {attendee.username}
                </Text>
              </Group>
            ))}
          </Group>
        ) : (
          <Text c="dimmed" size="sm" ta="center">
            No attendees yet.
          </Text>
        )}
      </Stack>
    </Modal>
  );
}
