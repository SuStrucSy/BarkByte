import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import AddUser from "@/components/Admin/AddUser";
import { AdminUsersDesktopTable } from "@/components/Admin/AdminUsersDesktopTable";
import { AdminUsersMobileList } from "@/components/Admin/AdminUsersMobileList";
import { useAdminUsers } from "@/components/Admin/useAdminUsers";
import SkeletonUsersTable from "@/components/Skeleton/SkeletonUsersTable";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface UsersTableProps {
	onPageChange: (page: number) => void;
	page: number;
}

export function UsersTable({ onPageChange, page }: UsersTableProps) {
	const {
		canNextPage,
		canPreviousPage,
		currentUser,
		goToPage,
		isLoading,
		isPlaceholderData,
		pagination,
		totalPages,
		users,
	} = useAdminUsers({ onPageChange, page });

	if (isLoading && !isPlaceholderData) {
		return <SkeletonUsersTable />;
	}

	return (
		<Card>
			<CardHeader className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<CardTitle>User management</CardTitle>
					<CardDescription>
						Manage user accounts, access levels, and account status.
					</CardDescription>
				</div>
				<AddUser
					trigger={
						<Button type="button">
							<Plus className="size-4" />
							Add User
						</Button>
					}
				/>
			</CardHeader>
			<CardContent>
				<div className="md:hidden">
					<AdminUsersMobileList
						currentUserId={currentUser?.id}
						isPlaceholderData={isPlaceholderData}
						users={users}
					/>
				</div>

				<div className="hidden md:block">
					<AdminUsersDesktopTable
						currentUserId={currentUser?.id}
						isPlaceholderData={isPlaceholderData}
						users={users}
					/>
				</div>

				<div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
					<p className="text-sm text-muted-foreground">
						Page {pagination.pageIndex + 1} of {totalPages}
					</p>
					<div className="flex items-center justify-end gap-2">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => goToPage(pagination.pageIndex - 1)}
							disabled={!canPreviousPage}
						>
							<ChevronLeft className="size-4" />
							Previous
						</Button>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => goToPage(pagination.pageIndex + 1)}
							disabled={!canNextPage}
						>
							Next
							<ChevronRight className="size-4" />
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
