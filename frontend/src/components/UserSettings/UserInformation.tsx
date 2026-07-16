import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useUsersUpdateUserMe } from "@/api/endpoints/users/users";
import type { UserUpdateMe } from "@/api/model";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { handleError } from "@/lib/utils";
import { Button } from "../ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

const UserInformation = () => {
	const queryClient = useQueryClient();
	const [editMode, setEditMode] = useState(false);
	const { data: currentUser } = useCurrentUser();
	const form = useForm<UserUpdateMe>({
		mode: "onBlur",
		criteriaMode: "all",
		defaultValues: {
			full_name: currentUser?.full_name,
		},
	});

	const toggleEditMode = () => {
		setEditMode(!editMode);
	};

	const mutation = useUsersUpdateUserMe({
		mutation: {
			onSuccess: () => {
				toast.success("User updated successfully.");
				setEditMode(false);
			},
			onError: (err) => {
				handleError(err);
			},
			onSettled: () => {
				queryClient.invalidateQueries();
			},
		},
	});

	const onSubmit: SubmitHandler<UserUpdateMe> = async (data) => {
		mutation.mutate({ data: data });
	};

	const onCancel = () => {
		form.reset();
		toggleEditMode();
	};

	return (
		<div className="p-4">
			<h3 className="font-bold py-4">User Information</h3>
			<Form {...form}>
				<form id="editUserForm" onSubmit={form.handleSubmit(onSubmit)}>
					<div className="grid gap-4">
						<FormField
							control={form.control}
							name="full_name"
							render={({ field }) => {
								if (editMode) {
									return (
										<FormItem>
											<FormLabel>Full name</FormLabel>
											<FormControl>
												<Input type="text" placeholder="shadcn" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									);
								}
								return (
									<span className="max-w-sm truncate py-2 font-size-md">
										{currentUser?.full_name || "N/A"}
									</span>
								);
							}}
						/>
					</div>
					<div className="flex mt-4 gap-3">
						<Button
							onClick={editMode ? undefined : toggleEditMode}
							type={editMode ? "submit" : "button"}
							disabled={editMode ? !form.formState.isDirty : false}
						>
							{editMode && form.formState.isSubmitting && (
								<Loader2 className="animate-spin" />
							)}
							{editMode ? "Save" : "Edit"}
						</Button>
						{editMode && (
							<Button
								variant="secondary"
								onClick={onCancel}
								disabled={form.formState.isSubmitting}
							>
								Cancel
							</Button>
						)}
					</div>
				</form>
			</Form>
		</div>
	);
};

export default UserInformation;
