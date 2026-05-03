import { useEffect, useState } from "react";

export function useMediaQuery(query: string, defaultValue = false) {
	const [matches, setMatches] = useState(() => {
		if (typeof window === "undefined") {
			return defaultValue;
		}

		return window.matchMedia(query).matches;
	});

	useEffect(() => {
		const mediaQuery = window.matchMedia(query);
		const updateMatches = () => {
			setMatches(mediaQuery.matches);
		};

		updateMatches();
		mediaQuery.addEventListener("change", updateMatches);

		return () => {
			mediaQuery.removeEventListener("change", updateMatches);
		};
	}, [query]);

	return matches;
}
