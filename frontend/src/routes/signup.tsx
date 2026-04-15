import { zodResolver } from "@hookform/resolvers/zod";
import {
  createFileRoute,
  Link as RouterLink,
  redirect,
} from "@tanstack/react-router";
import { Loader2, TreePine } from "lucide-react";
import { type SubmitHandler, useForm } from "react-hook-form";
import type { UserRegister } from "@/api/model";
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
import useAuth from "@/hooks/useAuth";
import { signupSchema } from "@/lib/schemas";
import { useState } from "react";
import { SignUpSuccessComponent } from "@/components/Common/SignUpSuccess";

export const Route = createFileRoute("/signup")({
  component: SignUp,
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

interface UserRegisterForm extends UserRegister {
  confirm_password: string;
}

function SignUp() {
  const [isSuccess, setIsSuccess] = useState(false);
  const { signUpMutation } = useAuth();
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

  const onSubmit: SubmitHandler<UserRegisterForm> = (data) => {
    signUpMutation.mutate(
      { data: data },
      {
        onSuccess: () => {
          setIsSuccess(true);
        },
      },
    );
  };

  if (isSuccess) {
    return (
      <SignUpSuccessComponent
        title="Account created"
        message="We’ve sent a verification email to your inbox. Please check your email to activate your account."
        action={{
          label: "Go to Login",
          to: "/login",
        }}
      />
    );
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <RouterLink
            to="/"
            className="flex items-center gap-2 p-6 transition-transform duration-150 hover:scale-[1.02] hover:text-green-800 dark:hover:text-green-300"
          >
            <TreePine size={17} strokeWidth={2.2} />
            <span className="font-serif text-base font-bold tracking-wide">
              Timverse
            </span>
          </RouterLink>
          <CardHeader>
            <CardTitle className="font-serif text-2xl font-bold leading-tight tracking-tight">
              Sign Up
            </CardTitle>
            <CardDescription className="mt-1.5 text-sm font-light">
              Enter details below to create a new account
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
                id="signupForm"
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
                          placeholder="shadcn"
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
                <FormField
                  control={form.control}
                  name="confirm_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
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
              form="signupForm"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting && (
                <Loader2 className="animate-spin" />
              )}
              Sign Up
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
