import { ENDPOINTS } from "./endpoints";
import { api } from "./axios";
import type { Barcode } from "./interfaces/barcode";

export const getDepositCodesOfLatestTransaction = async (
  id: number,
): Promise<Barcode[]> => {
  const response = await api.get(ENDPOINTS.BARCODES.GET(id));
  return response.data;
};

// export const downloadBarcode = async (id: number): Promise<void> => {
//   const response = await api.get(ENDPOINTS.BARCODES.DOWNLOAD(id), {
//     responseType: "blob",
//   });
//   const blob = new Blob([response.data], { type: "application/pdf" });
//   const url = window.URL.createObjectURL(blob);
//   const link = document.createElement("a");
//   link.href = url;
//   link.download = `barcode_${id}.pdf`;
//   link.click();
// };
