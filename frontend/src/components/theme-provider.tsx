import { useEffect, useState } from "react";
import { ThemeProviderContext } from "@/hooks/useTheme";
import type { modes } from "@/lib/constants";

type Mode = (typeof modes)[number];

type ThemeProviderProps = {
	children: React.ReactNode;
	defaultMode?: Mode;
	storageKey?: string;
};

export type ThemeProviderState = {
	mode: Mode;
	setMode: (mode: Mode) => void;
};

export function ThemeProvider({
	children,
	defaultMode = "system",
	storageKey = "vite-ui-theme",
	...props
}: ThemeProviderProps) {
	const [mode, setMode] = useState<Mode>(
		() => (localStorage.getItem(storageKey) as Mode) || defaultMode,
	);

	useEffect(() => {
		const root = window.document.documentElement;

		root.classList.remove("light", "dark");

		if (mode === "system") {
			const systemMode = window.matchMedia("(prefers-color-scheme: dark)")
				.matches
				? "dark"
				: "light";

			root.classList.add(systemMode);
			return;
		}

		root.classList.add(mode);
	}, [mode]);

	const value = {
		mode,
		setMode: (mode: Mode) => {
			localStorage.setItem(storageKey, mode);
			setMode(mode);
		},
	};

	return (
		<ThemeProviderContext.Provider {...props} value={value}>
			{children}
		</ThemeProviderContext.Provider>
	);
}
