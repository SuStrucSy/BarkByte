// queryClient.ts
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { dispatchAuthChange } from "./hooks/useIsLoggedIn";

const INVALID_CREDENTIALS_DETAIL = "Could not validate credentials";

const getErrorDetail = (error: AxiosError): unknown => {
	const data = error.response?.data;
	return data && typeof data === "object" && "detail" in data
		? data.detail
		: undefined;
};

const isInvalidCredentialsError = (error: unknown) => {
	if (!(error instanceof AxiosError)) {
		return false;
	}

	const status = error.response?.status;
	return (
		status === 401 ||
		(status === 403 && getErrorDetail(error) === INVALID_CREDENTIALS_DETAIL)
	);
};

const handleApiError = (
	error: Error,
	options?: { dispatchForbidden?: boolean },
) => {
	if (error instanceof AxiosError) {
		const status = error.response?.status;

		if (isInvalidCredentialsError(error)) {
			// Token expired or invalid — log out
			localStorage.removeItem("access_token");
			dispatchAuthChange(false);
			queryClient.clear();
			return;
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
			retry: (failureCount, error) => {
				if (isInvalidCredentialsError(error)) {
					return false;
				}
				return failureCount < 3;
			},
		},
	},
	queryCache: new QueryCache({
		onError: (error) => handleApiError(error, { dispatchForbidden: true }),
	}),
	mutationCache: new MutationCache({
		onError: (error) => handleApiError(error, { dispatchForbidden: false }),
	}),
});
