import { useQuery } from "@tanstack/react-query";
import {
  getAddressFromCoordinates,
  getCoordinatesFromAddress,
} from "../api/locationModule";
import type { Address, Coordinates } from "../api/interfaces/location";

export const useGetCoordinatesFromAddress = (payload: Address) => {
  return useQuery({
    queryKey: ["coordinates", payload],
    queryFn: () => getCoordinatesFromAddress(payload),
    meta: {
      errorTitle: "Location retrieval failed",
      errorMessage: "An unexpected error occured, please try again later",
    },
  });
};

export const useGetAddressFromCoordinates = (payload: Coordinates) => {
  return useQuery({
    queryKey: ["address", payload],
    queryFn: () => getAddressFromCoordinates(payload),
    meta: {
      errorTitle: "Address retrieval failed",
      errorMessage: "An unexpected error occured, please try again later",
    },
  });
};
