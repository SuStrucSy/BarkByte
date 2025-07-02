import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2Icon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { Button } from "../ui/button";
import { Form } from "../ui/form";

const DeleteUser = ({ id }: { id: string }) => {
	const [isOpen, setIsOpen] = useState(false);
	const queryClient = useQueryClient();
	const form = useForm();

	const deleteUser = async (id: string) => {
		await api.delete("/api/v1/users/:user_id", undefined, {
			params: { user_id: id },
		});
	};

	const mutation = useMutation({
		mutationFn: deleteUser,
		onSuccess: () => {
			toast.success("The user was deleted successfully");
			setIsOpen(false);
		},
		onError: () => {
			toast.error("An error occurred while deleting the user");
		},
		onSettled: () => {
			queryClient.invalidateQueries();
		},
	});

	const onSubmit = async () => {
		mutation.mutate(id);
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
			<Form {...form}>
				<form id="deleteUserForm" onSubmit={form.handleSubmit(onSubmit)}>
					<DialogTrigger asChild>
						<Button variant="ghost" size="sm">
							<Trash2Icon />
							Delete User
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Delete User</DialogTitle>
							<DialogDescription>
								All items associated with this user will also be{" "}
								<strong>permanently deleted.</strong> Are you sure? You will not
								be able to undo this action.
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<DialogClose asChild>
								<Button variant="ghost" disabled={form.formState.isSubmitting}>
									Cancel
								</Button>
							</DialogClose>
							<Button
								variant="destructive"
								type="submit"
								disabled={form.formState.isSubmitting}
								form="deleteUserForm"
							>
								Delete
							</Button>
						</DialogFooter>
					</DialogContent>
				</form>
			</Form>
		</Dialog>
	);
};

export default DeleteUser;
