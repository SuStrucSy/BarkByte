import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import useAuth from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { handleError } from "@/utils";
import { Button } from "../ui/button";
import { Form } from "../ui/form";

const DeleteConfirmation = () => {
	const [isOpen, setIsOpen] = useState(false);
	const queryClient = useQueryClient();
	const form = useForm();
	const { logout } = useAuth();

	const mutation = useMutation({
		mutationFn: () => api.delete("/api/v1/users/me", undefined),
		onSuccess: () => {
			toast.success("Your account has been successfully deleted");
			setIsOpen(false);
			logout();
		},
		onError: (err) => {
			handleError(err);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["currentUser"] });
		},
	});

	const onSubmit = async () => {
		mutation.mutate();
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
			<Form {...form}>
				<form id="deleteAccountForm" onSubmit={form.handleSubmit(onSubmit)}>
					<DialogTrigger asChild>
						<Button variant="destructive" className="mt-4">
							Delete
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogClose />
						<DialogHeader>
							<DialogTitle>Confirmation Required</DialogTitle>
						</DialogHeader>
						<p className="mb-4">
							All your account data will be{" "}
							<strong>permanently deleted.</strong> If you are sure, please
							click <strong>"Confirm"</strong> to proceed. This action cannot be
							undone.
						</p>
						<DialogFooter>
							<DialogTrigger asChild>
								<Button variant="ghost">Cancel</Button>
							</DialogTrigger>
							<Button
								form="deleteAccountForm"
								variant="destructive"
								type="submit"
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

export default DeleteConfirmation;
