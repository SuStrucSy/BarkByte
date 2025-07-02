import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import AddUser from "@/components/Admin/AddUser";
import { UserActionsMenu } from "@/components/Common/UserActionsMenu";
import PendingUsers from "@/components/Pending/PendingUsers";
import { Badge } from "@/components/ui/badge";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination.tsx";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { api } from "@/lib/api";
import type { UserPublic } from "@/lib/types";

const usersSearchSchema = z.object({
	page: z.number().catch(1),
});

const PER_PAGE = 5;

function getUsersQueryOptions({ page }: { page: number }) {
	return {
		queryFn: () =>
			api.get("/api/v1/users/", {
				queries: { skip: (page - 1) * PER_PAGE, limit: PER_PAGE },
			}),
		queryKey: ["users", { page }],
	};
}

export const Route = createFileRoute("/_layout/admin")({
	component: Admin,
	validateSearch: (search) => usersSearchSchema.parse(search),
});

function UsersTable() {
	const queryClient = useQueryClient();
	const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"]);
	const navigate = useNavigate({ from: Route.fullPath });
	const { page } = Route.useSearch();

	const { data, isLoading, isPlaceholderData } = useQuery({
		...getUsersQueryOptions({ page }),
		placeholderData: (prevData) => prevData,
	});

	const setPage = (page: number) =>
		navigate({
			search: (prev) => ({ ...prev, page }),
		});

	const users = data?.data.slice(0, PER_PAGE) ?? [];
	const count = data?.count ?? 0;

	if (isLoading) {
		return <PendingUsers />;
	}

	return (
		<>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Full name</TableHead>
						<TableHead>Email</TableHead>
						<TableHead>Role</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{users?.map((user) => (
						<TableRow
							key={user.id}
							className={isPlaceholderData ? "opacity-50" : "opacity-100"}
						>
							<TableCell color={!user.full_name ? "gray" : "inherit"}>
								{user.full_name || "N/A"}
								{currentUser?.id === user.id && (
									<Badge variant="destructive" className="ml-1">
										You
									</Badge>
								)}
							</TableCell>
							<TableCell>{user.email}</TableCell>
							<TableCell>{user.is_superuser ? "Superuser" : "User"}</TableCell>
							<TableCell>{user.is_active ? "Active" : "Inactive"}</TableCell>
							<TableCell>
								<UserActionsMenu
									user={user}
									disabled={currentUser?.id === user.id}
								/>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
			<Pagination>
				<PaginationContent>
					<PaginationItem>
						{page === 1 ? (
							<PaginationPrevious href="#" className="opacity-25" />
						) : (
							<PaginationPrevious href="#" onClick={() => setPage(page - 1)} />
						)}
					</PaginationItem>
					{page}
					<PaginationItem>
						{count <= page * PER_PAGE ? (
							<PaginationNext href="#" className="opacity-25" />
						) : (
							<PaginationNext href="#" onClick={() => setPage(page + 1)} />
						)}
					</PaginationItem>
				</PaginationContent>
			</Pagination>
		</>
	);
}

function Admin() {
	return (
		<div className="max-w-full">
			<h1 className="text-3xl pt-3">Users Management</h1>
			<AddUser />
			<UsersTable />
		</div>
	);
}
