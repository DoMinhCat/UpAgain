import { api } from "../axios";
import { ENDPOINTS } from "../endpoints";
import { type TotalScore } from "../interfaces/user";

export const getUserStats = async (): Promise<TotalScore> => {
  const response = await api.get(ENDPOINTS.ADMIN.USERS.SCORE_STATS);
  return response.data;
};
