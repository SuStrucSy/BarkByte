import { Outlet } from "@tanstack/react-router";
import { redirect } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/_authenticated")({
  beforeLoad: ({ context }) => {
    const { isPending, fetchStatus, data } = context.auth;

    // disabled query = isPending: true + fetchStatus: 'idle'
    // actually loading = isPending: true + fetchStatus: 'fetching'
    const isLoading = isPending && fetchStatus === "fetching";

    if (!isLoading && !data) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: () => <Outlet />,
});
