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
}
