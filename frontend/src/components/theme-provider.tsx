import { ThemeProviderContext } from "@/hooks/useTheme";
import type { modes, themes } from "@/lib/constants";
import { useEffect, useState } from "react";

type Mode = (typeof modes)[number];

type Theme = (typeof themes)[number];

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultMode?: Mode;
  defaultTheme?: Theme;
  storageKey?: string;
};

export type ThemeProviderState = {
  mode: Mode;
  theme: Theme;
  setMode: (mode: Mode) => void;
  setTheme: (theme: Theme) => void;
};

export function ThemeProvider({
  children,
  defaultMode = "system",
  defaultTheme = "neutral",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [mode, setMode] = useState<Mode>(
    () => (localStorage.getItem(storageKey) as Mode) || defaultMode,
  );

  const [theme, setTheme] = useState<Theme>(
    () =>
      (localStorage.getItem(`${storageKey}-color`) as Theme) || defaultTheme,
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

  useEffect(() => {
    const root = window.document.documentElement;

    // Remove all color theme classes
    root.classList.remove("neutral", "stone", "zinc", "gray", "slate");

    // Apply color theme
    root.classList.add(`${theme}`);
  }, [theme]);

  const value = {
    mode,
    theme,
    setMode: (mode: Mode) => {
      localStorage.setItem(storageKey, mode);
      setMode(mode);
    },
    setTheme: (newTheme: Theme) => {
      localStorage.setItem(`${storageKey}-color`, newTheme);
      setTheme(newTheme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}
