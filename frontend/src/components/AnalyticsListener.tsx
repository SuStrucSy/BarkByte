import { useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { pageview } from "@/lib/analytics";

export function AnalyticsListener() {
	const href = useRouterState({ select: (state) => state.location.href });

	useEffect(() => {
		pageview(href);
	}, [href]);

	return null;
}
