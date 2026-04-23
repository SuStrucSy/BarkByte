import { EllipsisVerticalIcon } from "lucide-react";
import type { UserPublic } from "@/api/model";
import DeleteUser from "../Admin/DeleteUser";
import EditUser from "../Admin/EditUser";
import { Button } from "../ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface UserActionsMenuProps {
	user: UserPublic;
	disabled?: boolean;
}

export const UserActionsMenu = ({ user, disabled }: UserActionsMenuProps) => {
	const isInactiveUser = user.is_active !== true;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" color="inherit" disabled={disabled}>
					<EllipsisVerticalIcon className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-24" align="start">
				<EditUser user={user} />
				{!isInactiveUser ? (
					<>
						<DropdownMenuSeparator />
						<DeleteUser id={user.id} />
					</>
				) : null}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
