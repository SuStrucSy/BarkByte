import { zodResolver } from "@hookform/resolvers/zod";
import { Link as RouterLink } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { type SubmitHandler, useForm } from "react-hook-form";
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
import { recoverPasswordSchema } from "@/lib/schemas";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldSeparator,
	FieldSet,
} from "../ui/field";

interface FormData {
	email: string;
}

interface RecoverPasswordFormProps {
	onSubmit: SubmitHandler<FormData>;
}

export function RecoverPasswordForm({ onSubmit }: RecoverPasswordFormProps) {
	const form = useForm<FormData>({
		resolver: zodResolver(recoverPasswordSchema),
		mode: "onBlur",
		criteriaMode: "all",
		defaultValues: { email: "" },
	});
	return (
		<Form {...form}>
			<form
				id="recoverPasswordForm"
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-8"
			>
				<FieldSet>
					<FieldGroup>
						<div className="flex flex-col items-center gap-1 text-center">
							<h1 className="text-2xl font-bold">Password Recovery</h1>
							<p className="text-sm text-balance text-muted-foreground">
								A password recovery email will be sent to the registered
								account.
							</p>
						</div>
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
						<Field>
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
						</Field>
						<FieldSeparator></FieldSeparator>
						<Field>
							<FieldDescription className="text-center">
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
