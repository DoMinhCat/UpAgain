import { notifications } from "@mantine/notifications";

const autoCloseDuration = 5000;
export const showErrorNotification = (title = "Error", error: any) => {
  // default title is "Error" if not provided any title
  let message = "An unexpected error occurred.";

  if (typeof error === "string") {
    message = error;
  } else if (error?.response) {
    const data = error.response.data;

    if (typeof data === "string") {
      message = data;
    } else if (data && typeof data === "object" && data.message) {
      message = data.message;
    } else if (data && typeof data === "object" && data.error) {
      message = data.error;
    } else {
      message = JSON.stringify(data);
    }
  } else if (error?.message) {
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
          backgroundColor: "var(--mantine-color-green-6)",
        },
      },
    },
  });
};
