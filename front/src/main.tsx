import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/tiptap/styles.css";
import "@mantine/dropzone/styles.css";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";
import { showErrorNotification } from "./components/NotificationToast.tsx";

// global error handling
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      const title = query.meta?.errorTitle || "Error";
      showErrorNotification(title, query.meta?.errorMessage, error);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      const title = mutation.meta?.errorTitle || "Error";
      showErrorNotification(title, mutation.meta?.errorMessage, error);
    },
  }),
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
