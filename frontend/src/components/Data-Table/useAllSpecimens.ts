import { useQuery } from "@tanstack/react-query";
import { specimensReadSpecimens } from "@/api/endpoints/specimens/specimens";
import type { SpecimenPublic } from "@/api/model";

const EMPTY_SPECIMENS: SpecimenPublic[] = [];

/**
 * Fetches every specimen by repeatedly requesting paginated batches
 * and returns one combined list with a total count.
 */
export function useAllSpecimens() {
	const queryResult = useQuery({
		queryKey: ["specimens", "all"],
		queryFn: async () => {
			const pageSize = 500;
			let skip = 0;
			let total = 0;
			let allRows: SpecimenPublic[] = [];

			do {
				const response = await specimensReadSpecimens({
					skip,
					limit: pageSize,
				});
				total = response.count;
				allRows = allRows.concat(response.data);
				skip += pageSize;
			} while (allRows.length < total);

			return {
				count: total,
				data: allRows,
			};
		},
		staleTime: 30_000,
	});

	const specimens = queryResult.data?.data ?? EMPTY_SPECIMENS;
	const totalCount = queryResult.data?.count ?? 0;
	const loadedCount = specimens.length;

	return {
		...queryResult,
		specimens,
		totalCount,
		loadedCount,
	};
}
