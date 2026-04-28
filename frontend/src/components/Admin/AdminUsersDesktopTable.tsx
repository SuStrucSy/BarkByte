import type { UserPublic } from "@/api/model";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { AdminUserActions } from "./AdminUserActions";
import {
	getUserRoleLabel,
	getUserStatusLabel,
	isCurrentAdminUser,
	isUserInactive,
} from "./adminUserUtils";

interface AdminUsersDesktopTableProps {
	currentUserId: string | undefined;
	isPlaceholderData: boolean;
	users: UserPublic[];
}

export function AdminUsersDesktopTable({
	currentUserId,
	isPlaceholderData,
	users,
}: AdminUsersDesktopTableProps) {
	return (
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
						const isCurrentUser = isCurrentAdminUser(user, currentUserId);
						const isInactiveUser = isUserInactive(user);

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
										{isCurrentUser ? (
											<Badge variant="destructive">You</Badge>
										) : null}
									</div>
								</TableCell>
								<TableCell>{user.email}</TableCell>
								<TableCell>
									<Badge>{getUserRoleLabel(user)}</Badge>
								</TableCell>
								<TableCell>{getUserStatusLabel(user)}</TableCell>
								<TableCell className="text-right">
									{!isInactiveUser ? (
										<div className="flex justify-end gap-2">
											<AdminUserActions
												currentUserId={currentUserId}
												deleteButtonClassName="text-destructive hover:text-destructive"
												deleteButtonVariant="ghost"
												editButtonVariant="ghost"
												user={user}
											/>
										</div>
									) : null}
								</TableCell>
							</TableRow>
						);
					})
				)}
			</TableBody>
		</Table>
	);
}
