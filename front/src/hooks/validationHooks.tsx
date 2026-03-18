import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchPendingValidations,
  processValidationAction,
  fetchAllItemsHistory,
} from "../api/admin/validationModule";

export const usePendingValidations = () => {
  return useQuery({
    queryKey: ["pendingValidations"],
    queryFn: fetchPendingValidations,
    meta: {
      errorTitle: "Fetching Failed",
      errorMessage: "Could not load pending validations",
    },
    staleTime: 1000 * 60, // 1min
  });
};

interface ProcessValidationParams {
  entityType: "listings" | "deposits" | "events";
  id: number;
  action: "approve" | "refuse";
  reason?: string;
}

export const useProcessValidation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ entityType, id, action, reason }: ProcessValidationParams) =>
      processValidationAction(entityType, id, action, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingValidations"] });
      queryClient.invalidateQueries({ queryKey: ["allItemsHistory"] });
    },
    meta: {
      errorTitle: "Validation Failed",
      errorMessage: "Could not process the validation action",
    },
  });
};

export const useAllItemsHistory = () => {
  return useQuery({
    queryKey: ["allItemsHistory"],
    queryFn: fetchAllItemsHistory,
    meta: {
      errorTitle: "Fetching Failed",
      errorMessage: "Could not load items history",
    },
    staleTime: 1000 * 60, // 1min
  });
};
