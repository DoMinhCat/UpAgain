import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createEvent,
  type EventCreationPayload,
  getAllEvents,
  getEventStats,
  type EventStats,
  type EventsListPagination,
  assignEmployeeToEvent,
  getEventDetails,
  type AppEvent,
  type AssignedEmployee,
  getAssignedEmployees,
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
    staleTime: 60 * 1000,
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
    staleTime: 60 * 1000,
    meta: {
      errorTitle: "Error",
      errorMessage: "Failed to fetch event stats.",
    },
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

export const useAssignEmployeeToEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id_event,
      employee_ids,
    }: {
      id_event: number;
      employee_ids: number[];
    }) => assignEmployeeToEvent(id_event, employee_ids),
    onSuccess: () => {
      showSuccessNotification(
        "Assignation successful",
        "Employee(s) assigned to event",
      );
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    meta: {
      errorTitle: "Employee assignation failed",
      errorMessage: "An error occured while assigning employee(s) to event",
    },
  });
};

export const useGetEventDetails = (id_event: number) => {
  return useQuery<AppEvent>({
    queryKey: ["event", id_event],
    queryFn: () => getEventDetails(id_event),
    staleTime: 60 * 1000,
    meta: {
      errorTitle: "Error",
      errorMessage: "Failed to fetch event details.",
    },
  });
};

export const useGetAssignedEmployees = (id_event: number) => {
  return useQuery<AssignedEmployee[]>({
    queryKey: ["assignedEmployees", id_event],
    queryFn: () => getAssignedEmployees(id_event),
    staleTime: 60 * 1000,
    meta: {
      errorTitle: "Error",
      errorMessage: "Failed to fetch assigned employees.",
    },
  });
};
