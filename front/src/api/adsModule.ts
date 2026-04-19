import { api } from "./axios";
import { ENDPOINTS } from "./endpoints";
import { type CreateAdsRequest, type UpdateAdsRequest } from "./interfaces/ads";

export const createAds = async (payload: CreateAdsRequest) => {
  const response = await api.post(ENDPOINTS.ADS.CREATE, payload);
  return response.data;
};

export const deleteAds = async (id_ads: number) => {
  const response = await api.delete(ENDPOINTS.ADS.DELETE(id_ads));
  return response.data;
};

export const updateAds = async (id_ads: number, payload: UpdateAdsRequest) => {
  const response = await api.patch(ENDPOINTS.ADS.UPDATE(id_ads), payload);
  return response.data;
};
