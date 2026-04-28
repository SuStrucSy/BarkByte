import { useEffect, useRef, useState } from "react";

interface UsePendingSpecimenDrawerLayoutOptions {
	detailsOpen: boolean;
	staleReviewWarning: string | null;
}

export function usePendingSpecimenDrawerLayout({
	detailsOpen,
	staleReviewWarning,
}: UsePendingSpecimenDrawerLayoutOptions) {
	const [hasSideBySideReviewLayout, setHasSideBySideReviewLayout] =
		useState(false);
	const [sideBySideTabContentHeight, setSideBySideTabContentHeight] =
		useState(0);
	const [sideBySideDrawerHeight, setSideBySideDrawerHeight] = useState(0);
	const sideBySideHeaderRef = useRef<HTMLDivElement | null>(null);
	const sideBySideTabsHeaderRef = useRef<HTMLDivElement | null>(null);
	const sideBySideRightPaneRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const mediaQuery = window.matchMedia("(min-width: 1024px)");
		const updateSideBySideLayout = () => {
			setHasSideBySideReviewLayout(mediaQuery.matches);
		};

		updateSideBySideLayout();
		mediaQuery.addEventListener("change", updateSideBySideLayout);

		return () => {
			mediaQuery.removeEventListener("change", updateSideBySideLayout);
		};
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: stale warning changes alter measured drawer content height.
	useEffect(() => {
		if (
			!detailsOpen ||
			!hasSideBySideReviewLayout ||
			!sideBySideRightPaneRef.current ||
			!sideBySideHeaderRef.current ||
			!sideBySideTabsHeaderRef.current
		) {
			setSideBySideTabContentHeight(0);
			setSideBySideDrawerHeight(0);
			return;
		}

		const updateTabsHeight = () => {
			const rightPaneHeight = Math.round(
				sideBySideRightPaneRef.current?.offsetHeight ?? 0,
			);
			const headerHeight = Math.round(
				sideBySideHeaderRef.current?.offsetHeight ?? 0,
			);
			const tabsHeaderHeight = Math.round(
				sideBySideTabsHeaderRef.current?.offsetHeight ?? 0,
			);
			const bodyTopPadding = 16;
			const bodyBottomPadding = 16;
			const tabsGapHeight = 16;
			const drawerHandleHeight = 16;
			const tabContentHeight = Math.max(
				rightPaneHeight - tabsHeaderHeight - tabsGapHeight,
				0,
			);

			setSideBySideTabContentHeight(tabContentHeight);
			setSideBySideDrawerHeight(
				rightPaneHeight +
					headerHeight +
					bodyTopPadding +
					bodyBottomPadding +
					drawerHandleHeight,
			);
		};

		updateTabsHeight();

		const observer = new ResizeObserver(updateTabsHeight);
		observer.observe(sideBySideHeaderRef.current);
		observer.observe(sideBySideTabsHeaderRef.current);
		observer.observe(sideBySideRightPaneRef.current);

		return () => {
			observer.disconnect();
		};
	}, [detailsOpen, hasSideBySideReviewLayout, staleReviewWarning]);

	return {
		hasSideBySideReviewLayout,
		sideBySideDrawerHeight,
		sideBySideHeaderRef,
		sideBySideRightPaneRef,
		sideBySideTabContentHeight,
		sideBySideTabsHeaderRef,
		usesStackedReviewLayout: !hasSideBySideReviewLayout,
	};
}
