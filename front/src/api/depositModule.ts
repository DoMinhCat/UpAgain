import { api } from "./axios";
import { ENDPOINTS } from "./endpoints";
import type { DepositDetails } from "./interfaces/deposit";

export const getDepositDetails = async (
  id: number,
): Promise<DepositDetails> => {
  const response = await api.get(ENDPOINTS.DEPOSITS.DETAILS(id));
  return response.data;
};
