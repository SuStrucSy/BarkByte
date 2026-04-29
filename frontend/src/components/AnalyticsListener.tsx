import { useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
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
