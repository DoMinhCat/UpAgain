import { useMutation } from "@tanstack/react-query";
import { LoginRequest, type LoginPayload } from "../api/auth";
import { RegisterRequest } from "../api/accountModule";
import { type RegisterPayload } from "../api/interfaces/account";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PATHS } from "../routes/paths";
import { showSuccessNotification } from "../components/NotificationToast";

export const useLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  return useMutation({
    mutationFn: (payload: LoginPayload) => LoginRequest(payload),
    meta: {
      errorTitle: "Login failed",
      errorMessage: "Could not log in to your account",
    },
    onSuccess: (data) => {
      const user = login(data.token);

      // redirect
      if (user.role === "admin") {
        navigate(PATHS.ADMIN.HOME);
      } else {
        navigate(PATHS.HOME);
      }
    },
  });
};

export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => RegisterRequest(payload),
    meta: {
      errorTitle: "Registration failed",
      errorMessage: "Could not register your account",
    },
    onSuccess: (response) => {
      if (response?.status === 201) {
        navigate(PATHS.GUEST.LOGIN);
        showSuccessNotification(
          "Registration Success",
          "You have been registered successfully, log in to continue.",
        );
      }
    },
  });
};
