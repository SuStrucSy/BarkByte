import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { App } from "@/App";
import { ThemeProvider } from "@/components/theme-provider";
import { queryClient } from "@/queryClient";
import { router } from "@/router";
import { trackPageView } from "@/lib/analytics";
import "./styles/index.css";

// router.subscribe("onResolved", () => {
//   trackPageView(router.state.location.pathname + router.state.location.search);
// });

const root = document.getElementById("root") as HTMLElement;

ReactDOM.createRoot(root).render(
  <StrictMode>
    <ThemeProvider defaultMode="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
);
