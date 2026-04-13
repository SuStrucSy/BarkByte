import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { pageview } from "@/lib/analytics";

export function AnalyticsListener() {
  const { location } = useRouterState();

  useEffect(() => {
    const path = location.pathname + location.search + location.hash;

    pageview(path);
  }, [location]);

  return null;
}
