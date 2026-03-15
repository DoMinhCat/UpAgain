import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchPendingValidations, processValidationAction } from "../api/admin/validationModule";

export const usePendingValidations = () => {
  return useQuery({
    queryKey: ["pendingValidations"],
    queryFn: fetchPendingValidations,
  });
};

interface ProcessValidationParams {
  entityType: 'listings' | 'deposits' | 'events';
  id: number;
  action: 'approve' | 'refuse';
  reason?: string;
}

export const useProcessValidation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ entityType, id, action, reason }: ProcessValidationParams) =>
      processValidationAction(entityType, id, action, reason),
    onSuccess: () => {
      // Refresh the list automatically after a successful action
      queryClient.invalidateQueries({ queryKey: ["pendingValidations"] });
    },
  });
};