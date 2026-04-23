import { MinusIcon, PlusIcon, RotateCcwIcon } from "lucide-react";
import {
	type PointerEvent as ReactPointerEvent,
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { Button } from "@/components/ui/button";
import { clamp } from "@/lib/utils";

const MIN_SCALE = 1;
const MAX_SCALE = 3;
const ZOOM_STEP = 0.25;

type ZoomableImageViewerProps = {
	imageSrc: string;
	alt: string;
};

export function ZoomableImageViewer({
	imageSrc,
	alt,
}: ZoomableImageViewerProps) {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const [isTouchScreen, setIsTouchScreen] = useState(false);
	const [scale, setScale] = useState(MIN_SCALE);
	const [offset, setOffset] = useState({ x: 0, y: 0 });
	const [bounds, setBounds] = useState({ x: 0, y: 0 });
	const [imageSize, setImageSize] = useState({ width: 1, height: 1 });
	const dragStateRef = useRef<{
		pointerId: number;
		startX: number;
		startY: number;
		originX: number;
		originY: number;
	} | null>(null);
	const [isDragging, setIsDragging] = useState(false);

	useEffect(() => {
		const mediaQuery = window.matchMedia(
			"(pointer: coarse), (hover: none), (any-pointer: coarse)",
		);
		const updateTouchScreenState = () => {
			setIsTouchScreen(mediaQuery.matches);
		};

		updateTouchScreenState();
		mediaQuery.addEventListener("change", updateTouchScreenState);

		return () => {
			mediaQuery.removeEventListener("change", updateTouchScreenState);
		};
	}, []);

	const resetView = useCallback(() => {
		setScale(MIN_SCALE);
		setOffset({ x: 0, y: 0 });
	}, []);

	const clampOffset = useCallback(
		(nextOffset: { x: number; y: number }) => ({
			x: clamp(nextOffset.x, -bounds.x, bounds.x),
			y: clamp(nextOffset.y, -bounds.y, bounds.y),
		}),
		[bounds.x, bounds.y],
	);

	const updateBounds = useCallback(() => {
		const container = containerRef.current;
		if (!container) {
			return;
		}

		const containerWidth = container.clientWidth;
		const containerHeight = container.clientHeight;
		const imageRatio = imageSize.width / imageSize.height;
		const containerRatio = containerWidth / containerHeight;

		const baseWidth =
			imageRatio > containerRatio
				? containerWidth
				: containerHeight * imageRatio;
		const baseHeight =
			imageRatio > containerRatio
				? containerWidth / imageRatio
				: containerHeight;

		setBounds({
			x: Math.max(0, (baseWidth * scale - containerWidth) / 2),
			y: Math.max(0, (baseHeight * scale - containerHeight) / 2),
		});
	}, [imageSize.height, imageSize.width, scale]);

	useLayoutEffect(() => {
		updateBounds();
	}, [updateBounds]);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) {
			return;
		}

		const resizeObserver = new ResizeObserver(() => {
			updateBounds();
		});

		resizeObserver.observe(container);

		return () => {
			resizeObserver.disconnect();
		};
	}, [updateBounds]);

	useEffect(() => {
		setOffset((currentOffset) => clampOffset(currentOffset));
	}, [clampOffset]);

	const applyZoom = useCallback((delta: number) => {
		setScale((currentScale) => {
			const nextScale = clamp(currentScale + delta, MIN_SCALE, MAX_SCALE);

			if (nextScale === MIN_SCALE) {
				setOffset({ x: 0, y: 0 });
			}

			return nextScale;
		});
	}, []);

	const handlePointerDown = useCallback(
		(event: ReactPointerEvent<HTMLDivElement>) => {
			if (scale === MIN_SCALE) {
				return;
			}

			dragStateRef.current = {
				pointerId: event.pointerId,
				startX: event.clientX,
				startY: event.clientY,
				originX: offset.x,
				originY: offset.y,
			};

			setIsDragging(true);
			event.currentTarget.setPointerCapture(event.pointerId);
		},
		[offset.x, offset.y, scale],
	);

	const handlePointerMove = useCallback(
		(event: ReactPointerEvent<HTMLDivElement>) => {
			const dragState = dragStateRef.current;
			if (!dragState || dragState.pointerId !== event.pointerId) {
				return;
			}

			const deltaX = event.clientX - dragState.startX;
			const deltaY = event.clientY - dragState.startY;

			setOffset(
				clampOffset({
					x: dragState.originX + deltaX,
					y: dragState.originY + deltaY,
				}),
			);
		},
		[clampOffset],
	);

	const handlePointerUp = useCallback(
		(event: ReactPointerEvent<HTMLDivElement>) => {
			if (dragStateRef.current?.pointerId !== event.pointerId) {
				return;
			}

			dragStateRef.current = null;
			setIsDragging(false);

			if (event.currentTarget.hasPointerCapture(event.pointerId)) {
				event.currentTarget.releasePointerCapture(event.pointerId);
			}
		},
		[],
	);

	if (isTouchScreen) {
		return (
			<div className="relative flex min-h-[420px] items-center justify-center overflow-hidden rounded-xl border border-border/70 bg-muted/20 p-4">
				<div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg bg-white p-3 shadow-sm">
					<img
						src={imageSrc}
						alt={alt}
						className="h-auto max-h-[620px] w-full object-contain"
						decoding="async"
					/>
				</div>
			</div>
		);
	}

	return (
		<div
			ref={containerRef}
			className="relative flex min-h-[420px] items-center justify-center overflow-hidden rounded-xl border border-border/70 bg-muted/20 p-4 select-none"
		>
			<div
				className={`relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg bg-white p-3 shadow-sm ${
					scale > MIN_SCALE
						? isDragging
							? "cursor-grabbing"
							: "cursor-grab"
						: "cursor-default"
				}`}
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={handlePointerUp}
				onPointerCancel={handlePointerUp}
				onPointerLeave={handlePointerUp}
				role="presentation"
			>
				<div
					className="absolute left-4 top-4 z-10 flex flex-col rounded-lg border border-border bg-background/90 shadow-xs backdrop-blur-sm"
					onPointerDown={(event) => {
						event.stopPropagation();
					}}
				>
					<Button
						variant="outline"
						size="icon"
						className="rounded-b-none border-0 border-b bg-transparent"
						onClick={() => applyZoom(ZOOM_STEP)}
						disabled={scale >= MAX_SCALE}
						aria-label="Zoom in image"
					>
						<PlusIcon />
					</Button>
					<Button
						variant="outline"
						size="icon"
						className="rounded-none border-0 border-b bg-transparent"
						onClick={() => applyZoom(-ZOOM_STEP)}
						disabled={scale <= MIN_SCALE}
						aria-label="Zoom out image"
					>
						<MinusIcon />
					</Button>
					<Button
						variant="outline"
						size="icon"
						className="rounded-t-none border-0 bg-transparent"
						onClick={resetView}
						disabled={scale === MIN_SCALE && offset.x === 0 && offset.y === 0}
						aria-label="Reset image position"
					>
						<RotateCcwIcon />
					</Button>
				</div>
				<div className="absolute right-4 top-4 z-10 rounded-md bg-background/90 px-2 py-1 text-xs text-muted-foreground shadow-sm">
					{Math.round(scale * 100)}%
				</div>
				<img
					src={imageSrc}
					alt={alt}
					className="pointer-events-none h-auto max-h-[620px] w-full object-contain"
					decoding="async"
					style={{
						transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
						transformOrigin: "center center",
						transition: isDragging ? "none" : "transform 150ms ease-out",
					}}
					onLoad={(event) => {
						setImageSize({
							width: event.currentTarget.naturalWidth,
							height: event.currentTarget.naturalHeight,
						});
					}}
				/>
			</div>
		</div>
	);
}
