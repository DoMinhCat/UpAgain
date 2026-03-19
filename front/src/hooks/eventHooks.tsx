import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { showSuccessNotification } from "../components/NotificationToast";
import {
  getAllEvents,
  getEventStats,
  type EventStats,
  type EventsListPagination,
} from "../api/admin/eventModule";

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
