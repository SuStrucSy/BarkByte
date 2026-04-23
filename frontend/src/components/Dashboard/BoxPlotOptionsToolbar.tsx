import { useEffect, useRef, useState } from "react";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const CHART_TYPE_OPTIONS = [
	{ value: "boxplot", label: "Boxplot" },
	{ value: "violin", label: "Violin" },
] as const;

export type BoxPlotChartType = (typeof CHART_TYPE_OPTIONS)[number]["value"];

function ChartOptionsLabel({
	children,
	className,
}: {
	children: string;
	className?: string;
}) {
	return (
		<div
			className={`w-full text-left text-xs font-medium text-muted-foreground ${className ?? ""}`}
		>
			{children}
		</div>
	);
}

function ChartTypeSwitchControl({
	value,
	onChange,
}: {
	value: BoxPlotChartType;
	onChange: (value: BoxPlotChartType) => void;
}) {
	const checked = value === "violin";
	const activeLabel = checked ? "Violin" : "Boxplot";

	return (
		<div className="flex w-auto min-w-0 items-center gap-2 text-xs font-medium sm:min-w-56 sm:gap-3">
			<span className={checked ? "text-muted-foreground" : "text-foreground"}>
				Boxplot
			</span>
			<Switch
				checked={checked}
				onCheckedChange={(nextChecked) =>
					onChange(nextChecked ? "violin" : "boxplot")
				}
				aria-label={`Chart type: ${activeLabel}`}
			/>
			<span className={checked ? "text-foreground" : "text-muted-foreground"}>
				Violin
			</span>
		</div>
	);
}

function FastenerToggleControl({
	fastenerTypes,
	value,
	onChange,
}: {
	fastenerTypes: string[];
	value: string;
	onChange: (value: string) => void;
}) {
	return (
		<div className="max-w-full overflow-x-auto pb-1 lg:max-w-[40rem]">
			<ToggleGroup
				type="single"
				variant="outline"
				value={value}
				onValueChange={(nextValue) => {
					if (nextValue) {
						onChange(nextValue);
					}
				}}
				aria-label="Fastener type"
				className="w-max"
			>
				{fastenerTypes.map((fastener) => (
					<ToggleGroupItem
						key={fastener}
						value={fastener}
						aria-label={`Filter by ${fastener}`}
					>
						{fastener}
					</ToggleGroupItem>
				))}
			</ToggleGroup>
		</div>
	);
}

