import { useQuery } from "@tanstack/react-query";
import {
  getUserImpact,
  getUserImpactItems,
  getUserStats,
} from "../api/userModule";
import type {
  UserImpactStats,
  UserImpactItemsPagination,
  TotalScore,
} from "../api/interfaces/user";

const STALE_TIME = 2 * 60 * 1000;

// TODO: hooks for global impact /users/impact/global/

export const useGetUserImpact = () => {
  return useQuery<UserImpactStats>({
    queryKey: ["userImpact"],
    queryFn: getUserImpact,
    staleTime: STALE_TIME,
    meta: {
      errorTitle: "common:notifications.error",
      errorMessage: "common:notifications.error",
    },
  });
};

export const useGetUserImpactItems = (page: number, limit: number) => {
  return useQuery<UserImpactItemsPagination>({
    queryKey: ["userImpactItems", page, limit],
    queryFn: () => getUserImpactItems(page, limit),
    staleTime: STALE_TIME,
    meta: {
      errorTitle: "common:notifications.error",
      errorMessage: "common:notifications.error",
    },
  });
};

export const useGetTotalScore = () => {
  return useQuery<TotalScore>({
    queryKey: ["totalScore"],
    queryFn: () => getUserStats(),
    staleTime: STALE_TIME,
    meta: {
      errorTitle: "common:notifications.error",
      errorMessage: "common:notifications.fetch_error",
    },
  });
};
