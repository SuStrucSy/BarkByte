import type { ColumnDef } from "@tanstack/react-table";
import type { UserPublic } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { UserActionsMenu } from '@/components/Common/UserActionsMenu';

export const createColumns = <TData,>(
	currentUser: UserPublic | undefined,
): ColumnDef<TData, any>[] => [
	{
		accessorKey: "full_name",
		header: "Full name",
		cell: ({ row }) => {
			const name = row.getValue("full_name") ?? "N/A";
      const user = row.original as unknown as UserPublic;
			const isYou = currentUser?.id != null && user.id === currentUser.id;

			return (
				<>
					{name}
					{isYou && (
						<Badge variant="destructive" className="ml-1">
							You
						</Badge>
					)}
				</>
			);
		},
	},
	{
		accessorKey: "email",
		header: "Email",
	},
	{
		accessorKey: "is_superuser",
		header: "Role",
		cell: ({ row }) => {
			const is_superuser = row.getValue("is_superuser");
			return is_superuser ? "Superuser" : "User";
		},
	},
	{
		accessorKey: "is_active",
		header: "Status",
		cell: ({ row }) => {
			const is_active = row.getValue("is_active");
			return is_active ? "Active" : "Inactive";
		},
	},
	{
		id: "actions",
		cell: ({ row }) => {
			const user = row.original as unknown as UserPublic;

			return (
				<UserActionsMenu user={user} disabled={currentUser?.id === user.id} />
			);
		},
	},
];
