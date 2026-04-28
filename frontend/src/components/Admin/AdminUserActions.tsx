import type { ReactElement } from "react";
import type { UserPublic } from "@/api/model";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { canDeleteAdminUser, isCurrentAdminUser } from "./adminUserUtils";
import DeleteUser from "./DeleteUser";
import EditUser from "./EditUser";

interface AdminUserActionsProps {
	currentUserId: string | undefined;
	deleteButtonClassName?: string;
	deleteButtonVariant: "ghost" | "outline";
	editButtonClassName?: string;
	editButtonVariant: "ghost" | "outline";
	user: UserPublic;
}

function renderEditTrigger(
	isCurrentUser: boolean,
	trigger: ReactElement<{ disabled?: boolean }>,
) {
	if (!isCurrentUser) {
		return trigger;
	}

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<span className="inline-flex">{trigger}</span>
			</TooltipTrigger>
			<TooltipContent>Go to 'Account Settings'</TooltipContent>
		</Tooltip>
	);
}

export function AdminUserActions({
	currentUserId,
	deleteButtonClassName,
	deleteButtonVariant,
	editButtonClassName,
	editButtonVariant,
	user,
}: AdminUserActionsProps) {
	const isCurrentUser = isCurrentAdminUser(user, currentUserId);
	const disableDelete = !canDeleteAdminUser(user, currentUserId);

	return (
		<>
			<EditUser
				user={user}
				disabled={isCurrentUser}
				trigger={renderEditTrigger(
					isCurrentUser,
					<Button
						type="button"
						variant={editButtonVariant}
						size="sm"
						className={editButtonClassName}
						disabled={isCurrentUser}
					>
						Edit
					</Button>,
				)}
			/>
			<DeleteUser
				id={user.id}
				disabled={disableDelete}
				trigger={
					<Button
						type="button"
						variant={deleteButtonVariant}
						size="sm"
						className={deleteButtonClassName}
						disabled={disableDelete}
					>
						Delete
					</Button>
				}
			/>
		</>
	);
}
