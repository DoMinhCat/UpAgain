import { notifications } from "@mantine/notifications";

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
    autoClose: 5000,
    styles: {
      root: {
        border: "1px solid var(--border-color)",
        borderRadius: "var(--mantine-radius-md)",
        padding: "var(--mantine-spacing-md)",
        boxShadow: "var(--mantine-shadow-lg)",

        // This ensures the red "indicator" on the left still looks sharp
        "&::before": {
          backgroundColor: "var(--mantine-color-red-6)",
        },
      },
    },
  });
};
