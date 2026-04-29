import { zodResolver } from "@hookform/resolvers/zod";
import { Link as RouterLink } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { type SubmitHandler, useForm } from "react-hook-form";
import type { UserRegister } from "@/api/model";
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
import { signupSchema } from "@/lib/schemas";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldSeparator,
	FieldSet,
} from "../ui/field";

interface SignUpFormProps {
	onSubmit: SubmitHandler<UserRegisterForm>;
}

interface UserRegisterForm extends UserRegister {
	confirm_password: string;
}

export function SignUpForm({ onSubmit }: SignUpFormProps) {
	const form = useForm<UserRegisterForm>({
		resolver: zodResolver(signupSchema),
		mode: "onBlur",
		criteriaMode: "all",
		defaultValues: {
			email: "",
			full_name: "",
			password: "",
			confirm_password: "",
		},
	});
	return (
		<Form {...form}>
			<form
				id="signupForm"
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-8"
			>
				<FieldSet>
					<FieldGroup>
						<div className="flex flex-col items-center gap-1 text-center">
							<h1 className="text-2xl font-bold">Sign Up</h1>
							<p className="text-sm text-balance text-muted-foreground">
								Enter details below to create a new account
							</p>
						</div>
						<FormField
							control={form.control}
							name="email"
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
							name="full_name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Full Name</FormLabel>
									<FormControl>
										<Input
											placeholder="Jane Smith"
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
										<Input type="password" placeholder="••••••••" {...field} />
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
										<Input type="password" placeholder="••••••••" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Field>
							<Button
								type="submit"
								form="signupForm"
								className="w-full"
								disabled={form.formState.isSubmitting}
							>
								{form.formState.isSubmitting && (
									<Loader2 className="animate-spin" />
								)}
								Sign Up
							</Button>
						</Field>
						<FieldSeparator></FieldSeparator>
						<Field>
							<FieldDescription className="text-center">
								Already have an account?
								<Button
									variant="link"
									className="shrink-0 text-xs no-underline text-muted-foreground"
									asChild
								>
									<RouterLink to="/login">Log In</RouterLink>
								</Button>
							</FieldDescription>
						</Field>
					</FieldGroup>
				</FieldSet>
			</form>
		</Form>
	);
}
