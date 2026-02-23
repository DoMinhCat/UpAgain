import { notifications } from "@mantine/notifications";

const autoCloseDuration = 5000;
export const showErrorNotification = (error: any, title = "Error") => {
  let message = "An unexpected error occurred.";

  if (error.response) {
    const data = error.response.data;

    if (typeof data === "string") {
      message = data;
    } else if (data && typeof data === "object" && data.message) {
      message = data.message;
    } else {
      message = JSON.stringify(data);
    }
  } else {
    message = error.message;
  }

  notifications.show({
    title: title,
    message: message,
    color: "red",
    // icon: <IconX size={18} />,
    autoClose: autoCloseDuration,
    styles: {
      root: {
        border: "1px solid var(--border-color)",
        borderRadius: "var(--mantine-radius-md)",
        padding: "var(--mantine-spacing-lg)",
        boxShadow: "var(--mantine-shadow-lg)",

        // This ensures the red "indicator" on the left still looks sharp
        "&::before": {
          backgroundColor: "var(--mantine-color-red-6)",
        },
      },
    },
  });
};

export const showInfoNotification = (title = "Info", message: string) => {
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

// TODO: success (and warning) noti
