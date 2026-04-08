import type { ScaleLinear } from "d3";
import { useMemo } from "react";

type AxisLeftProps = {
	yScale: ScaleLinear<number, number>;
	pixelsPerTick: number;
	title?: string;
};

// tick length
const TICK_LENGTH = 6;

export const AxisLeft = ({ yScale, pixelsPerTick, title }: AxisLeftProps) => {
	const range = yScale.range();

	const ticks = useMemo(() => {
		const height = range[0] - range[1];
		const numberOfTicksTarget = Math.floor(height / pixelsPerTick);

		return yScale.ticks(numberOfTicksTarget).map((value) => ({
			value,
			yOffset: yScale(value),
		}));
	}, [pixelsPerTick, range, yScale]);

	return (
		<>
			{/* Axis Title */}
			{title && (
				<text
					style={{
						fontSize: "12px",
						textAnchor: "middle",
						fill: "currentColor",
					}}
					transform={`translate(-40, ${(range[0] - range[1]) / 2} ) rotate(-90)`}
				>
					{title}
				</text>
			)}
			{/* Main vertical line */}
			<path
				d={["M", 0, range[0], "L", 0, range[1]].join(" ")}
				fill="none"
				stroke="currentColor"
			/>

			{/* Ticks and labels */}
			{ticks.map(({ value, yOffset }) => (
				<g key={value} transform={`translate(0, ${yOffset})`}>
					<line x2={-TICK_LENGTH} stroke="currentColor" />
					<text
						fill="currentColor"
						key={value}
						style={{
							fontSize: "10px",
							textAnchor: "middle",
							transform: "translateX(-20px)",
						}}
					>
						{value}
					</text>
				</g>
			))}
		</>
	);
};
