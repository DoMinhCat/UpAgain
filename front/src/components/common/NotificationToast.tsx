import { notifications } from "@mantine/notifications";
import type { AxiosError } from "axios";
import type { ApiErrorData } from "../../api/axios";
import i18n from "i18next";

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

  const translatedTitle = i18n.t(title, { defaultValue: title });
  const translatedMessage = i18n.t(message.toString(), {
    defaultValue: message.toString(),
  });

  notifications.show({
    title: translatedTitle,
    message: translatedMessage,
    color: "red",
    autoClose: autoCloseDuration,
  });
};

export const showInfoNotification = (title = "Info", message: string) => {
  const translatedTitle = i18n.t(title, { defaultValue: title });
  const translatedMessage = i18n.t(message, { defaultValue: message });

  notifications.show({
    title: translatedTitle,
    message: translatedMessage,
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
  const translatedTitle = i18n.t(title, { defaultValue: title });
  const translatedMessage = i18n.t(message, { defaultValue: message });

  notifications.show({
    title: translatedTitle,
    message: translatedMessage,
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
