import type { UserPublic } from "@/api/model";
import { Badge } from "@/components/ui/badge";
import { AdminUserActions } from "./AdminUserActions";
import {
	getUserRoleLabel,
	getUserStatusLabel,
	isCurrentAdminUser,
	isUserInactive,
} from "./adminUserUtils";

interface AdminUsersMobileListProps {
	currentUserId: string | undefined;
	isPlaceholderData: boolean;
	users: UserPublic[];
}

export function AdminUsersMobileList({
	currentUserId,
	isPlaceholderData,
	users,
}: AdminUsersMobileListProps) {
	if (users.length === 0) {
		return (
			<div className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
				No users yet.
			</div>
		);
	}

	return (
		<div className="space-y-3">
			{users.map((user) => {
				const isCurrentUser = isCurrentAdminUser(user, currentUserId);
				const isInactiveUser = isUserInactive(user);

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
								{isCurrentUser ? (
									<Badge variant="destructive">You</Badge>
								) : null}
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
								<Badge>{getUserRoleLabel(user)}</Badge>
							</div>
							<div className="space-y-1">
								<p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
									Status
								</p>
								<p>{getUserStatusLabel(user)}</p>
							</div>
						</div>
						<div className="flex flex-col gap-2">
							<AdminUserActions
								currentUserId={currentUserId}
								deleteButtonClassName="w-full justify-center text-destructive hover:text-destructive"
								deleteButtonVariant="outline"
								editButtonClassName="w-full justify-center"
								editButtonVariant="outline"
								showDelete={!isInactiveUser}
								user={user}
							/>
						</div>
					</div>
				);
			})}
		</div>
	);
}
