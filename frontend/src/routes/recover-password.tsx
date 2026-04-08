import { zodResolver } from "@hookform/resolvers/zod";
import {
	createFileRoute,
	Link as RouterLink,
	redirect,
} from "@tanstack/react-router";
import { Loader2, TreePine } from "lucide-react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useLoginRecoverPassword } from "@/api/endpoints/login/login";
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
import { recoverPasswordSchema } from "@/lib/schemas";
import { handleError } from "@/lib/utils";

interface FormData {
	email: string;
}

export const Route = createFileRoute("/recover-password")({
	component: RecoverPassword,
	beforeLoad: async () => {
		const token =
			typeof window !== "undefined"
				? localStorage.getItem("access_token")
				: null;
		if (token) {
			throw redirect({ to: "/" });
		}
	},
});

function RecoverPassword() {
	const form = useForm<FormData>({
		resolver: zodResolver(recoverPasswordSchema),
		mode: "onBlur",
		criteriaMode: "all",
		defaultValues: {
			email: "",
		},
	});

	const mutation = useLoginRecoverPassword({
		mutation: {
			onSuccess: () => {
				toast.success("Password recovery email sent successfully.");
				form.reset();
			},
			onError: (err) => {
				handleError(err);
			},
		},
	});

	const onSubmit: SubmitHandler<FormData> = async (data) => {
		mutation.mutateAsync({ email: data.email });
	};
	return (
		<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
			<div className="w-full max-w-sm">
				<Card>
					<div className="flex items-center gap-2 p-6">
						<TreePine size={17} strokeWidth={2.2} className="text-primary" />
						<span className="font-serif text-base font-bold tracking-wide">
							Timverse
						</span>
					</div>
					<CardHeader>
						<CardTitle className="font-serif text-2xl font-bold leading-tight tracking-tight">
							Password Recovery
						</CardTitle>
						<CardDescription className="mt-1.5 text-sm font-light">
							A password recovery email will be sent to the registered account.
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
								id="recoverPasswordForm"
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-8"
							>
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
							form="recoverPasswordForm"
							className="w-full"
							disabled={form.formState.isSubmitting}
						>
							{form.formState.isSubmitting && (
								<Loader2 className="animate-spin" />
							)}
							Continue
						</Button>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}
