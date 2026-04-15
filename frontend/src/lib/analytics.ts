declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

const isProd = import.meta.env.PROD;

export function pageview(url: string) {
  if (!isProd) {
    console.log("[GA event]", "page_view", url);
  }
  window.gtag?.("event", "page_view", {
    page_path: url,
    page_location: window.location.origin + url,
    page_title: document.title,
  });
}

export function event(name: string, params?: Record<string, any>) {
  if (!isProd) {
    console.log("[GA event]", name, params);
  }
  window.gtag?.("event", name, params);
}
