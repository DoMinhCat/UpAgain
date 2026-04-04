import { api } from "./axios";
import { ENDPOINTS } from "./endpoints";
import type { ListingDetails } from "./interfaces/listing";

export const getListingDetails = async (
  id: number,
): Promise<ListingDetails> => {
  const response = await api.get(ENDPOINTS.LISTINGS.DETAILS(id));
  return response.data;
};
