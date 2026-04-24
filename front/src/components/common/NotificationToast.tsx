import { notifications } from "@mantine/notifications";
import type { AxiosError } from "axios";
import type { ApiErrorData } from "../../api/axios";

const autoCloseDuration = 5000;

export const showErrorNotification = (
  title: string = "Error",
  errorMessage?: string,
  error?: string | AxiosError<ApiErrorData>,
) => {
  let message: string | Error;
  message = "An unexpected error occurred.";

  if (error) {
    if (typeof error === "string") {
      message = error;
    } else if (error.response?.data) {
      const data = error.response.data;

      if (typeof data === "string") {
        message = data;
      } else {
        message = data.message || data.error || errorMessage || message;
      }
    } else if (error.message) {
      message = error.message;
    } else {
      message = errorMessage || message;
    }
  } else if (errorMessage) {
    message = errorMessage;
  }

  notifications.show({
    title,
    message: message.toString(),
    color: "red",
    autoClose: autoCloseDuration,
  });
};

export const showInfoNotification = (title = "Info", message: string) => {
  // default title is "Info" if not provided any title
  notifications.show({
    title: title,
    message: message,
    color: "blue",
    autoClose: autoCloseDuration,
    styles: {
      root: {
        border: "1px solid var(--border-color)",
        borderRadius: "var(--mantine-radius-md)",
        padding: "var(--mantine-spacing-lg)",
        boxShadow: "var(--mantine-shadow-lg)",

        "&::before": {
          backgroundColor: "var(--mantine-color-blue-6)",
        },
      },
    },
  });
};

export const showSuccessNotification = (title = "Success", message: string) => {
  // default title is "Success" if not provided any title
  notifications.show({
    title: title,
    message: message,
    color: "green",
    autoClose: autoCloseDuration,
    styles: {
      root: {
        border: "1px solid var(--border-color)",
        borderRadius: "var(--mantine-radius-md)",
        padding: "var(--mantine-spacing-lg)",
        boxShadow: "var(--mantine-shadow-lg)",

        "&::before": {
          backgroundColor: "var(--upagain-neutral-green)",
        },
      },
    },
  });
};
