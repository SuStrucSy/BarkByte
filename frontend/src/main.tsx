import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { App } from "@/App";
import { ThemeProvider } from "@/components/theme-provider";
import { queryClient } from "@/queryClient";
import "./styles/index.css";

const root = document.getElementById("root") as HTMLElement;

ReactDOM.createRoot(root).render(
	<StrictMode>
		<ThemeProvider
			defaultMode="dark"
			defaultTheme="default"
			storageKey="vite-ui-theme"
		>
			<QueryClientProvider client={queryClient}>
				<App />
			</QueryClientProvider>
		</ThemeProvider>
	</StrictMode>,
);
