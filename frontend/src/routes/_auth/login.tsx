import { createFileRoute, redirect } from "@tanstack/react-router";
import { type SubmitHandler } from "react-hook-form";
import { z } from "zod/v4";
import type { BodyLoginLoginAccessToken } from "@/api/model";
import useAuth from "@/hooks/useAuth";
import { LoginForm } from "@/components/Auth/LoginForm";

export const Route = createFileRoute("/_auth/login")({
  validateSearch: z.object({
    redirect: z.string().optional(),
  }),
  component: LoginPage,
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

function LoginPage() {
  const { redirect } = Route.useSearch();
  const { loginMutation, resetError } = useAuth({ redirectTo: redirect });

  const onSubmit: SubmitHandler<BodyLoginLoginAccessToken> = async (data) => {
    resetError();
    try {
      await loginMutation.mutateAsync({ data });
    } catch {
      // error is handled by useAuth hook
    }
  };

  return <LoginForm onSubmit={onSubmit} />;
}
