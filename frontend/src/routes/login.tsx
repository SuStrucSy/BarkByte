import { zodResolver } from "@hookform/resolvers/zod";
import {
	createFileRoute,
	Link as RouterLink,
	redirect,
} from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { type SubmitHandler, useForm } from "react-hook-form";
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
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import useAuth, { isLoggedIn } from "@/hooks/useAuth";
import { loginSchema } from "@/lib/schemas";
import type { AccessToken } from "@/lib/types";

export const Route = createFileRoute("/login")({
	component: Login,
	beforeLoad: async () => {
		if (isLoggedIn()) {
			throw redirect({
				to: "/",
			});
		}
	},
});

function Login() {
	const { loginMutation, error, resetError } = useAuth();
	const form = useForm<AccessToken>({
		resolver: zodResolver(loginSchema),
		mode: "onBlur",
		criteriaMode: "all",
		defaultValues: {
			username: "",
			password: "",
		},
	});

	const onSubmit: SubmitHandler<AccessToken> = async (data) => {
		resetError();

		try {
			await loginMutation.mutateAsync(data);
		} catch {
			// error is handled by useAuth hook
		}
	};

	return (
		<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
			<div className="w-full max-w-sm">
				<Card>
					<CardHeader>
						<CardTitle className="text-xl">Login to your account</CardTitle>
						<CardDescription>
							Enter your email below to login to your account
						</CardDescription>
						<CardAction>
							<Button variant="link" asChild>
								<RouterLink to="/signup">Sign Up</RouterLink>
							</Button>
						</CardAction>
					</CardHeader>
					<CardContent>
						<Form {...form}>
							<form
								id="loginForm"
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-8"
							>
								<FormField
									control={form.control}
									name="username"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Email</FormLabel>
											<FormControl>
												<Input placeholder="shadcn" {...field} />
											</FormControl>
											<FormDescription>
												This is the email that you registered with.
											</FormDescription>
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
							form="loginForm"
							className="w-full"
							disabled={form.formState.isSubmitting}
						>
							{form.formState.isSubmitting && (
								<Loader2 className="animate-spin" />
							)}
							Login
						</Button>
						<Button variant="link" asChild>
							<RouterLink to="/recover-password">
								Forgot your password?
							</RouterLink>
						</Button>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}
