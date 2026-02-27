import { api } from "./axios";
import { jwtDecode } from "jwt-decode";
import { ENDPOINTS } from "./endpoints";

// pure communication with backend
export interface LoginPayload {
  email: string;
  password: string;
}

export const LoginRequest = async (payload: LoginPayload) => {
  const response = await api.post(ENDPOINTS.AUTH.LOGIN, payload);
  return response.data;
};

// Decode JWT to get User's info
interface DecodedToken {
  user_id: number;
  email: string;
  role: string;
  exp: number;
}

export const getToken = () => {
  return localStorage.getItem("token");
};

export const isTokenExpired = () => {
  const token = getToken();
  if (!token) return true;

  const decoded = jwtDecode<DecodedToken>(token);
  return decoded.exp * 1000 < Date.now();
};

export interface RegisterPayload {
  email: string;
  password: string;
  username: string;
  phone: string;
  role: string;
}

export const RegisterRequest = async (payload: RegisterPayload) => {
  const response = await api.post(ENDPOINTS.AUTH.REGISTER, payload);
  return response.data;
};
