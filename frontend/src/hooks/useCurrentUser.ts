// hooks/useCurrentUser.ts
import {
	getUsersReadUserMeQueryKey,
	useUsersReadUserMe,
} from "@/api/endpoints/users/users";
import { useIsLoggedIn } from "./useIsLoggedIn";

export function useCurrentUser() {
	const isLoggedIn = useIsLoggedIn();
	return useUsersReadUserMe({
		query: {
			queryKey: getUsersReadUserMeQueryKey(),
			enabled: isLoggedIn,
			staleTime: 5 * 60 * 1000, // 5 minutes
		},
	});
}
