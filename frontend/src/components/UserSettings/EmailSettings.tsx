import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	getUsersReadUserMeQueryKey,
	useUsersCancelEmailChangeMe,
	useUsersRequestEmailChangeMe,
	useUsersVerifyEmailChangeMe,
} from "@/api/endpoints/users/users";
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

interface EmailChangeForm {
	new_email: string;
}

const getEmailChangeToken = () => {
	if (typeof window === "undefined") return null;
	return new URLSearchParams(window.location.search).get("emailChangeToken");
};

const EmailSettings = () => {
	const queryClient = useQueryClient();
	const { data: currentUser } = useCurrentUser();
	const emailChangeToken = getEmailChangeToken();
	const form = useForm<EmailChangeForm>({
		mode: "onBlur",
		defaultValues: {
			new_email: currentUser?.pending_email ?? "",
		},
	});
	const newEmailValue = form.watch("new_email");

	useEffect(() => {
		form.reset({ new_email: currentUser?.pending_email ?? "" });
	}, [currentUser?.pending_email, form]);

	const invalidateCurrentUser = () => {
		queryClient.invalidateQueries({ queryKey: getUsersReadUserMeQueryKey() });
	};

	const requestMutation = useUsersRequestEmailChangeMe({
		mutation: {
			onSuccess: (res) => {
				toast.success(res.message ?? "Verification email sent.");
				form.reset({ new_email: "" });
				invalidateCurrentUser();
			},
			onError: handleError,
		},
	});

	const cancelMutation = useUsersCancelEmailChangeMe({
		mutation: {
			onSuccess: (res) => {
				toast.success(res.message ?? "Pending email change cancelled.");
				form.reset({ new_email: "" });
				invalidateCurrentUser();
			},
			onError: handleError,
		},
	});

	const verifyMutation = useUsersVerifyEmailChangeMe({
		mutation: {
			onSuccess: (res) => {
				toast.success(res.message ?? "Email address updated successfully.");
				window.history.replaceState(null, "", window.location.pathname);
				invalidateCurrentUser();
			},
			onError: handleError,
		},
	});

	const onSubmit: SubmitHandler<EmailChangeForm> = (data) => {
		if (!data.new_email) return;
		requestMutation.mutate({ data: { new_email: data.new_email } });
	};

	const isBusy =
		requestMutation.isPending ||
		cancelMutation.isPending ||
		verifyMutation.isPending;

	return (
		<div className="grid max-w-xl gap-6 p-4">
			<div className="grid gap-2">
				<h3 className="font-bold">Email</h3>
				<div className="grid gap-1 text-sm">
					<span className="text-muted-foreground">Current email</span>
					<span className="break-all">{currentUser?.email}</span>
				</div>
				{currentUser?.pending_email && (
					<div className="grid gap-2 rounded-md border p-3 text-sm">
						<span className="text-muted-foreground">Pending email</span>
						<span className="break-all">{currentUser.pending_email}</span>
						<Button
							type="button"
							variant="secondary"
							className="w-fit"
							disabled={isBusy}
							onClick={() => cancelMutation.mutate()}
						>
							Cancel pending change
						</Button>
					</div>
				)}
			</div>

			{emailChangeToken && (
				<div className="grid gap-3 rounded-md border p-3">
					<div className="grid gap-1">
						<h4 className="text-sm font-medium">Verify email change</h4>
						<p className="text-sm text-muted-foreground">
							Confirm this pending email change for your account.
						</p>
					</div>
					<Button
						type="button"
						className="w-fit"
						disabled={isBusy}
						onClick={() =>
							verifyMutation.mutate({ data: { token: emailChangeToken } })
						}
					>
						{verifyMutation.isPending && <Loader2 className="animate-spin" />}
						Verify email change
					</Button>
				</div>
			)}

			<Form {...form}>
				<form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
					<FormField
						control={form.control}
						name="new_email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>New email</FormLabel>
								<FormControl>
									<Input
										type="email"
										placeholder="you@example.com"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button
						type="submit"
						className="w-fit"
						disabled={isBusy || !newEmailValue}
					>
						{requestMutation.isPending && <Loader2 className="animate-spin" />}
						Send verification email
					</Button>
				</form>
			</Form>
		</div>
	);
};

export default EmailSettings;
