// src/components/AnalyticsListener.tsx

import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { pageview } from "@/lib/analytics";

export function AnalyticsListener() {
  const location = useRouterState({
    select: (s) => s.location,
  });

  useEffect(() => {
    const path = location.pathname + location.search + location.hash;

    pageview(path);
  }, [location]);

  return null;
}
