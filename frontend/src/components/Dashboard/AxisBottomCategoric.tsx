import type { ScaleBand } from "d3";
import { useMemo } from "react";

type AxisBottomProps = {
	xScale: ScaleBand<string>;
	width?: number;
};

// tick length
const TICK_LENGTH = 6;

export const AxisBottom = ({ xScale, width = 600 }: AxisBottomProps) => {
	const [min, max] = xScale.range();
	const isNarrow = width < 400;

	const ticks = useMemo(() => {
		return xScale.domain().map((value) => {
			const x = xScale(value);
			if (x == null) throw new Error("Unexpected undefined xScale value");
			return {
				value,
				xOffset: x + xScale.bandwidth() / 2,
			};
		});
	}, [xScale]);

	return (
		<>
			{/* Main horizontal line */}
			<path
				d={["M", min + 20, 0, "L", max - 20, 0].join(" ")}
				fill="none"
				stroke="currentColor"
			/>

			{/* Ticks and labels */}
			{ticks.map(({ value, xOffset }) => (
				<g key={value} transform={`translate(${xOffset}, 0)`}>
					<line y2={TICK_LENGTH} stroke="currentColor" />
					<text
						fill="currentColor"
						key={value}
						style={{
							fontSize: isNarrow ? "8px" : "10px",
							textAnchor: isNarrow ? "end" : "middle",
							transform: isNarrow
								? "translate(-4px, 10px) rotate(-45deg)"
								: "translateY(20px)",
						}}
					>
						{value}
					</text>
				</g>
			))}
		</>
	);
};
