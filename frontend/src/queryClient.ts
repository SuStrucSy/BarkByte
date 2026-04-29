// queryClient.ts
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { dispatchAuthChange } from "./hooks/useIsLoggedIn";

const handleApiError = (
	error: Error,
	options?: { dispatchForbidden?: boolean },
) => {
	if (error instanceof AxiosError) {
		const status = error.response?.status;

		if (status === 401) {
			// Token expired or invalid — log out
			localStorage.removeItem("access_token");
			dispatchAuthChange(false);
			queryClient.clear();
			window.location.href = "/login";
		}

		if (status === 403 && options?.dispatchForbidden) {
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
	queryCache: new QueryCache({
		onError: (error) => handleApiError(error, { dispatchForbidden: true }),
	}),
	mutationCache: new MutationCache({
		onError: (error) => handleApiError(error, { dispatchForbidden: false }),
	}),
});
