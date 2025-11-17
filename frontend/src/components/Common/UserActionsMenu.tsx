import { EllipsisVerticalIcon } from "lucide-react";
import type { UserPublic } from "@/lib/types";
import DeleteUser from "../Admin/DeleteUser";
import EditUser from "../Admin/EditUser";
import { Button } from "../ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface UserActionsMenuProps {
	user: UserPublic;
	disabled?: boolean;
}

export const UserActionsMenu = ({ user, disabled }: UserActionsMenuProps) => {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" color="inherit" disabled={disabled}>
					<EllipsisVerticalIcon />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56" align="start">
				<EditUser user={user} />
				<DeleteUser id={user.id} />
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
