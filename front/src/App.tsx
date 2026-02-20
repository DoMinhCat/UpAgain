import "@mantine/core/styles.css";
import { MantineProvider, createTheme } from "@mantine/core";
import { RouterProvider } from "react-router-dom";
import { router } from "../routes";

const UpAgainTheme = createTheme({
  focusRing: "never",
  fontFamily: "Nunito, sans-serif",

  components: {
    // customize components of Mantine here
  },
});

function App() {
  return (
    <MantineProvider
      theme={UpAgainTheme}
      defaultColorScheme="dark"
      cssVariablesResolver={(theme) => ({
        variables: {},
        light: {
          // these 2 for auto mantine color
          "--mantine-color-body": "#f9f7f2",
          "--mantine-color-text": "#2a2a28",
          // these for custom components that need different color than background
          "--component-color-bg": "#44444e",
          "--component-color-primary": "#45a575", // opposite
          "--border-color": "#c7c7c7",
        },
        dark: {
          "--mantine-color-body": "#44444e",
          "--mantine-color-text": "#f9f7f2",
          "--component-color-bg": "#f9f7f2",
          "--component-color-primary": "#45a575",
          "--border-color": "#78756e",
          "--mantine-color-dimmed": "#c9c9c9",
        },
      })}
    >
      <RouterProvider router={router} />
    </MantineProvider>
  );
}

export default App;
