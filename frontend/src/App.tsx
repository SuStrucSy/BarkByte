// App.tsx
import { RouterProvider } from "@tanstack/react-router";
import { useCurrentUser } from "./hooks/useCurrentUser";
import { router } from "./router";

export function App() {
	const auth = useCurrentUser();
	return <RouterProvider router={router} context={{ auth }} />;
}
