import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";
import { pageview } from "@/lib/analytics";

export function AnalyticsListener() {
  const location = useLocation();

  useEffect(() => {
    pageview(location.pathname + location.search + location.hash);
  }, [location]);

  return null;
}
