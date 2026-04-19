import { api } from "./axios";
import { ENDPOINTS } from "./endpoints";
import { type CreateAdsRequest } from "./interfaces/ads";

export const createAds = async (payload: CreateAdsRequest) => {
  const response = await api.post(ENDPOINTS.ADS.CREATE, payload);
  return response.data;
};
