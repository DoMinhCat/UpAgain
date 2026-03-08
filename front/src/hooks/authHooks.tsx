import { useMutation } from "@tanstack/react-query";
import { LoginRequest, type LoginPayload } from "../api/auth";
import { RegisterRequest, type RegisterPayload } from "../api/admin/userModule";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PATHS } from "../routes/paths";
import {
  showErrorNotification,
  showSuccessNotification,
} from "../components/NotificationToast";

export const useLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  return useMutation({
    mutationFn: (payload: LoginPayload) => LoginRequest(payload),
    onSuccess: (data) => {
      const user = login(data.token);

      // redirect
      if (user.role === "admin") {
        navigate(PATHS.ADMIN.HOME);
      } else {
        navigate(PATHS.HOME);
      }
    },
    onError: (error: any) => {
      showErrorNotification("Login failed", error);
    },
  });
};

export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => RegisterRequest(payload),
    onSuccess: (response) => {
      if (response?.status === 201) {
        navigate(PATHS.GUEST.LOGIN);
        showSuccessNotification(
          "Registration Success",
          "You have been registered successfully, log in to continue.",
        );
      }
    },
    onError: (error: any) => {
      showErrorNotification("Registration failed", error);
    },
  });
};
