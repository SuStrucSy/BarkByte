import { createRootRoute, Outlet } from "@tanstack/react-router";
import React, { Suspense } from "react";

import NotFound from "@/components/Common/NotFound";
import { Toaster } from "@/components/ui/sonner";
import { AnalyticsListener } from "@/components/AnalyticsListener";

const loadDevtools = () =>
  Promise.all([
    import("@tanstack/react-router-devtools"),
    import("@tanstack/react-query-devtools"),
  ]).then(([routerDevtools, reactQueryDevtools]) => {
    return {
      default: () => (
        <>
          <routerDevtools.TanStackRouterDevtools position="top-right" />
          <reactQueryDevtools.ReactQueryDevtools />
        </>
      ),
    };
  });

const TanStackDevtools =
  import.meta.env.PROD || import.meta.env.VITE_ENABLE_TANSTACK_DEVTOOLS !== "true"
    ? () => null
    : React.lazy(loadDevtools);

export const Route = createRootRoute({
  component: () => (
    <>
      <AnalyticsListener />
      <Outlet />
      <Toaster richColors position="top-center" />
      <Suspense>
        <TanStackDevtools />
      </Suspense>
    </>
  ),
  notFoundComponent: () => <NotFound />,
});
