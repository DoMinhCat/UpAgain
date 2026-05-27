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
  getMyEvents,
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
  type EventRegistrationResponse,
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
      errorTitle: "common:notifications.error",
      errorMessage: "events:notifications.error_fetching_events",
    },
  });
};

export const useGetEventStats = (time?: string) => {
  return useQuery<EventStats>({
    queryKey: ["eventStats", time],
    queryFn: () => getEventStats(time),
    staleTime: 60 * 1000,
    meta: {
      errorTitle: "common:notifications.error",
      errorMessage: "events:notifications.error_fetching_stats",
    },
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (event: EventCreationPayload) => createEvent(event),
    onSuccess: () => {
      showSuccessNotification(
        "events:notifications.create_success_title",
        "events:notifications.create_success_message",
      );
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["histories"] });
    },
    meta: {
      errorTitle: "common:notifications.error",
      errorMessage: "events:notifications.error_creating_event",
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
        "events:notifications.assign_success_title",
        "events:notifications.assign_success_message",
      );
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["availableEmployees"] });
      queryClient.invalidateQueries({ queryKey: ["assignedEmployees"] });
      queryClient.invalidateQueries({ queryKey: ["histories"] });
      queryClient.invalidateQueries({ queryKey: ["employeeSchedule"] });
    },
    meta: {
      errorTitle: "common:notifications.error",
      errorMessage: "events:notifications.error_assigning_employee",
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
      errorTitle: "common:notifications.error",
      errorMessage: "events:notifications.error_fetching_details",
    },
  });
};

export const useGetAssignedEmployees = (id_event: number) => {
  return useQuery<AssignedEmployee[]>({
    queryKey: ["assignedEmployees", id_event],
    queryFn: () => getAssignedEmployees(id_event),
    staleTime: 60 * 1000,
    meta: {
      errorTitle: "common:notifications.error",
      errorMessage: "events:notifications.error_fetching_employees",
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
        "events:notifications.unassign_success_title",
        "events:notifications.unassign_success_message",
      );
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["availableEmployees"] });
      queryClient.invalidateQueries({ queryKey: ["assignedEmployees"] });
      queryClient.invalidateQueries({ queryKey: ["histories"] });
      queryClient.invalidateQueries({ queryKey: ["employeeSchedule"] });
    },
    meta: {
      errorTitle: "common:notifications.error",
      errorMessage: "events:notifications.error_unassigning_employee",
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
          ? "events:notifications.cancel_success_title"
          : status === "pending"
            ? "events:notifications.approve_success_title"
            : "events:notifications.update_success_title",
        status === "cancelled"
          ? "events:notifications.cancel_success_message"
          : status === "pending"
            ? "events:notifications.approve_success_message"
            : "events:notifications.update_success_message",
      );
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event", id_event] });
      queryClient.invalidateQueries({ queryKey: ["availableEmployees"] });
      queryClient.invalidateQueries({ queryKey: ["histories"] });
    },
    meta: {
      errorTitle: "common:notifications.error",
      errorMessage: "events:notifications.error_updating_status",
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
        "events:notifications.update_success_title",
        "events:notifications.update_success_message",
      );
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event", id_event] });
      queryClient.invalidateQueries({ queryKey: ["availableEmployees"] });
      queryClient.invalidateQueries({ queryKey: ["histories"] });
    },
    meta: {
      errorTitle: "common:notifications.error",
      errorMessage: "events:notifications.error_updating_event",
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
        status === "approved"
          ? "events:notifications.approve_success_title"
          : "events:notifications.refuse_success_title",
        status === "approved"
          ? "events:notifications.approve_success_message"
          : "events:notifications.refuse_success_message",
      );
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["validationStats"] });
      queryClient.invalidateQueries({ queryKey: ["allItemsHistory"] });
      queryClient.invalidateQueries({ queryKey: ["histories"] });
    },
    meta: {
      errorTitle: "common:notifications.error",
      errorMessage: "events:notifications.error_updating_status",
    },
  });
};

export const useRegisterToEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      payload: EventRegistrationPayload,
    ): Promise<EventRegistrationResponse> => registerToEvent(payload),
    onSuccess: (_data, payload) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({
        queryKey: ["event", payload.id_event],
      });
      queryClient.invalidateQueries({ queryKey: ["availableEmployees"] });
      queryClient.invalidateQueries({ queryKey: ["myEvents"] });
    },
    meta: {
      errorTitle: "common:notifications.error",
      errorMessage: "events:notifications.error_registering",
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
        "events:notifications.cancel_registration_success_title",
        "events:notifications.cancel_registration_success_message",
      );
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({
        queryKey: ["event", payload.id_event],
      });
      queryClient.invalidateQueries({ queryKey: ["availableEmployees"] });
      queryClient.invalidateQueries({ queryKey: ["myEvents"] });
    },
    meta: {
      errorTitle: "common:notifications.error",
      errorMessage: "events:notifications.error_cancelling_registration",
    },
  });
};

export const useGetMyEvents = () => {
  return useQuery<AppEvent[]>({
    queryKey: ["myEvents"],
    queryFn: () => getMyEvents(),
    staleTime: 60 * 1000,
    meta: {
      errorTitle: "common:notifications.error",
      errorMessage: "events:notifications.error_fetching_my_events",
    },
  });
};
