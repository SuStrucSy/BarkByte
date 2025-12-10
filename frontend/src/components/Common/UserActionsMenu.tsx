import { EllipsisVerticalIcon } from "lucide-react";
import DeleteUser from "../Admin/DeleteUser";
import EditUser from "../Admin/EditUser";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import type { UserPublic } from '@/api/model';
import { Button } from '../ui/button';

interface UserActionsMenuProps {
	user: UserPublic;
	disabled?: boolean;
}

export const UserActionsMenu = ({ user, disabled }: UserActionsMenuProps) => {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger>
				<Button variant="ghost" size="icon" color="inherit" disabled={disabled}>
					<EllipsisVerticalIcon className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-24" align="start">
				<EditUser user={user} />
				<DropdownMenuSeparator />
				<DeleteUser id={user.id} />
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
