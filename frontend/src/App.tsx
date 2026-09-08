// App.tsx
import { RouterProvider } from "@tanstack/react-router";
import { useEffect } from "react";
import { useCurrentUser } from "./hooks/useCurrentUser";
import { router } from "./router";

export function App() {
	const auth = useCurrentUser();
	const authStateKey = `${auth.status}:${auth.fetchStatus}:${auth.data?.id ?? ""}`;

	useEffect(() => {
		void authStateKey;
		router.invalidate();
	}, [authStateKey]);

	return <RouterProvider router={router} context={{ auth }} />;
}
