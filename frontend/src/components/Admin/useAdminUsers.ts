import type { PaginationState } from "@tanstack/react-table";
import { useState } from "react";
import { useUsersReadUsers } from "@/api/endpoints/users/users";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const PER_PAGE = 10;

interface UseAdminUsersOptions {
	onPageChange: (page: number) => void;
	page: number;
}

export function useAdminUsers({ onPageChange, page }: UseAdminUsersOptions) {
	const { data: currentUser } = useCurrentUser();
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: page - 1,
		pageSize: PER_PAGE,
	});

	const { data, isLoading, isPlaceholderData } = useUsersReadUsers(
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
		onPageChange(newPagination.pageIndex + 1);
	};

	const count = data?.count ?? 0;
	const users = data?.data ?? [];
	const totalPages = Math.max(Math.ceil(count / pagination.pageSize), 1);
	const canPreviousPage = pagination.pageIndex > 0;
	const canNextPage = pagination.pageIndex + 1 < totalPages;

	const goToPage = (nextPageIndex: number) => {
		handlePaginationChange((prev) => ({
			...prev,
			pageIndex: nextPageIndex,
		}));
	};

	return {
		canNextPage,
		canPreviousPage,
		currentUser,
		goToPage,
		isLoading,
		isPlaceholderData,
		pagination,
		totalPages,
		users,
	};
}
