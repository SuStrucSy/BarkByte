// hooks/useCurrentUser.ts
import { useUsersReadUserMe } from '@/api/endpoints/users/users.gen';
import { useIsLoggedIn } from './useIsLoggedIn';

export function useCurrentUser() {
  const isLoggedIn = useIsLoggedIn();
  return useUsersReadUserMe({
    query: {
      enabled: isLoggedIn,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  });
}
