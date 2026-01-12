import { useDoiGetDois } from "@/api/endpoints/doi/doi.gen";
import type { DOIPublic } from "@/api/model";
import PendingSpecimens from "@/components/Pending/PendingSpecimens";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@tanstack/react-router';
import { createFileRoute } from "@tanstack/react-router";




export const Route = createFileRoute("/_layout/dois")({
	staticData: {
		title: "References",
	},
	component: Dois,
});

function DoisTable() {

	// Call the Orval-generated hook instead of useQuery
	const { data, isLoading, isPlaceholderData } = useDoiGetDois();


	if (isLoading && !isPlaceholderData) {
		return [...Array(5)].map((_, index) => (
      <div key={index} className="flex flex-col space-y-3">
        <Skeleton className="h-[125px] w-[250px] rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    ))
	}

	return data?.data.map((doi) => (
		<Link key={doi.id} to="/dois/$id" params={{ id: doi.id }}>
			<Card className="w-full max-w-lg">
				<CardHeader>
					<CardTitle>{doi.ref_title}</CardTitle>
					<CardDescription>{doi.pub_year}</CardDescription>
				</CardHeader>
				<CardContent>{doi.authors}</CardContent>
			</Card>
		</Link>
	));

	// return (
	// 	<DataTable<DOIPublic, unknown>
	// 		columns={columns}
	// 		initialColumnVisibility={getInitialColumnVisibility()}
	// 		data={data?.data ?? []}
	// 		isPlaceholderData={isPlaceholderData}
	// 		rowCount={count}
	// 		pagination={pagination}
	// 		setPagination={handlePaginationChange}
	// 	/>
	// );
}

function Dois() {
	return (
		<div className="grid grid-cols-3 gap-6">
			<DoisTable />
		</div>
	);
}
