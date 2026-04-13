export function track(event: string, params?: Record<string, unknown>) {
  if (import.meta.env.DEV) return;
  if (typeof gtag !== "function") return;
  gtag("event", event, params);
}

export function trackPageView(path: string) {
  if (import.meta.env.DEV) return;
  if (typeof gtag !== "function") return;
  gtag("event", "page_view", { page_path: path });
}
