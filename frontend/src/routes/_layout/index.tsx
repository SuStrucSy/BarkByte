import { createFileRoute } from "@tanstack/react-router";
import * as d3 from "d3";
import { useState } from "react";
import {
	Plotly3DScatterPlot,
	type DataPoint,
} from "@/components/Dashboard/ChartWithDimensions";
import { useSpecimensReadSpecimens } from '@/api/endpoints/specimens/specimens.gen';

export const Route = createFileRoute("/_layout/")({
	staticData: {
		title: "Dashboard",
	},
	component: Dashboard,
});

function Dashboard() {
  const { data, isLoading, isPlaceholderData } = useSpecimensReadSpecimens(
  );

  if (isLoading && !isPlaceholderData) {

    return null
  }

  const blah: DataPoint[] = data?.data?.map(specimen => {
    return {
      id: specimen.id,
      ductility: specimen.e_ductility,
      specimen_reference_id: specimen.specimen_reference_id,
      stiffness: specimen.e_stiffness,
      yield_force: specimen.e_yield_force
    }
  })

	return (
		<div className="max-w-full">
			<div className="">
				<Plotly3DScatterPlot data={blah} />
			</div>
		</div>
	);
}
