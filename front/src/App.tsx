import {
  MantineProvider,
  createTheme,
  Button,
  Text,
  Paper,
  ActionIcon,
  TextInput,
  PasswordInput,
  Pill,
  Select,
  Progress,
  NumberInput,
  Badge,
  Divider,
  Timeline,
  Checkbox,
  SegmentedControl,
} from "@mantine/core";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/routes";
import classes from "./styles/GlobalStyles.module.css";
import { Notifications } from "@mantine/notifications";
import { DateTimePicker, DatePickerInput } from "@mantine/dates";
import React, { useEffect } from "react";
import FullScreenLoader from "./components/common/FullScreenLoader";
import OneSignal from "react-onesignal";
("use client");

const UpAgainTheme = createTheme({
  focusRing: "never",
  fontFamily: "Nunito, sans-serif",
  cursorType: "pointer",
  defaultRadius: "sm",

  components: {
    Select: Select.extend({
      defaultProps: {
        classNames: {
          input: classes.input,
          label: classes.label,
        },
      },
    }),
    Button: Button.extend({
      defaultProps: {
        classNames: {
          root: classes.button,
        },
      },
    }),
    Checkbox: Checkbox.extend({
      defaultProps: {
        classNames: {
          input: classes.checkbox,
        },
      },
    }),
    Pill: Pill.extend({
      defaultProps: {
        classNames: {
          root: classes.pill,
        },
      },
    }),
    Badge: Badge.extend({
      defaultProps: {
        classNames: {
          root: classes.badge,
        },
      },
    }),
    Divider: Divider.extend({
      defaultProps: {
        classNames: {
          root: classes.divider,
          label: classes.dividerLabel,
        },
      },
    }),
    Text: Text.extend({
      defaultProps: {
        classNames: {
          root: classes.text,
        },
      },
    }),
    Paper: Paper.extend({
      defaultProps: {
        classNames: {
          root: classes.paper,
        },
      },
    }),
    ActionIcon: ActionIcon.extend({
      defaultProps: {
        classNames: {
          root: classes.actionIcon,
        },
      },
    }),
    TextInput: TextInput.extend({
      defaultProps: {
        classNames: {
          input: classes.input,
          label: classes.label,
        },
      },
    }),
    NumberInput: NumberInput.extend({
      defaultProps: {
        classNames: {
          input: classes.input,
          label: classes.label,
        },
      },
    }),
    PasswordInput: PasswordInput.extend({
      defaultProps: {
        classNames: {
          input: classes.input,
          label: classes.label,
        },
      },
    }),
    DateTimePicker: DateTimePicker.extend({
      defaultProps: {
        classNames: {
          input: classes.input,
          label: classes.label,
        },
      },
    }),
    DatePickerInput: DatePickerInput.extend({
      defaultProps: {
        classNames: {
          input: classes.input,
          label: classes.label,
        },
      },
    }),
    Progress: Progress.extend({
      defaultProps: {
        classNames: {
          section: classes.progress,
        },
      },
    }),
    Timeline: Timeline.extend({
      defaultProps: {
        classNames: {
          item: classes.timelineItem,
          itemBullet: classes.timelineBullet,
          itemTitle: classes.timelineTitle,
        },
      },
    }),
    SegmentedControl: SegmentedControl.extend({
      defaultProps: {
        classNames: {
          root: classes.segmentedControl,
          label: classes.segmentedControlLabel,
          indicator: classes.segmentedControlIndicator,
        },
        // Ensure it always uses the pill shape
        radius: "xl",
        // Set a smooth transition duration
        transitionDuration: 300,
      },
    }),
  },
});

function App() {
  const OneSignalAppId = import.meta.env.VITE_ONESIGNAL_APP_ID;

  // OnseSignal init
  useEffect(() => {
    // Ensure this code runs only on the client side
    if (typeof window !== "undefined") {
      const initOneSignal = async () => {
        try {
          await OneSignal.init({
            appId: OneSignalAppId,
          });
          OneSignal.Debug.setLogLevel("warn");
        } catch (error) {
          console.error("OneSignal init error:", error);
        }
      };
      initOneSignal();
    }
  }, []);

  return (
    <MantineProvider
      theme={UpAgainTheme}
      defaultColorScheme="dark"
      cssVariablesResolver={() => ({
        variables: {},
        light: {
          // these 2 for auto mantine color
          "--mantine-color-body": "#f9f7f2",
          "--mantine-color-text": "#2a2a28",
          // these for custom components that need different color than background
          "--component-color-bg": "#44444e",
          "--component-color-primary": "#45a575",
          "--border-color": "#c7c7c7",
          "--paper-color": "#fcfaf5",
          "--mantine-color-anchor": "#7a5c3e",
          "--mantine-primary-color-filled": "#45a575",
          "--upagain-yellow": "#e3b23c",
          "--upagain-brown": "#7a5c3e",
          "--upagain-dark-green": "#2d6e4d",
          "--upagain-neutral-green": "#45a575",
          "--upagain-light-green": "#bee2c7",
        },
        dark: {
          "--upagain-brown": "#7a5c3e",
          "--upagain-yellow": "#e3b23c",
          "--upagain-dark-green": "#2d6e4d",
          "--upagain-neutral-green": "#45a575",
          "--upagain-light-green": "#bee2c7",
          "--mantine-color-body": "#44444e",
          "--mantine-color-text": "#f9f7f2",
          "--component-color-bg": "#f9f7f2",
          "--component-color-primary": "#45a575",
          "--border-color": "#78756e",
          "--paper-color": "#3a3a3a",
          "--mantine-color-dimmed": "#c9c9c9",
          "--mantine-color-anchor": "#e3b23c",
          "--mantine-primary-color-filled": "#45a575",
        },
      })}
    >
      <React.Suspense fallback={<FullScreenLoader />}>
        <Notifications
          limit={3}
          zIndex={1000}
          pauseResetOnHover="notification"
        />
        <RouterProvider router={router} />
      </React.Suspense>
    </MantineProvider>
  );
}
export default App;
