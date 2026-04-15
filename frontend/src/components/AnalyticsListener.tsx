import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { pageview } from "@/lib/analytics";

export function AnalyticsListener() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  useEffect(() => {
    pageview(pathname);
  }, [pathname]);

  return null;
}
