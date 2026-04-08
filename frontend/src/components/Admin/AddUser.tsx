import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";

import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	getUsersReadUsersQueryKey,
	useUsersCreateUser,
} from "@/api/endpoints/users/users";
import type { HTTPValidationError, UserCreate } from "@/api/model";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { addUserSchema } from "@/lib/schemas";
import { handleError } from "@/lib/utils";

interface UserCreateForm extends UserCreate {
	confirm_password: string;
}

const AddUser = () => {
	const [isOpen, setIsOpen] = useState(false);
	const queryClient = useQueryClient();
	const form = useForm({
		resolver: zodResolver(addUserSchema),
		mode: "onBlur",
		criteriaMode: "all",
		defaultValues: {
			email: "",
			full_name: "",
			password: "",
			confirm_password: "",
			is_superuser: false,
			is_active: false,
		},
	});

	const mutation = useUsersCreateUser({
		mutation: {
			onSuccess: () => {
				toast.success("User created successfully.");
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

	const onSubmit: SubmitHandler<UserCreateForm> = (data) => {
		mutation.mutateAsync({ data: data });
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
			<Form {...form}>
				<form id="addUserForm" onSubmit={form.handleSubmit(onSubmit)}>
					<DialogTrigger asChild>
						<Button value="add-user" className="my-4">
							<PlusIcon />
							Add User
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-[425px]">
						<DialogHeader>
							<DialogTitle>Add User</DialogTitle>
							<DialogDescription>
								Fill in the form below to add a new user to the system.
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
								<Button variant="outline">Cancel</Button>
							</DialogClose>
							<Button form="addUserForm" type="submit">
								Save changes
							</Button>
						</DialogFooter>
					</DialogContent>
				</form>
			</Form>
		</Dialog>
	);
};

export default AddUser;
