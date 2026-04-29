import { zodResolver } from "@hookform/resolvers/zod";
import { Link as RouterLink } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { type SubmitHandler, useForm } from "react-hook-form";
import type { BodyLoginLoginAccessToken } from "@/api/model";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { loginSchema } from "@/lib/schemas";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldSeparator,
	FieldSet,
} from "../ui/field";

interface LoginFormProps {
	onSubmit: SubmitHandler<BodyLoginLoginAccessToken>;
}

export function LoginForm({ onSubmit }: LoginFormProps) {
	const form = useForm<BodyLoginLoginAccessToken>({
		resolver: zodResolver(loginSchema),
		mode: "onBlur",
		criteriaMode: "all",
		defaultValues: {
			username: "",
			password: "",
		},
	});
	return (
		<Form {...form}>
			<form
				id="loginForm"
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-8"
			>
				<FieldSet>
					<FieldGroup>
						<div className="flex flex-col items-center gap-1 text-center">
							<h1 className="text-2xl font-bold">Welcome Back</h1>
							<p className="text-sm text-balance text-muted-foreground">
								Enter your credentials to continue
							</p>
						</div>
						<FormField
							control={form.control}
							name="username"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input placeholder="you@example.com" {...field} />
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
									<div className="flex items-center">
										<FormLabel>Password</FormLabel>
										<Button variant="link" asChild className="ml-auto text-sm">
											<RouterLink to="/recover-password">
												Forgot your password?
											</RouterLink>
										</Button>
									</div>
									<FormControl>
										<Input type="password" placeholder="••••••••" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Field>
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
						</Field>
						<FieldSeparator></FieldSeparator>
						<Field>
							<FieldDescription className="text-center">
								Don&apos;t have an account?
								<Button
									variant="link"
									className="shrink-0 text-xs no-underline text-muted-foreground"
									asChild
								>
									<RouterLink to="/signup">Sign Up</RouterLink>
								</Button>
							</FieldDescription>
						</Field>
					</FieldGroup>
				</FieldSet>
			</form>
		</Form>
	);
}
