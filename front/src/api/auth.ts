import { api } from "./axios";

// pure communication with backend
export interface LoginPayload {
  email: string;
  password: string;
}

export const LoginRequest = async (payload: LoginPayload) => {
  const response = await api.post("/login/", payload);
  return response.data;
};
