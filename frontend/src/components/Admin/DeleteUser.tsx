import { useQueryClient } from "@tanstack/react-query";
import { Trash2Icon } from "lucide-react";
import { cloneElement, isValidElement, type ReactNode, useState } from "react";
import { toast } from "sonner";
import { useUsersDeleteUser } from "@/api/endpoints/users/users";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { parseError } from "@/lib/utils";
import { Button } from "../ui/button";

interface DeleteUserProps {
	id: string;
	disabled?: boolean;
	trigger?: ReactNode;
}

const isDeactivationMessage = (message: string) => {
	const normalizedMessage = message.toLowerCase();
	return (
		normalizedMessage.includes("deactivated") ||
		normalizedMessage.includes("deactivation")
	);
};

const DeleteUser = ({ id, disabled, trigger }: DeleteUserProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const queryClient = useQueryClient();

	const mutation = useUsersDeleteUser();
	const isInteractionDisabled = disabled || mutation.isPending;

	const onSubmit = async () => {
		if (disabled) {
			setIsOpen(false);
			return;
		}

		setIsOpen(false);

		try {
			const data = await mutation.mutateAsync({ userId: id });
			const message = data.message;
			queryClient.invalidateQueries();

			if (isDeactivationMessage(message)) {
				toast.warning("User deactivated", {
					id: `delete-user-${id}`,
					description: message,
					duration: Infinity,
				});
				return;
			}

			toast.success(message);
		} catch (err) {
			const { title, description } = parseError(err);
			toast.error(title, { description });
		}
	};

	const renderedTrigger = (() => {
		if (!trigger) {
			return (
				<Button variant="ghost" size="sm" disabled={isInteractionDisabled}>
					<Trash2Icon />
					Delete User
				</Button>
			);
		}

		if (isValidElement<{ disabled?: boolean }>(trigger)) {
			return cloneElement(trigger, {
				disabled: isInteractionDisabled || trigger.props.disabled,
			});
		}

		return trigger;
	})();

	return (
		<AlertDialog
			open={isOpen}
			onOpenChange={(open) => {
				if (open && isInteractionDisabled) {
					return;
				}
				setIsOpen(open);
			}}
		>
			{disabled ? (
				renderedTrigger
			) : (
				<AlertDialogTrigger asChild>{renderedTrigger}</AlertDialogTrigger>
			)}
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete User</AlertDialogTitle>
					<AlertDialogDescription>
						All items associated with this user will also be{" "}
						<strong>permanently deleted.</strong> Are you sure? You will not be
						able to undo this action.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={mutation.isPending}>
						Cancel
					</AlertDialogCancel>
					<Button
						variant="destructive"
						type="button"
						disabled={mutation.isPending}
						onClick={() => {
							void onSubmit();
						}}
					>
						Delete
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default DeleteUser;
