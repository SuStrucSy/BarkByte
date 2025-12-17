import { useSpecimensReadSpecimens } from "@/api/endpoints/specimens/specimens.gen";
import type { SpecimenPublic } from "@/api/model";
import { DataTable } from "@/components/Data-Table/DataTable";
import { createColumns, getInitialColumnVisibility } from "@/components/Data-Table/specimenColumns";
import PendingSpecimens from "@/components/Pending/PendingSpecimens";
import { useNavigate } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import type { PaginationState } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import z from "zod/v4";

const specimensSearchSchema = z.object({
	page: z.number().catch(1),
});

const PER_PAGE = 10;

export const Route = createFileRoute("/_layout/specimens")({
	staticData: {
		title: "Specimens",
	},
	component: Specimens,
	validateSearch: (search) => specimensSearchSchema.parse(search),
});

function SpecimensTable() {
	const navigate = useNavigate({ from: Route.fullPath });
	const { page } = Route.useSearch();
	const columns = useMemo(() => createColumns<SpecimenPublic>(), []);

	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: page - 1,
		pageSize: PER_PAGE,
	});

	// Call the Orval-generated hook instead of useQuery
	const { data, isLoading, isPlaceholderData } = useSpecimensReadSpecimens(
		{
			skip: pagination.pageIndex * pagination.pageSize,
			limit: pagination.pageSize,
		},
		{
			query: {
				placeholderData: (prevData) => prevData,
			},
		},
	);

	const handlePaginationChange = (
		updater: PaginationState | ((old: PaginationState) => PaginationState),
	) => {
		const newPagination =
			typeof updater === "function" ? updater(pagination) : updater;

		setPagination(newPagination);

		// Update URL search params
		navigate({
			search: (prev) => ({
				...prev,
				page: newPagination.pageIndex + 1, // pageIndex 0 = page 1
			}),
		});
	};

	const count = data?.count ?? 0;

	if (isLoading && !isPlaceholderData) {
		return <PendingSpecimens />;
	}

  console.log(data?.data)

	return (
		<DataTable<SpecimenPublic, unknown>
			columns={columns}
			initialColumnVisibility={getInitialColumnVisibility()}
			data={data?.data ?? []}
			isPlaceholderData={isPlaceholderData}
			rowCount={count}
			pagination={pagination}
			setPagination={handlePaginationChange}
		/>
	);
}

function Specimens() {
	return (
		<div className="grid grid-cols-1">
			<SpecimensTable />
		</div>
	);
}
