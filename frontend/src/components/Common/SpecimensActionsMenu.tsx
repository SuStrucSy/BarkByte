import { EllipsisVerticalIcon } from "lucide-react";
import type { SpecimenPublic } from "@/lib/types";
import DeleteSpecimen from "../Specimens/DeleteSpecimen";
import EditSpecimen from "../Specimens/EditSpecimen";
import { Button } from "../ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface SpecimenActionsMenuProps {
	specimen: SpecimenPublic;
	disabled?: boolean;
}

export const SpecimensActionsMenu = ({
	specimen,
	disabled,
}: SpecimenActionsMenuProps) => {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" color="inherit" disabled={disabled}>
					<EllipsisVerticalIcon />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56" align="start">
				<EditSpecimen user={specimen} />
				<DeleteSpecimen id={specimen.id} />
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
