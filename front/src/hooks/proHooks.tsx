import { useQuery } from "@tanstack/react-query";
import { getProAnalytics } from "../api/proModule";

export const useGetProAnalytics = (idAccount: number | undefined) => {
  return useQuery({
    queryKey: ["proAnalytics", idAccount],
    queryFn: () => getProAnalytics(idAccount!),
    enabled: idAccount !== undefined && !isNaN(idAccount),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
