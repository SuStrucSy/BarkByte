import { zodResolver } from "@hookform/resolvers/zod";
import {
	createFileRoute,
	Link as RouterLink,
	redirect,
} from "@tanstack/react-router";
import { Loader2, TreePine } from "lucide-react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod/v4";
import type { BodyLoginLoginAccessToken } from "@/api/model";
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
import useAuth from "@/hooks/useAuth";
import { loginSchema } from "@/lib/schemas";

export const Route = createFileRoute("/login")({
	validateSearch: z.object({
		redirect: z.string().optional(),
	}),
	component: Login,
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

function Login() {
	const { redirect } = Route.useSearch();
	const { loginMutation, resetError } = useAuth({ redirectTo: redirect });
	const form = useForm<BodyLoginLoginAccessToken>({
		resolver: zodResolver(loginSchema),
		mode: "onBlur",
		criteriaMode: "all",
		defaultValues: {
			username: "",
			password: "",
		},
	});

	const onSubmit: SubmitHandler<BodyLoginLoginAccessToken> = async (data) => {
		resetError();

		try {
			await loginMutation.mutateAsync({ data: data });
		} catch {
			// error is handled by useAuth hook
		}
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
							Welcome back
						</CardTitle>
						<CardDescription className="mt-1.5 text-sm font-light">
							Enter your credentials to continue
						</CardDescription>
						<CardAction>
							<Button
								variant="link"
								className="shrink-0 pt-0.5 text-xs no-underline"
								asChild
							>
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
												<Input placeholder="you@example.com" {...field} />
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
													placeholder="••••••••"
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
