// src/lib/analytics.ts

const GA_ID = "G-KEPTYEN92T";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

const isProd = import.meta.env.PROD;

let lastPath = "";

export function pageview(path: string) {
  if (!isProd) return;
  if (typeof window === "undefined") return;
  if (!window.gtag) return;
  if (lastPath === path) return;

  lastPath = path;

  window.gtag("config", GA_ID, {
    page_path: path,
  });
}

export function event(action: string, params?: Record<string, unknown>) {
  if (!isProd) return;
  if (typeof window === "undefined") return;
  if (!window.gtag) return;

  window.gtag("event", action, params);
}
