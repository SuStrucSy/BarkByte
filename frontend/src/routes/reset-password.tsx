import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
	createFileRoute,
	Link as RouterLink,
	redirect,
	useNavigate,
} from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { Loader2 } from "lucide-react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { isLoggedIn } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { resetPasswordSchema } from "@/lib/schemas";
import { handleError } from "@/utils";

interface NewPasswordForm {
	new_password: string;
	confirm_password: string;
}

const passwordSchema = z.object({
	token: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/reset-password")({
	validateSearch: zodValidator(passwordSchema),
	component: ResetPassword,
	beforeLoad: async () => {
		if (isLoggedIn()) {
			throw redirect({
				to: "/",
			});
		}
	},
});

function ResetPassword() {
	const form = useForm<NewPasswordForm>({
		resolver: zodResolver(resetPasswordSchema),
		mode: "onBlur",
		criteriaMode: "all",
		defaultValues: {
			new_password: "",
			confirm_password: "",
		},
	});
	const navigate = useNavigate();
	const { token } = Route.useSearch();

	const resetPassword = async (data: NewPasswordForm) => {
		console.log(token);
		if (!token) return;
		await api.post("/api/v1/reset-password/", {
			new_password: data.new_password,
			token: token,
		});
	};

	const mutation = useMutation({
		mutationFn: resetPassword,
		onSuccess: () => {
			toast.success("Password updated successfully.");
			form.reset();
			navigate({ to: "/login" });
		},
		onError: (err) => {
			handleError(err);
		},
	});

	const onSubmit: SubmitHandler<NewPasswordForm> = async (data) => {
		console.log(data);
		mutation.mutate(data);
	};

	return (
		<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
			<div className="w-full max-w-sm">
				<Card>
					<CardHeader>
						<CardTitle className="text-2xl">Reset Password</CardTitle>
						<CardDescription>
							Please enter your new password and confirm it to reset your
							password.
						</CardDescription>
						<CardAction>
							<Button variant="link" asChild>
								<RouterLink to="/login">Log In</RouterLink>
							</Button>
						</CardAction>
					</CardHeader>
					<CardContent>
						<Form {...form}>
							<form
								id="resetPasswordForm"
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-8"
							>
								<FormField
									control={form.control}
									name="new_password"
									render={({ field }) => (
										<FormItem>
											<FormLabel>New Password</FormLabel>
											<FormControl>
												<Input
													type="password"
													placeholder="shadcn"
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
													placeholder="shadcn"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</form>
						</Form>
					</CardContent>
					<CardFooter className="flex-col gap-2">
						<Button
							type="submit"
							form="resetPasswordForm"
							className="w-full"
							disabled={form.formState.isSubmitting}
						>
							{form.formState.isSubmitting && (
								<Loader2 className="animate-spin" />
							)}
							Reset Password
						</Button>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}
