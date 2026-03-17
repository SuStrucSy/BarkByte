// router.ts
import { createRouter, ErrorComponent } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export const router = createRouter({
  routeTree,
  context: {
    auth: undefined! as ReturnType<typeof useCurrentUser>,
  },
  defaultErrorComponent: ({ error }) => <ErrorComponent error={error} />,
});
