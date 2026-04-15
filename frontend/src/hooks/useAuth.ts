import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useLoginLoginAccessToken } from "@/api/endpoints/login/login";
import {
	getUsersReadUserMeQueryKey,
	useUsersRegisterUser,
} from "@/api/endpoints/users/users";
import type { HTTPValidationError } from "@/api/model";
import { handleError } from "@/lib/utils";
import { dispatchAuthChange } from "./useIsLoggedIn";

type UseAuthOptions = {
	redirectTo?: string;
};

const useAuth = ({ redirectTo }: UseAuthOptions = {}) => {
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const signUpMutation = useUsersRegisterUser({
		mutation: {
			onSuccess: () => {
				toast.success("Signed up successfully. Check your email!");
			},
			onError: (err) => {
				handleError(err);
			},
			onSettled: () => {
				queryClient.invalidateQueries({ queryKey: ["users"] });
			},
		},
	});

	const loginMutation = useLoginLoginAccessToken({
		mutation: {
			onSuccess: (data) => {
				if (data.access_token) {
					localStorage.setItem("access_token", data.access_token);
					dispatchAuthChange(true);
					queryClient.invalidateQueries({
						queryKey: getUsersReadUserMeQueryKey(),
					});
					if (redirectTo) {
						const redirectUrl = new URL(redirectTo, window.location.origin);
						if (redirectUrl.origin === window.location.origin) {
							window.location.assign(
								`${redirectUrl.pathname}${redirectUrl.search}${redirectUrl.hash}`,
							);
							return;
						}
					}
					navigate({ to: "/" });
				}
			},
			onError: (err: undefined | HTTPValidationError) => {
				console.error(err);
				handleError(err);
			},
		},
	});

	const logout = () => {
		localStorage.removeItem("access_token");
		queryClient.clear();
		dispatchAuthChange(false);
		navigate({ to: "/" });
	};

	return {
		signUpMutation,
		loginMutation,
		logout,
		error,
		resetError: () => setError(null),
	};
};

export default useAuth;
