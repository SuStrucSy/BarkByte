// import { NuqsAdapter } from "nuqs/adapters/react";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import {
  createRouter,
  ErrorComponent,
  RouterProvider,
} from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { routeTree } from "./routeTree.gen";
import "./index.css";
import { AxiosError } from "axios";
import { ThemeProvider } from "@/components/theme-provider";

const handleApiError = (error: Error) => {
  if (error instanceof AxiosError) {
    // Access the status code safely
    const status = error.response ? error.response.status : undefined;
    if (status !== undefined && [401, 403].includes(status)) {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
  }
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min fresh
      gcTime: 30 * 60 * 1000, // 30 min cached
      refetchOnWindowFocus: false,
    },
  },
  queryCache: new QueryCache({
    onError: handleApiError,
  }),
  mutationCache: new MutationCache({
    onError: handleApiError,
  }),
});

const router = createRouter({
  routeTree,
  defaultErrorComponent: ({ error }) => <ErrorComponent error={error} />,
});
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* <NuqsAdapter> */}
      <ThemeProvider
        defaultMode="dark"
        defaultTheme="neutral"
        storageKey="vite-ui-theme"
      >
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </ThemeProvider>
    {/* </NuqsAdapter> */}
  </StrictMode>,
);
