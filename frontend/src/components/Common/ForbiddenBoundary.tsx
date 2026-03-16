import { useState, useEffect } from "react";
import { useLocation } from "@tanstack/react-router";
import ErrorComponent from "@/components/Common/Error";

export function ForbiddenBoundary({ children }: { children: React.ReactNode }) {
  const [forbiddenState, setForbiddenState] = useState<{
    error: Error;
    pathname: string;
  } | null>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    const handler = (e: CustomEvent) =>
      setForbiddenState({ error: e.detail.error, pathname });
    window.addEventListener("forbidden", handler as EventListener);
    return () =>
      window.removeEventListener("forbidden", handler as EventListener);
  }, [pathname]);

  // Derive: only show error if pathname hasn't changed since the error occurred
  const showError = forbiddenState && forbiddenState.pathname === pathname;

  if (showError) {
    return <ErrorComponent error={forbiddenState.error} />;
  }

  return <>{children}</>;
}
