import { api } from "./axios";
import { ENDPOINTS } from "./endpoints";
import type { Address, Coordinates } from "./interfaces/location";

export const getCoordinatesFromAddress = async (
  payload: Address,
): Promise<Coordinates> => {
  const response = await api.get(ENDPOINTS.LOCATION.GET_COOR, {
    params: {
      street: payload.street,
      postal_code: payload.postal_code,
      city: payload.city,
    },
  });
  return response.data;
};

export const getAddressFromCoordinates = async (
  payload: Coordinates,
): Promise<Address> => {
  const response = await api.get(ENDPOINTS.LOCATION.GET_ADDRESS, {
    params: { lat: payload.latitude, lng: payload.longitude },
  });
  return response.data;
};
