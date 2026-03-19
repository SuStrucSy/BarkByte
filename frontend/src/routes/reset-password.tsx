import { zodResolver } from "@hookform/resolvers/zod";
import {
  createFileRoute,
  Link as RouterLink,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod/v4";
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
import { resetPasswordSchema } from "@/lib/schemas";
import { handleError } from "@/lib/utils";
import { useLoginResetPassword } from "@/api/endpoints/login/login.gen";

interface NewPasswordForm {
  new_password: string;
  confirm_password: string;
}

const passwordSchema = z.object({
  token: z.string().min(1),
});

export const Route = createFileRoute("/reset-password")({
  validateSearch: passwordSchema,
  component: ResetPassword,
  beforeLoad: async ({ search }) => {
    // ✅ Direct localStorage check (SSR-safe)
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;

    if (token) {
      throw redirect({ to: "/" });
    }

    if (!search.token) {
      throw redirect({ to: "/login" });
    }
  },
});

function ResetPassword() {
  const { token } = Route.useSearch();
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
  const mutation = useLoginResetPassword({
    mutation: {
      onSuccess: () => {
        toast.success("Password updated successfully.");
        form.reset();
        navigate({ to: "/login" });
      },
      onError: (err) => {
        handleError(err);
      },
    },
  });

  const onSubmit: SubmitHandler<NewPasswordForm> = async (data) => {
    mutation.mutateAsync({
      data: { new_password: data.new_password, token: token },
    });
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
