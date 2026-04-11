import { useQuery } from "@tanstack/react-query";
import { getUserStats } from "../api/userModule";

const STALE_TIME = 60 * 1000;

export const useGetTotalScore = () => {
  return useQuery({
    queryKey: ["totalScore"],
    queryFn: () => getUserStats(),
    staleTime: STALE_TIME,
    meta: {
      errorTitle: "Error",
      errorMessage: "Failed to fetch total score.",
    },
  });
};
