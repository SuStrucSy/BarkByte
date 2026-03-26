// queryClient.ts
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { dispatchAuthChange } from "./hooks/useIsLoggedIn";

const handleApiError = (error: Error) => {
	if (error instanceof AxiosError) {
		const status = error.response?.status;

		if (status === 401) {
			// Token expired or invalid — log out
			localStorage.removeItem("access_token");
			dispatchAuthChange(false);
			queryClient.clear();
			window.location.href = "/login";
		}

		if (status === 403) {
			window.dispatchEvent(
				new CustomEvent("forbidden", {
					detail: { error },
				}),
			);
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
