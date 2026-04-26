import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createEvent,
  getAllEvents,
  getEventStats,
  assignEmployeeToEvent,
  getEventDetails,
  getAssignedEmployees,
  unassignEmployee,
  updateEventStatus,
  updateEvent,
  registerToEvent,
  cancelRegistration,
} from "../api/eventModule";
import {
  type EventCreationPayload,
  type EventStats,
  type EventsListPagination,
  type AppEvent,
  type AssignedEmployee,
  type UnassignEmployeePayload,
  type UpdateEventPayload,
  type EventRegistrationPayload,
} from "../api/interfaces/event";
import { showSuccessNotification } from "../components/common/NotificationToast";

export const useGetAllEvents = (
  page?: number,
  limit?: number,
  search?: string,
  status?: string,
  sort?: string,
  category?: string,
  city?: string,
  validation?: boolean,
  future_only?: boolean,
) => {
  return useQuery<EventsListPagination>({
    queryKey: [
      "events",
      page,
      limit,
      search,
      status,
      sort,
      category,
      city,
      validation,
      future_only,
    ],
    queryFn: () =>
      getAllEvents(
        page,
        limit,
        search,
        status,
        sort,
        category,
        city,
        validation,
        future_only,
      ),
    staleTime: 60 * 1000,
    meta: {
      errorTitle: "Error",
      errorMessage: "Failed to fetch events.",
    },
  });
};

export const useGetEventStats = (time?: string) => {
  return useQuery<EventStats>({
    queryKey: ["eventStats", time],
    queryFn: () => getEventStats(time),
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
      queryClient.invalidateQueries({ queryKey: ["histories"] });
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
      start_at,
      end_at,
    }: {
      id_event: number;
      employee_ids: number[];
      start_at: string;
      end_at: string;
    }) => assignEmployeeToEvent(id_event, employee_ids, start_at, end_at),
    onSuccess: () => {
      showSuccessNotification(
        "Assignation successful",
        "Employee(s) assigned to event",
      );
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["availableEmployees"] });
      queryClient.invalidateQueries({ queryKey: ["assignedEmployees"] });
      queryClient.invalidateQueries({ queryKey: ["histories"] });
      queryClient.invalidateQueries({ queryKey: ["employeeSchedule"] });
    },
    meta: {
      errorTitle: "Employee assignation failed",
      errorMessage: "An error occured while assigning employee(s) to event",
    },
  });
};

export const useGetEventDetails = (
  id_event: number,
  enabled: boolean = true,
) => {
  return useQuery<AppEvent>({
    queryKey: ["event", id_event],
    enabled: enabled,
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

export const useUnAssignEmployee = (id_event: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id_employee: UnassignEmployeePayload): Promise<void> =>
      unassignEmployee(id_event, id_employee),
    onSuccess: () => {
      showSuccessNotification(
        "Unassignation successful",
        "Employee unassigned from event",
      );
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["availableEmployees"] });
      queryClient.invalidateQueries({ queryKey: ["assignedEmployees"] });
      queryClient.invalidateQueries({ queryKey: ["histories"] });
      queryClient.invalidateQueries({ queryKey: ["employeeSchedule"] });
    },
    meta: {
      errorTitle: "Employee unassignation failed",
      errorMessage: "An error occured while unassigning employee from event",
    },
  });
};

export const useUpdateEventStatus = (id_event: number, status: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (): Promise<void> => updateEventStatus(id_event, status),
    onSuccess: () => {
      showSuccessNotification(
        status === "cancelled"
          ? "Cancellation successful"
          : status === "pending"
            ? "Approval successful"
            : "Event updated successfully",
        status === "cancelled"
          ? "Event cancelled successfully"
          : status === "pending"
            ? "Event approved successfully"
            : "Event updated successfully",
      );
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event", id_event] });
      queryClient.invalidateQueries({ queryKey: ["availableEmployees"] });
      queryClient.invalidateQueries({ queryKey: ["histories"] });
    },
    meta: {
      errorTitle: "Event status update failed",
      errorMessage: "An error occured while updating event status",
    },
  });
};

export const useUpdateEvent = (id_event: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (event: UpdateEventPayload): Promise<void> =>
      updateEvent(id_event, event),
    onSuccess: () => {
      showSuccessNotification(
        "Event updated successfully",
        "Event has been updated",
      );
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event", id_event] });
      queryClient.invalidateQueries({ queryKey: ["availableEmployees"] });
      queryClient.invalidateQueries({ queryKey: ["histories"] });
    },
    meta: {
      errorTitle: "Event update failed",
      errorMessage: "An error occured while updating event",
    },
  });
};

export const useApproveRefuseEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: number;
      status: string;
    }): Promise<void> => updateEventStatus(id, status),
    onSuccess: (_data, { status }) => {
      showSuccessNotification(
        status === "approved" ? "Event approved" : "Event refused",
        status === "approved"
          ? "Event has been approved successfully"
          : "Event has been refused successfully",
      );
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["validationStats"] });
      queryClient.invalidateQueries({ queryKey: ["allItemsHistory"] });
      queryClient.invalidateQueries({ queryKey: ["histories"] });
    },
    meta: {
      errorTitle: "Event action failed",
      errorMessage: "Could not update the event status",
    },
  });
};

export const useRegisterToEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: EventRegistrationPayload): Promise<void> =>
      registerToEvent(payload),
    onSuccess: (_data, payload) => {
      showSuccessNotification(
        "Event registered successfully",
        "Event has been registered",
      );
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({
        queryKey: ["event", payload.id_event],
      });
      queryClient.invalidateQueries({ queryKey: ["availableEmployees"] });
    },
    meta: {
      errorTitle: "Event registration failed",
      errorMessage: "An error occured while registering to event",
    },
  });
};

export const useCancelRegistration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: EventRegistrationPayload): Promise<void> =>
      cancelRegistration(payload),
    onSuccess: (_data, payload) => {
      showSuccessNotification(
        "Registration cancelled successfully",
        "Registration to event has been cancelled",
      );
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({
        queryKey: ["event", payload.id_event],
      });
      queryClient.invalidateQueries({ queryKey: ["availableEmployees"] });
    },
    meta: {
      errorTitle: "Registration cancellation failed",
      errorMessage: "An error occured while cancelling registration to event",
    },
  });
};
