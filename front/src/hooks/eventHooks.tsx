import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createEvent,
  type EventCreationPayload,
  getAllEvents,
  getEventStats,
  type EventStats,
  type EventsListPagination,
} from "../api/admin/eventModule";
import { showSuccessNotification } from "../components/NotificationToast";

export const useGetAllEvents = (
  page?: number,
  limit?: number,
  search?: string,
  status?: string,
  sort?: string,
) => {
  return useQuery<EventsListPagination>({
    queryKey: ["events", page, limit, search, status, sort],
    queryFn: () => getAllEvents(page, limit, search, status, sort),
    meta: {
      errorTitle: "Error",
      errorMessage: "Failed to fetch events.",
    },
  });
};

export const useGetEventStats = () => {
  return useQuery<EventStats>({
    queryKey: ["eventStats"],
    queryFn: getEventStats,
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (event: EventCreationPayload) => createEvent(event),
    onSuccess: () => {
      showSuccessNotification("Success", "New event created");
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    meta: {
      errorTitle: "Event creation failed",
      errorMessage: "An error occured while creating new event",
    },
  });
};
