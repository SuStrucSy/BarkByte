import { useCallback, useLayoutEffect, useRef, useState } from "react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface OverflowTooltipTextProps {
	value: string;
	as?: "div" | "span";
	className?: string;
}

export function OverflowTooltipText({
	value,
	as = "div",
	className,
}: OverflowTooltipTextProps) {
	const wrapperRef = useRef<HTMLDivElement | null>(null);
	const textRef = useRef<HTMLDivElement | HTMLSpanElement | null>(null);
	const [isTruncated, setIsTruncated] = useState(false);
	const Comp = as;

	const measureOverflow = useCallback(() => {
		const wrapper = wrapperRef.current;
		const element = textRef.current;
		if (!wrapper || !element) {
			return;
		}

		setIsTruncated(element.scrollWidth > wrapper.clientWidth);
	}, []);

	useLayoutEffect(() => {
		const wrapper = wrapperRef.current;
		if (!wrapper) {
			return;
		}

		const resizeObserver = new ResizeObserver(() => {
			measureOverflow();
		});

		resizeObserver.observe(wrapper);
		measureOverflow();

		return () => {
			resizeObserver.disconnect();
		};
	}, [measureOverflow]);

	useLayoutEffect(() => {
		measureOverflow();
	}, [measureOverflow]);

	const content = (
		<div ref={wrapperRef} className="flex min-w-0 max-w-full">
			<Comp
				ref={textRef}
				className={cn(
					"min-w-0 max-w-full overflow-hidden truncate whitespace-nowrap",
					className,
				)}
			>
				{value}
			</Comp>
		</div>
	);

	if (!isTruncated) {
		return content;
	}

	return (
		<Tooltip>
			<TooltipTrigger asChild>{content}</TooltipTrigger>
			<TooltipContent>{value}</TooltipContent>
		</Tooltip>
	);
}
