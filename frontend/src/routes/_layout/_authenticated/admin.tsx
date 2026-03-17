import { createFileRoute, useNavigate } from "@tanstack/react-router";
import type { PaginationState, Row } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { z } from "zod/v4";
import AddUser from "@/components/Admin/AddUser";
import { createColumns } from "@/components/Data-Table/columns";
import { DataTable } from "@/components/Data-Table/DataTable";
import SkeletonUsersTable from "@/components/Skeleton/SkeletonUsersTable";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { UserPublic } from "@/api/model";
import { useUsersReadUsers } from "@/api/endpoints/users/users.gen";

const usersSearchSchema = z.object({
  page: z.number().catch(1),
});

const PER_PAGE = 10;

export const Route = createFileRoute("/_layout/_authenticated/admin")({
  staticData: {
    title: "Admin",
  },
  component: Admin,
  validateSearch: (search) => usersSearchSchema.parse(search),
});

function UsersTable() {
  const { data: currentUser } = useCurrentUser();
  const navigate = useNavigate({ from: Route.fullPath });
  const { page } = Route.useSearch();
  const columns = useMemo(
    () => createColumns<UserPublic>(currentUser),
    [currentUser],
  );

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: page - 1,
    pageSize: PER_PAGE,
  });

  // Call the Orval-generated hook instead of useQuery
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
    return <SkeletonUsersTable />;
  }

  const getRowStyle = <TData extends UserPublic>(row: Row<TData>) => {
    return !row.original.is_active
      ? { color: "gray", opacity: 0.6 } // gray out inactive user
      : {};
  };

  return (
    <>
      <DataTable<UserPublic, unknown>
        columns={columns}
        data={data?.data ?? []}
        isPlaceholderData={isPlaceholderData}
        getRowStyle={getRowStyle}
        rowCount={count}
        pagination={pagination}
        setPagination={handlePaginationChange}
      />
      {/* <Table>
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
			</Pagination> */}
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
