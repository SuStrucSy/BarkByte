// router.ts
import { createRouter, ErrorComponent } from "@tanstack/react-router";
import type { useCurrentUser } from "@/hooks/useCurrentUser";
import { routeTree } from "./routeTree.gen";

type Auth = ReturnType<typeof useCurrentUser>;

export type RouterContext = {
	auth: Auth | null;
};

export const router = createRouter({
	routeTree,
	context: {
		auth: null,
	},
	defaultErrorComponent: ({ error }) => <ErrorComponent error={error} />,
});
