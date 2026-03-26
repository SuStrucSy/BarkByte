import { createContext, useContext } from "react";
import type { ThemeProviderState } from "@/components/theme-provider";

const initialState: ThemeProviderState = {
	mode: "system",
	theme: "default",
	setMode: () => null,
	setTheme: () => null,
};

export const ThemeProviderContext =
	createContext<ThemeProviderState>(initialState);

export const useTheme = () => {
	const context = useContext(ThemeProviderContext);

	if (context === undefined)
		throw new Error("useTheme must be used within a ThemeProvider");

	return context;
};
