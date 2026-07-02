import { useQuery } from "@tanstack/react-query";
import { getBackendLogs } from "../api/logModule";

export const useGetBackendLogs = () => {
  return useQuery<string>({
    queryKey: ["backendLogs"],
    queryFn: getBackendLogs,
    staleTime: 0,
    meta: {
      errorTitle: "admin:logs.notifications.error_title",
      errorMessage: "admin:logs.notifications.error_message",
    },
  });
};
