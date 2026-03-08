import "@mantine/core/styles.css";
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
} from "@mantine/core";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/routes";
import classes from "./styles/GlobalStyles.module.css";
import { Notifications } from "@mantine/notifications";

const UpAgainTheme = createTheme({
  focusRing: "never",
  fontFamily: "Nunito, sans-serif",
  cursorType: "pointer",

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
    Pill: Pill.extend({
      defaultProps: {
        classNames: {
          root: classes.pill,
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
    PasswordInput: PasswordInput.extend({
      defaultProps: {
        classNames: {
          input: classes.input,
          label: classes.label,
        },
      },
    }),
  },
});

function App() {
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
          "--component-color-primary": "#45a575", // opposite
          "--border-color": "#c7c7c7",
          "--paper-border-color": "#f6f4f4",
          "--mantine-color-anchor": "#7a5c3e",
          "--mantine-primary-color-filled": "#45a575",
        },
        dark: {
          "--mantine-color-body": "#44444e",
          "--mantine-color-text": "#f9f7f2",
          "--component-color-bg": "#f9f7f2",
          "--component-color-primary": "#45a575",
          "--border-color": "#78756e",
          "--paper-border-color": "#3a3a3a",
          "--mantine-color-dimmed": "#c9c9c9",
          "--mantine-color-anchor": "#e3b23c",
          "--mantine-primary-color-filled": "#45a575",
        },
      })}
    >
      <Notifications limit={5} zIndex={1000} />
      <RouterProvider router={router} />
    </MantineProvider>
  );
}
export default App;
