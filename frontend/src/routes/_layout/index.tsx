import { createFileRoute } from "@tanstack/react-router";
import { useSpecimensReadSpecimens } from "@/api/endpoints/specimens/specimens.gen";

export const Route = createFileRoute("/_layout/")({
  staticData: {
    title: "Home",
  },
  component: Home,
});

function Home() {
  return (
    <div className="max-w-full">
      <div className="">{/*<Plotly3DScatterPlot data={blah} />*/}</div>
    </div>
  );
<<<<<<< HEAD
=======

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
        hello there! 👋
				{/* <Plotly3DScatterPlot data={blah} /> */}
			</div>
		</div>
	);
>>>>>>> main
}
