import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { App } from "@/App";
import { ThemeProvider } from "@/components/theme-provider";
import { queryClient } from "@/queryClient";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider
      defaultMode="dark"
      defaultTheme="default"
      storageKey="vite-ui-theme"
    >
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
);
