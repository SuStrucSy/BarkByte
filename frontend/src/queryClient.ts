// queryClient.ts
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

const handleApiError = (error: Error) => {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    if (status !== undefined && [401, 403].includes(status)) {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
  }
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
  queryCache: new QueryCache({ onError: handleApiError }),
  mutationCache: new MutationCache({ onError: handleApiError }),
});
