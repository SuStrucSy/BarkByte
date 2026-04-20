import { zodResolver } from "@hookform/resolvers/zod";
import { type SubmitHandler, useForm } from "react-hook-form";
import { Link as RouterLink } from "@tanstack/react-router";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { resetPasswordSchema } from "@/lib/schemas";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldSeparator,
  FieldSet,
} from "../ui/field";
import { Loader2 } from "lucide-react";

interface NewPasswordForm {
  new_password: string;
  confirm_password: string;
}

interface ResetPasswordFormProps {
  onSubmit: SubmitHandler<NewPasswordForm>;
}

export function ResetPasswordForm({ onSubmit }: ResetPasswordFormProps) {
  const form = useForm<NewPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: { new_password: "", confirm_password: "" },
  });
  return (
    <Form {...form}>
      <form
        id="resetPasswordForm"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
      >
        <FieldSet>
          <FieldGroup>
            <div className="flex flex-col items-center gap-1 text-center">
              <h1 className="text-2xl font-bold">Reset Password</h1>
              <p className="text-sm text-balance text-muted-foreground">
                Enter your new password and confirm it to complete the reset.
              </p>
            </div>

            <FormField
              control={form.control}
              name="new_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
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
                form="resetPasswordForm"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting && (
                  <Loader2 className="animate-spin" />
                )}
                Reset Password
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
