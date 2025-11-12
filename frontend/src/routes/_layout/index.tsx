import { createFileRoute } from "@tanstack/react-router";

import useAuth from "@/hooks/useAuth";
import { useState } from 'react';
import * as d3 from "d3";
import LinePlot from '@/components/Dashboard/LinePlot';
import ChartWithDimensions from '@/components/Dashboard/ChartWithDimensions';

export const Route = createFileRoute("/_layout/")({
	component: Dashboard,
});

function Dashboard() {
	const { user: currentUser } = useAuth();
  const [data, setData] = useState(() => d3.ticks(-2, 2, 200).map(Math.sin));

  console.log(typeof data)
  console.log(data)
	return (
		<div className="max-w-full">
      <div className="pt-12 m-4">
        <span className="text-2xl max-w-sm truncate">
          Hi, {currentUser?.full_name || currentUser?.email} 👋🏼
        </span>
        <span>Welcome back, nice to see you again!</span>
        <LinePlot data={data} />
        <ChartWithDimensions />
      </div>
		</div>
	);
}
