const GA_ID = "G-KEPTYEN92T";
const isAnalyticsEnabled = import.meta.env.PROD;
const GTAG_SCRIPT_ID = "google-analytics";

declare global {
	interface Window {
		dataLayer?: unknown[][];
		gtag?: (...args: unknown[]) => void;
	}
}

let isInitialized = false;
let lastPath = "";

function ensureAnalytics() {
	if (!isAnalyticsEnabled) return false;
	if (typeof window === "undefined") return false;

	window.dataLayer ??= [];
	window.gtag ??= (...args: unknown[]) => {
		window.dataLayer?.push(args);
	};

	if (isInitialized) return true;

	if (!document.getElementById(GTAG_SCRIPT_ID)) {
		const script = document.createElement("script");
		script.id = GTAG_SCRIPT_ID;
		script.async = true;
		script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
		document.head.appendChild(script);
	}

	window.gtag("js", new Date());
	window.gtag("config", GA_ID, { send_page_view: false });
	isInitialized = true;
	return true;
}

export function pageview(path: string) {
	if (!ensureAnalytics()) return;
	if (lastPath === path) return;

	lastPath = path;

	window.gtag?.("event", "page_view", {
		page_location: new URL(path, window.location.origin).toString(),
		page_path: path,
		page_title: document.title,
	});
}

export function event(action: string, params?: Record<string, unknown>) {
	if (!ensureAnalytics()) return;

	window.gtag?.("event", action, params);
}