function FastenerSelectControl({
	fastenerTypes,
	value,
	onChange,
}: {
	fastenerTypes: string[];
	value: string;
	onChange: (value: string) => void;
}) {
	return (
		<Select onValueChange={onChange} value={value}>
			<SelectTrigger
				className="w-full min-w-0 max-w-48 sm:w-72 sm:max-w-none"
				aria-label="Select fastener type"
			>
				<SelectValue placeholder="Select a fastener" />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectLabel>Fastener Type</SelectLabel>
					{fastenerTypes.map((fastener) => (
						<SelectItem key={fastener} value={fastener}>
							{fastener}
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	);
}

type BoxPlotOptionsToolbarProps = {
	className?: string;
	selectedChartType: BoxPlotChartType;
	onChartTypeChange: (value: BoxPlotChartType) => void;
	fastenerTypes: string[];
	selectedFastener: string;
	onFastenerChange: (value: string) => void;
	containerRef?: (node: HTMLDivElement | null) => void;
	isLoading?: boolean;
};

export function BoxPlotOptionsToolbar({
	className,
	selectedChartType,
	onChartTypeChange,
	fastenerTypes,
	selectedFastener,
	onFastenerChange,
	containerRef,
	isLoading = false,
}: BoxPlotOptionsToolbarProps) {
	const layoutRef = useRef<HTMLDivElement | null>(null);
	const measurementRef = useRef<HTMLDivElement | null>(null);
	const [useCompactControls, setUseCompactControls] = useState(true);

	useEffect(() => {
		const layoutNode = layoutRef.current;
		const measurementNode = measurementRef.current;
		if (!layoutNode || !measurementNode) {
			return;
		}

		const updateLayoutMode = () => {
			const desktopBreakpoint = 1024;
			const availableWidth = layoutNode.clientWidth;
			const requiredWidth = measurementNode.scrollWidth;

			setUseCompactControls(
				window.innerWidth < desktopBreakpoint || requiredWidth > availableWidth,
			);
		};

		updateLayoutMode();

		const resizeObserver = new ResizeObserver(() => {
			updateLayoutMode();
		});

		resizeObserver.observe(layoutNode);
		resizeObserver.observe(measurementNode);
		window.addEventListener("resize", updateLayoutMode);

		return () => {
			resizeObserver.disconnect();
			window.removeEventListener("resize", updateLayoutMode);
		};
	}, []);

	return (
		<div ref={containerRef} className={className}>
			<Card>
				<CardHeader>
					{isLoading ? (
						<div className="space-y-4">
							<div className="space-y-2">
								<Skeleton className="h-5 w-40" />
								<Skeleton className="h-4 w-72 max-w-full" />
							</div>
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<div className="space-y-2">
									<Skeleton className="h-4 w-24" />
									<Skeleton className="h-8 w-36" />
								</div>
								<div className="space-y-2">
									<Skeleton className="h-4 w-28" />
									<Skeleton className="h-10 w-full max-w-56" />
								</div>
							</div>
						</div>
					) : (
						<div
							ref={layoutRef}
							className={
								useCompactControls
									? "relative mx-auto flex w-full max-w-full flex-col gap-4"
									: "relative mx-auto flex w-full max-w-full flex-col gap-4 lg:flex-row lg:items-center lg:justify-center lg:gap-6"
							}
						>
							<div
								ref={measurementRef}
								aria-hidden="true"
								className="pointer-events-none absolute left-0 top-0 invisible flex w-max max-w-none flex-row items-center gap-6"
							>
								<div className="flex max-w-xs flex-col text-left shrink-0">
									<CardTitle>Box Plot Options</CardTitle>
									<CardDescription className="mt-1">
										Choose the chart type and active fastener filter.
									</CardDescription>
								</div>
								<div className="flex max-w-full flex-row items-start gap-5">
									<div className="flex shrink-0 flex-col items-start gap-2">
										<ChartOptionsLabel>Chart Type</ChartOptionsLabel>
										<ChartTypeSwitchControl
											value={selectedChartType}
											onChange={onChartTypeChange}
										/>
									</div>
									<div className="flex max-w-full flex-col items-start gap-2">
										<ChartOptionsLabel>Fastener Type</ChartOptionsLabel>
										<FastenerToggleControl
											fastenerTypes={fastenerTypes}
											value={selectedFastener}
											onChange={onFastenerChange}
										/>
									</div>
								</div>
							</div>
							<div
								className={
									useCompactControls
										? "flex max-w-xs flex-col text-left"
										: "flex max-w-xs flex-col text-left lg:shrink-0"
								}
							>
								<CardTitle>Box Plot Options</CardTitle>
								<CardDescription className="mt-1">
									Choose the chart type and active fastener filter.
								</CardDescription>
							</div>
							<div
								className={
									useCompactControls
										? "hidden"
										: "flex max-w-full flex-row items-start justify-center gap-5"
								}
							>
								<div className="flex shrink-0 flex-col items-start gap-2">
									<ChartOptionsLabel>Chart Type</ChartOptionsLabel>
									<ChartTypeSwitchControl
										value={selectedChartType}
										onChange={onChartTypeChange}
									/>
								</div>
								<div className="flex max-w-full flex-col items-start gap-2">
									<ChartOptionsLabel>Fastener Type</ChartOptionsLabel>
									<FastenerToggleControl
										fastenerTypes={fastenerTypes}
										value={selectedFastener}
										onChange={onFastenerChange}
									/>
								</div>
							</div>
							<div
								className={
									useCompactControls
										? "grid max-w-full grid-cols-[max-content_max-content] justify-between gap-x-4 gap-y-3"
										: "hidden"
								}
							>
								<div className="flex min-w-0 flex-col gap-2 items-start">
									<ChartOptionsLabel className="w-auto shrink-0">
										Chart Type
									</ChartOptionsLabel>
									<ChartTypeSwitchControl
										value={selectedChartType}
										onChange={onChartTypeChange}
									/>
								</div>
								<div className="flex min-w-0 flex-col gap-2 items-start">
									<ChartOptionsLabel className="w-auto">
										Fastener Type
									</ChartOptionsLabel>
									<div className="w-fit max-w-full">
										<FastenerSelectControl
											fastenerTypes={fastenerTypes}
											value={selectedFastener}
											onChange={onFastenerChange}
										/>
									</div>
								</div>
							</div>
						</div>
					)}
				</CardHeader>
			</Card>
		</div>
	);
}
