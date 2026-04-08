import { useEffect, useState } from "react";

export function useIsLoggedIn() {
	const [isLoggedIn, setIsLoggedIn] = useState(
		() => !!localStorage.getItem("access_token"),
	);

	useEffect(() => {
		// Same-tab login/logout events
		const handleAuthChange = (e: CustomEvent) =>
			setIsLoggedIn(e.detail.isLoggedIn);
		// Cross-tab sync
		const handleStorageChange = (e: StorageEvent) => {
			if (e.key === "access_token") setIsLoggedIn(!!e.newValue);
		};

		window.addEventListener("auth-change", handleAuthChange as EventListener);
		window.addEventListener("storage", handleStorageChange);
		return () => {
			window.removeEventListener(
				"auth-change",
				handleAuthChange as EventListener,
			);
			window.removeEventListener("storage", handleStorageChange);
		};
	}, []);

	return isLoggedIn;
}

// Helper to fire the event
export function dispatchAuthChange(isLoggedIn: boolean) {
	window.dispatchEvent(
		new CustomEvent("auth-change", { detail: { isLoggedIn } }),
	);
}
