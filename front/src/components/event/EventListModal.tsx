import { Modal, Stack, Text, ScrollArea } from "@mantine/core";
import { EventCard } from "./EventCard";
import type { AppEvent } from "../../api/interfaces/event";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../routes/paths";
import { useTranslation } from "react-i18next";

interface EventListModalProps {
  opened: boolean;
  onClose: () => void;
  events: AppEvent[];
  dateTitle: string;
}

export function EventListModal({
  opened,
  onClose,
  events,
  dateTitle,
}: EventListModalProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Stack gap={0}>
          <Text fw={900} size="xl">
            {t("events:my_events.events_on")}
          </Text>
          <Text size="sm" c="dimmed">
            {dateTitle}
          </Text>
        </Stack>
      }
      size="lg"
      radius="lg"
      scrollAreaComponent={ScrollArea.Autosize}
    >
      <Stack gap="md" py="xs">
        {events.length > 0 ? (
          events.map((e) => (
            <EventCard
              key={e.id}
              orientation="horizontal"
              onclick={() => {
                onClose();
                navigate(
                  `${PATHS.EVENTS.HOME}/${e.category === "meetups" ? e.category : e.category + "s"}/${e.id}`,
                );
              }}
              category={e.category}
              title={e.title}
              description={e.description}
              authorName={e.employee_name || "Unknown"}
              authorAvatar={e.employee_avatar || ""}
              createdAt={e.created_at}
              eventDate={e.start_at}
              image={e.images?.[0] || ""}
              price={e.price}
              city={e.city}
              registeredCount={e.registered}
            />
          ))
        ) : (
          <Text ta="center" py="xl" c="dimmed">
            {t("events:empty_state.no_events")}
          </Text>
        )}
      </Stack>
    </Modal>
  );
}
