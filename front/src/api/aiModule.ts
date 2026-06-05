import { api } from "./axios";
import { ENDPOINTS } from "./endpoints";

export const sendChatbotMessage = async (message: string): Promise<string> => {
  const response = await api.post(ENDPOINTS.CHATBOT, { message });
  return response.data.response;
};
