import { useMutation } from "@tanstack/react-query";
import { LoginRequest, type LoginPayload } from "../api/auth";
import { RegisterRequest } from "../api/accountModule";
import { type RegisterPayload } from "../api/interfaces/account";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PATHS } from "../routes/paths";
import { showSuccessNotification } from "../components/common/NotificationToast";

export const useLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  return useMutation({
    mutationFn: (payload: LoginPayload) => LoginRequest(payload),
    meta: {
      errorTitle: "auth:notifications.login_failed_title",
      errorMessage: "auth:notifications.login_failed_message",
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
      errorTitle: "auth:notifications.register_failed_title",
      errorMessage: "auth:notifications.register_failed_message",
    },
    onSuccess: (response, variables) => {
      if (response?.status === 201) {
        navigate(PATHS.GUEST.LOGIN);
        showSuccessNotification(
          "auth:notifications.register_success_title",
          "auth:notifications.register_success_message",
        );
      } else if (response?.status === 200 && response.data?.checkout_url) {
        sessionStorage.setItem(
          "pending_register_payload",
          JSON.stringify(variables),
        );
        window.location.href = response.data.checkout_url;
      }
    },
  });
};
