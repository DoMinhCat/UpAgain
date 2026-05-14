import { useQuery } from "@tanstack/react-query";
import {
  getAddressFromCoordinates,
  getCoordinatesFromAddress,
} from "../api/locationModule";
import type { Address, Coordinates } from "../api/interfaces/location";

export const useGetCoordinatesFromAddress = (payload: Address | null) => {
  return useQuery({
    queryKey: ["coordinates", payload],
    queryFn: () => getCoordinatesFromAddress(payload!),
    enabled: false,
    meta: {
      errorTitle: "Location retrieval failed",
      errorMessage: "An unexpected error occurred, please try again later",
    },
  });
};

export const useGetAddressFromCoordinates = (payload: Coordinates | null) => {
  return useQuery({
    queryKey: ["address", payload],
    queryFn: () => getAddressFromCoordinates(payload!),
    enabled: false,
    meta: {
      errorTitle: "Address retrieval failed",
      errorMessage: "An unexpected error occurred, please try again later",
    },
  });
};
