import type { FastenerTypes, SpecimenPublic } from "@/api/model";
import { ScatterPlotCard } from "@/components/Common/ScatterPlotCard";
import { ScatterPlotD3 } from "@/components/Dashboard/ScatterPlot";

type DashboardScatterPlotsProps = {
	stiffnessDuctilityData: SpecimenPublic[];
	stiffnessYieldData: SpecimenPublic[];
	fastenerTypesData: FastenerTypes | undefined;
	height: number;
	onPointClick: (specimen: SpecimenPublic) => void;
	isLoading: boolean;
};

export function DashboardScatterPlots({
	stiffnessDuctilityData,
	stiffnessYieldData,
	fastenerTypesData,
	height,
	onPointClick,
	isLoading,
}: DashboardScatterPlotsProps) {
	const stiffnessDuctilityProps = {
		data: stiffnessDuctilityData,
		fastenerTypesData,
		xKey: "e_stiffness",
		yKey: "e_ductility",
		xLabel: "Stiffness (Ks) [KN/mm]",
		yLabel: "Ductility",
		title: "Stiffness vs Ductility",
		onPointClick,
	} as const;

	const stiffnessYieldProps = {
		data: stiffnessYieldData,
		fastenerTypesData,
		xKey: "e_stiffness",
		yKey: "e_yield_force",
		xLabel: "Stiffness (Ks) [KN/mm]",
		yLabel: "Yield Strength (Fy) [KN]",
		title: "Stiffness vs Yield Force",
		onPointClick,
	} as const;

	return (
		<>
			<ScatterPlotCard
				title="Stiffness vs Ductility"
				description="Analyzing structural performance metrics"
				pointCount={stiffnessDuctilityData.length}
				isLoading={isLoading}
			>
				<ScatterPlotD3 {...stiffnessDuctilityProps} height={height} />
			</ScatterPlotCard>

			<ScatterPlotCard
				title="Stiffness vs Yield Force"
				description="Stiffness-force relationship analysis"
				pointCount={stiffnessYieldData.length}
				isLoading={isLoading}
			>
				<ScatterPlotD3 {...stiffnessYieldProps} height={height} />
			</ScatterPlotCard>
		</>
	);
}
