import { useQueryClient } from "@tanstack/react-query";
import { UserPenIcon } from "lucide-react";

import { type ReactNode, useState } from "react";
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
	disabled?: boolean;
	trigger?: ReactNode;
}

interface UserUpdateForm extends UserUpdate {
	password?: string;
	confirm_password?: string;
}

const getFormValues = (user: UserPublic): UserUpdateForm => ({
	email: user.email,
	full_name: user.full_name ?? "",
	is_active: user.is_active,
	is_superuser: user.is_superuser,
	password: "",
	confirm_password: "",
});

const toBoolean = (checked: boolean | "indeterminate") => checked === true;

const EditUser = ({ user, disabled, trigger }: EditUserProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const queryClient = useQueryClient();
	const formId = `editUserForm-${user.id}`;
	const isSuperuserFieldId = `${formId}-is-superuser`;
	const isActiveFieldId = `${formId}-is-active`;
	const form = useForm<UserUpdateForm>({
		mode: "onBlur",
		criteriaMode: "all",
		defaultValues: getFormValues(user),
	});
	const isSuperuserValue = form.watch("is_superuser") ?? false;
	const isActiveValue = form.watch("is_active") ?? false;

	const mutation = useUsersUpdateUser({
		mutation: {
			onSuccess: (updatedUser) => {
				toast.success("User updated successfully.");
				form.reset(getFormValues(updatedUser));
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
		const payload: UserUpdate = {
			email: data.email,
			full_name: data.full_name,
			is_active: data.is_active,
			is_superuser: data.is_superuser,
		};

		mutation.mutate({ data: payload, userId: user.id });
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				if (open) {
					form.reset(getFormValues(user));
				}
				setIsOpen(open);
			}}
		>
			<DialogTrigger asChild>
				{trigger ?? (
					<Button variant="ghost" size="sm" disabled={disabled}>
						<UserPenIcon fontSize="16px" />
						Edit User
					</Button>
				)}
			</DialogTrigger>
			<DialogContent>
				<Form {...form}>
					<form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
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
							<FormItem className="flex flex-row items-center gap-2">
								<FormControl>
									<Checkbox
										id={isSuperuserFieldId}
										checked={isSuperuserValue}
										onCheckedChange={(checked) => {
											const value = toBoolean(checked);
											form.setValue("is_superuser", value, {
												shouldDirty: true,
												shouldTouch: true,
												shouldValidate: true,
											});
										}}
									/>
								</FormControl>
								<FormLabel
									htmlFor={isSuperuserFieldId}
									className="text-sm font-normal"
								>
									Is superuser?
								</FormLabel>
							</FormItem>
							<FormItem className="flex flex-row items-center gap-2">
								<FormControl>
									<Checkbox
										id={isActiveFieldId}
										checked={isActiveValue}
										onCheckedChange={(checked) => {
											const value = toBoolean(checked);
											form.setValue("is_active", value, {
												shouldDirty: true,
												shouldTouch: true,
												shouldValidate: true,
											});
										}}
									/>
								</FormControl>
								<FormLabel
									htmlFor={isActiveFieldId}
									className="text-sm font-normal"
								>
									Is active?
								</FormLabel>
							</FormItem>
						</div>
						<DialogFooter>
							<DialogClose asChild>
								<Button variant="ghost" disabled={form.formState.isSubmitting}>
									Cancel
								</Button>
							</DialogClose>
							<Button type="submit" disabled={form.formState.isSubmitting}>
								Save
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

export default EditUser;
