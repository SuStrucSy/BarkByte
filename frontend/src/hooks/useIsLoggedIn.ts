// hooks/useIsLoggedIn.ts
import { useState, useEffect, useCallback } from 'react';

export function useIsLoggedIn() {
  const [isLoggedIn, setIsLoggedIn] = useState(() =>
    !!localStorage.getItem("access_token")
  );

  // Handle storage events from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token') {
        setIsLoggedIn(!!e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Manual polling for same-tab changes (localStorage doesn't emit events)
  const checkToken = useCallback(() => {
    const token = localStorage.getItem("access_token");
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    // Check immediately on mount
    checkToken();

    // Poll every 2 seconds (lightweight)
    const interval = setInterval(checkToken, 2000);

    return () => clearInterval(interval);
  }, [checkToken]);

  return isLoggedIn;
}
