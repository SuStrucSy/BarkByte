import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { FailureModeBadge } from "@/components/Common/FailureModeBadge";
import {
	Popover,
	PopoverContent,
	PopoverHeader,
	PopoverTitle,
	PopoverTrigger,
} from "@/components/ui/popover";

interface FailureModeBadgeOverflowListProps {
	items: string[];
	onFailureModeClick?: (failureMode: string) => void;
}

export function FailureModeBadgeOverflowList({
	items,
	onFailureModeClick,
}: FailureModeBadgeOverflowListProps) {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const badgeRefs = useRef<Array<HTMLSpanElement | null>>([]);
	const counterRefs = useRef<Record<number, HTMLSpanElement | null>>({});
	const [availableWidth, setAvailableWidth] = useState(0);
	const [visibleCount, setVisibleCount] = useState(items.length);
	const badgeEntries = useMemo(() => {
		const occurrences = new Map<string, number>();
		return items.map((label) => {
			const occurrence = (occurrences.get(label) ?? 0) + 1;
			occurrences.set(label, occurrence);
			return {
				key: `${label}-${occurrence}`,
				label,
			};
		});
	}, [items]);
	const hiddenCounts = useMemo(
		() => Array.from({ length: items.length }, (_, index) => index + 1),
		[items.length],
	);

	useLayoutEffect(() => {
		const container = containerRef.current;
		const cell = container?.closest("td");
		if (!container || !cell) {
			return;
		}

		const measure = () => {
			const cellStyle = window.getComputedStyle(cell);
			const horizontalPadding =
				Number.parseFloat(cellStyle.paddingLeft || "0") +
				Number.parseFloat(cellStyle.paddingRight || "0");
			const nextAvailableWidth = Math.max(
				cell.clientWidth - horizontalPadding,
				0,
			);

			if (nextAvailableWidth <= 0) {
				return;
			}
			setAvailableWidth((current) =>
				current === nextAvailableWidth ? current : nextAvailableWidth,
			);

			const computedStyle = window.getComputedStyle(container);
			const gap = Number.parseFloat(
				computedStyle.columnGap || computedStyle.gap || "0",
			);
			const badgeWidths = badgeEntries.map(
				(_, index) => badgeRefs.current[index]?.offsetWidth ?? 0,
			);

			let nextVisibleCount = items.length;

			for (let count = items.length; count >= 0; count -= 1) {
				const hiddenCount = items.length - count;
				const visibleWidth = badgeWidths
					.slice(0, count)
					.reduce((total, width) => total + width, 0);
				const visibleGapWidth = count > 1 ? gap * (count - 1) : 0;
				const counterWidth =
					hiddenCount > 0
						? (counterRefs.current[hiddenCount]?.offsetWidth ?? 0) +
							(count > 0 ? gap : 0)
						: 0;

				if (
					visibleWidth + visibleGapWidth + counterWidth <=
					nextAvailableWidth
				) {
					nextVisibleCount = count;
					break;
				}
			}

			setVisibleCount((current) =>
				current === nextVisibleCount ? current : nextVisibleCount,
			);
		};

		measure();

		const resizeObserver = new ResizeObserver(() => {
			measure();
		});

		resizeObserver.observe(cell);

		return () => {
			resizeObserver.disconnect();
		};
	}, [badgeEntries, items]);

	const hiddenCount = Math.max(items.length - visibleCount, 0);
	const hiddenItems = badgeEntries.slice(visibleCount);

	return (
		<div className="relative max-w-[30rem] min-w-0 w-full">
			<div
				ref={containerRef}
				className="flex h-6 min-w-0 w-full items-center gap-1 overflow-hidden whitespace-nowrap"
				style={availableWidth > 0 ? { width: availableWidth } : undefined}
			>
				{badgeEntries.slice(0, visibleCount).map((item) => (
					<FailureModeBadge
						key={item.key}
						label={item.label}
						onClick={(event) => {
							event.stopPropagation();
							onFailureModeClick?.(item.label);
						}}
					>
						{item.label}
					</FailureModeBadge>
				))}
				{hiddenCount > 0 ? (
					<Popover>
						<PopoverTrigger asChild>
							<FailureModeBadge
								label={`+${hiddenCount}`}
								onClick={(event) => {
									event.stopPropagation();
								}}
							>
								+{hiddenCount}
							</FailureModeBadge>
						</PopoverTrigger>
						<PopoverContent
							align="start"
							className="w-auto max-w-80 p-3"
							onClick={(event) => {
								event.stopPropagation();
							}}
						>
							<PopoverHeader className="mb-2">
								<PopoverTitle className="text-xs font-medium text-muted-foreground">
									More failure modes
								</PopoverTitle>
							</PopoverHeader>
							<div className="flex flex-wrap gap-1.5">
								{hiddenItems.map((item) => (
									<FailureModeBadge
										key={item.key}
										label={item.label}
										onClick={(event) => {
											event.stopPropagation();
											onFailureModeClick?.(item.label);
										}}
									>
										{item.label}
									</FailureModeBadge>
								))}
							</div>
						</PopoverContent>
					</Popover>
				) : null}
			</div>
			<div className="pointer-events-none absolute -z-10 h-0 overflow-hidden opacity-0">
				<div className="flex items-center gap-1 whitespace-nowrap">
					{badgeEntries.map((item, index) => (
						<span
							key={item.key}
							ref={(element) => {
								badgeRefs.current[index] = element;
							}}
						>
							<FailureModeBadge label={item.label}>
								{item.label}
							</FailureModeBadge>
						</span>
					))}
					{hiddenCounts.map((count) => (
						<span
							key={count}
							ref={(element) => {
								counterRefs.current[count] = element;
							}}
						>
							<FailureModeBadge label={`+${count}`}>+{count}</FailureModeBadge>
						</span>
					))}
				</div>
			</div>
		</div>
	);
}
