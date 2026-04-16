import { CandlestickChartIcon } from "lucide-react";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const CHART_TYPE_OPTIONS = [
	{ value: "boxplot", label: "Boxplot" },
	{ value: "violin", label: "Violin" },
] as const;

export type BoxPlotChartType = (typeof CHART_TYPE_OPTIONS)[number]["value"];

function ChartOptionsLabel({ children }: { children: string }) {
	return (
		<div className="w-full text-left text-xs font-medium text-muted-foreground">
			{children}
		</div>
	);
}

function ChartTypeToggleControl({
	value,
	onChange,
}: {
	value: BoxPlotChartType;
	onChange: (value: BoxPlotChartType) => void;
}) {
	return (
		<ToggleGroup
			type="single"
			variant="outline"
			value={value}
			onValueChange={(nextValue) => {
				if (nextValue === "boxplot" || nextValue === "violin") {
					onChange(nextValue);
				}
			}}
			aria-label="Chart type"
		>
			{CHART_TYPE_OPTIONS.map((option) => (
				<ToggleGroupItem
					key={option.value}
					value={option.value}
					aria-label={`${option.label} view`}
				>
					<CandlestickChartIcon className="group-data-[state=on]/toggle:fill-foreground" />
					{option.label}
				</ToggleGroupItem>
			))}
		</ToggleGroup>
	);
}

function ChartTypeSelectControl({
	value,
	onChange,
}: {
	value: BoxPlotChartType;
	onChange: (value: BoxPlotChartType) => void;
}) {
	return (
		<Select
			onValueChange={(nextValue) => onChange(nextValue as BoxPlotChartType)}
			value={value}
		>
			<SelectTrigger className="w-full sm:w-56" aria-label="Select chart type">
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectLabel>Chart Type</SelectLabel>
					{CHART_TYPE_OPTIONS.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
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
				className="w-full sm:w-72"
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
};

export function BoxPlotOptionsToolbar({
	className,
	selectedChartType,
	onChartTypeChange,
	fastenerTypes,
	selectedFastener,
	onFastenerChange,
	containerRef,
}: BoxPlotOptionsToolbarProps) {
	return (
		<div ref={containerRef} className={className}>
			<Card>
				<CardHeader>
					<div className="mx-auto flex w-full max-w-full flex-col gap-4 lg:flex-row lg:items-center lg:justify-center lg:gap-6">
						<div className="flex max-w-xs flex-col text-left lg:shrink-0">
							<CardTitle>Box Plot Options</CardTitle>
							<CardDescription className="mt-1">
								Choose the chart type and active fastener filter.
							</CardDescription>
						</div>
						<div className="hidden max-w-full lg:flex lg:flex-row lg:items-start lg:gap-5">
							<div className="flex shrink-0 flex-col items-start gap-2">
								<ChartOptionsLabel>Chart Type</ChartOptionsLabel>
								<ChartTypeToggleControl
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
						<div className="flex max-w-full flex-col gap-3 lg:hidden">
							<div className="flex flex-col items-start gap-2">
								<ChartOptionsLabel>Chart Type</ChartOptionsLabel>
								<ChartTypeSelectControl
									value={selectedChartType}
									onChange={onChartTypeChange}
								/>
							</div>
							<div className="flex flex-col items-start gap-2">
								<ChartOptionsLabel>Fastener Type</ChartOptionsLabel>
								<FastenerSelectControl
									fastenerTypes={fastenerTypes}
									value={selectedFastener}
									onChange={onFastenerChange}
								/>
							</div>
						</div>
					</div>
				</CardHeader>
			</Card>
		</div>
	);
}
