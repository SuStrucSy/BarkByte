import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import type { PaginationState } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { type ReactElement, useState } from "react";
import { z } from "zod/v4";
import { useUsersReadUsers } from "@/api/endpoints/users/users";
import type { UserPublic } from "@/api/model";
import AddUser from "@/components/Admin/AddUser";
import DeleteUser from "@/components/Admin/DeleteUser";
import EditUser from "@/components/Admin/EditUser";
import ReferenceDataManager from "@/components/Admin/ReferenceDataManager";
import SkeletonUsersTable from "@/components/Skeleton/SkeletonUsersTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const usersSearchSchema = z.object({
	page: z.number().catch(1),
});

const PER_PAGE = 10;

export const Route = createFileRoute("/_layout/_authenticated/admin")({
	staticData: {
		title: "Admin settings",
	},
	beforeLoad: ({ context }) => {
		const currentUser = context.auth?.data;

		if (currentUser && !currentUser.is_superuser) {
			throw redirect({ to: "/" });
		}
	},
	component: Admin,
	validateSearch: (search) => usersSearchSchema.parse(search),
});

function UsersTable() {
	const { data: currentUser } = useCurrentUser();
	const navigate = useNavigate({ from: Route.fullPath });
	const { page } = Route.useSearch();

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
	const users = data?.data ?? [];
	const totalPages = Math.max(Math.ceil(count / pagination.pageSize), 1);
	const canPreviousPage = pagination.pageIndex > 0;
	const canNextPage = pagination.pageIndex + 1 < totalPages;

	if (isLoading && !isPlaceholderData) {
		return <SkeletonUsersTable />;
	}

	const goToPage = (nextPageIndex: number) => {
		handlePaginationChange((prev) => ({
			...prev,
			pageIndex: nextPageIndex,
		}));
	};

	const isUserInactive = (user: UserPublic) => user.is_active !== true;

	const renderEditTrigger = (
		user: UserPublic,
		trigger: ReactElement<{ disabled?: boolean }>,
	) => {
		const isCurrentUser = currentUser?.id === user.id;

		if (!isCurrentUser) {
			return trigger;
		}

		return (
			<Tooltip>
				<TooltipTrigger asChild>
					<span tabIndex={0} className="inline-flex">
						{trigger}
					</span>
				</TooltipTrigger>
				<TooltipContent>Go to 'Account Settings'</TooltipContent>
			</Tooltip>
		);
	};

	return (
		<Card>
			<CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div className="space-y-1">
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
			<CardContent className="space-y-4">
				<div className="md:hidden">
					{users.length === 0 ? (
						<div className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
							No users yet.
						</div>
					) : (
						<div className="space-y-3">
							{users.map((user) => {
								const isCurrentUser = currentUser?.id === user.id;
								const isInactiveUser = isUserInactive(user);
								const disableDelete = isCurrentUser;

								return (
									<div
										key={user.id}
										className={`space-y-3 rounded-lg border bg-muted/20 p-4 ${
											isInactiveUser ? "opacity-60" : ""
										} ${isPlaceholderData ? "opacity-50" : ""}`}
									>
										<div className="space-y-1">
											<p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
												Full name
											</p>
											<div className="flex flex-wrap items-center gap-2">
												<span>{user.full_name || "N/A"}</span>
												{isCurrentUser && (
													<Badge variant="destructive">You</Badge>
												)}
											</div>
										</div>
										<div className="space-y-1">
											<p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
												Email
											</p>
											<p className="break-all">{user.email}</p>
										</div>
										<div className="grid gap-3 sm:grid-cols-2">
											<div className="space-y-1">
												<p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
													Role
												</p>
												<Badge>
													{user.is_superuser ? "Superuser" : "User"}
												</Badge>
											</div>
											<div className="space-y-1">
												<p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
													Status
												</p>
												<p>{user.is_active ? "Active" : "Inactive"}</p>
											</div>
										</div>
										<div className="flex flex-col gap-2">
											<EditUser
												user={user}
												disabled={isCurrentUser}
												trigger={renderEditTrigger(
													user,
													<Button
														type="button"
														variant="outline"
														size="sm"
														className="w-full justify-center"
														disabled={isCurrentUser}
													>
														Edit
													</Button>
												)}
											/>
											{!isInactiveUser ? (
												<DeleteUser
													id={user.id}
													disabled={disableDelete}
													trigger={
														<Button
															type="button"
															variant="outline"
															size="sm"
															className="w-full justify-center text-destructive hover:text-destructive"
															disabled={disableDelete}
														>
															Delete
														</Button>
													}
												/>
											) : null}
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>

				<div className="hidden md:block">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Full name</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Role</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="w-[180px] text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{users.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={5}
										className="py-6 text-center text-muted-foreground"
									>
										No users yet.
									</TableCell>
								</TableRow>
							) : (
								users.map((user) => {
									const isCurrentUser = currentUser?.id === user.id;
									const isInactiveUser = isUserInactive(user);
									const disableDelete = isCurrentUser;

									return (
										<TableRow
											key={user.id}
											className={`${isInactiveUser ? "opacity-60" : ""} ${
												isPlaceholderData ? "opacity-50" : ""
											}`}
										>
											<TableCell>
												<div className="flex flex-wrap items-center gap-2">
													<span>{user.full_name || "N/A"}</span>
													{isCurrentUser && (
														<Badge variant="destructive">You</Badge>
													)}
												</div>
											</TableCell>
											<TableCell>{user.email}</TableCell>
											<TableCell>
												<Badge>
													{user.is_superuser ? "Superuser" : "User"}
												</Badge>
											</TableCell>
											<TableCell>
												{user.is_active ? "Active" : "Inactive"}
											</TableCell>
											<TableCell className="text-right">
												<div className="flex justify-end gap-2">
													<EditUser
														user={user}
														disabled={isCurrentUser}
														trigger={renderEditTrigger(
															user,
															<Button
																type="button"
																variant="ghost"
																size="sm"
																disabled={isCurrentUser}
															>
																Edit
															</Button>
														)}
													/>
													{!isInactiveUser ? (
														<DeleteUser
															id={user.id}
															disabled={disableDelete}
															trigger={
																<Button
																	type="button"
																	variant="ghost"
																	size="sm"
																	className="text-destructive hover:text-destructive"
																	disabled={disableDelete}
																>
																	Delete
																</Button>
															}
														/>
													) : null}
												</div>
											</TableCell>
										</TableRow>
									);
								})
							)}
						</TableBody>
					</Table>
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

function Admin() {
	return (
		<div className="max-w-full">
			<h1 className="pt-3 text-3xl">Admin settings</h1>
			<Tabs defaultValue="user-management" className="pt-4">
				<TabsList>
					<TabsTrigger value="user-management">User management</TabsTrigger>
					<TabsTrigger value="reference-data">Reference data</TabsTrigger>
				</TabsList>
				<TabsContent value="user-management" className="space-y-4 pt-4">
					<UsersTable />
				</TabsContent>
				<TabsContent value="reference-data" className="pt-4">
					<ReferenceDataManager />
				</TabsContent>
			</Tabs>
		</div>
	);
}
