import { useQueryClient } from "@tanstack/react-query";
import { UserPenIcon } from "lucide-react";

import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	getUsersReadUsersQueryKey,
	useUsersUpdateUser,
} from "@/api/endpoints/users/users";
import type { HTTPValidationError, UserPublic, UserUpdate } from "@/api/model";
import { handleError } from "@/lib/utils";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

interface EditUserProps {
	user: UserPublic;
}

interface UserUpdateForm extends UserUpdate {
	password?: string;
	confirm_password?: string;
}

const EditUser = ({ user }: EditUserProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const queryClient = useQueryClient();
	const form = useForm<UserUpdateForm>({
		mode: "onBlur",
		criteriaMode: "all",
		defaultValues: user,
	});

	const mutation = useUsersUpdateUser({
		mutation: {
			onSuccess: () => {
				toast.success("User updated successfully.");
				form.reset();
				setIsOpen(false);
			},
			onError: (err: undefined | HTTPValidationError) => {
				handleError(err);
			},
			onSettled: () => {
				queryClient.invalidateQueries({
					queryKey: getUsersReadUsersQueryKey(),
				});
			},
		},
	});

	const onSubmit: SubmitHandler<UserUpdateForm> = async (data) => {
		if (data.password === "") {
			data.password = undefined;
		}
		mutation.mutate({ data: data, userId: user.id });
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
			<Form {...form}>
				<form id="editUserForm" onSubmit={form.handleSubmit(onSubmit)}>
					<DialogTrigger asChild>
						<Button variant="ghost" size="sm">
							<UserPenIcon fontSize="16px" />
							Edit User
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Edit User</DialogTitle>
							<DialogDescription>
								Update the user details below.
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4">
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input
												type="email"
												placeholder="you@example.com"
												{...field}
												value={field.value ?? ""}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="full_name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Full Name</FormLabel>
										<FormControl>
											<Input
												placeholder="shadcn"
												{...field}
												value={field.value ?? ""}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Password</FormLabel>
										<FormControl>
											<Input
												type="password"
												placeholder="••••••••"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="confirm_password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Confirm Password</FormLabel>
										<FormControl>
											<Input
												type="password"
												placeholder="••••••••"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="is_superuser"
								render={({ field }) => {
									return (
										<FormItem className="flex flex-row items-center gap-2">
											<FormControl>
												<Checkbox
													disabled={field.disabled}
													checked={field.value ?? false}
													onCheckedChange={(checked) => field.onChange(checked)}
												/>
											</FormControl>
											<FormLabel className="text-sm font-normal">
												Is superuser?
											</FormLabel>
										</FormItem>
									);
								}}
							/>
							<FormField
								control={form.control}
								name="is_active"
								render={({ field }) => {
									return (
										<FormItem className="flex flex-row items-center gap-2">
											<FormControl>
												<Checkbox
													disabled={field.disabled}
													checked={field.value ?? false}
													onCheckedChange={(checked) => field.onChange(checked)}
												/>
											</FormControl>
											<FormLabel className="text-sm font-normal">
												Is active?
											</FormLabel>
										</FormItem>
									);
								}}
							/>
						</div>
						<DialogFooter>
							<DialogClose asChild>
								<Button variant="ghost" disabled={form.formState.isSubmitting}>
									Cancel
								</Button>
							</DialogClose>
							<Button
								form="editUserForm"
								type="submit"
								disabled={form.formState.isSubmitting}
							>
								Save
							</Button>
						</DialogFooter>
					</DialogContent>
				</form>
			</Form>
		</Dialog>
	);
};

export default EditUser;
