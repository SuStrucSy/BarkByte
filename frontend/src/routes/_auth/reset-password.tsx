import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { type SubmitHandler } from "react-hook-form";
import { toast } from "sonner";
import z from "zod/v4";
import { useLoginResetPassword } from "@/api/endpoints/login/login";

import { handleError } from "@/lib/utils";
import { ResetPasswordForm } from "@/components/Auth/ResetPasswordForm";

interface NewPasswordForm {
  new_password: string;
  confirm_password: string;
}

const searchSchema = z.object({
  token: z.string().min(1),
});

export const Route = createFileRoute("/_auth/reset-password")({
  validateSearch: searchSchema,
  component: ResetPassword,
  beforeLoad: async ({ search }) => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;
    if (token) throw redirect({ to: "/" });
    if (!search.token) throw redirect({ to: "/login" });
  },
});

function ResetPassword() {
  const { token } = Route.useSearch();
  const navigate = useNavigate();

  const mutation = useLoginResetPassword({
    mutation: {
      onSuccess: () => {
        toast.success("Password updated successfully.");
        navigate({ to: "/login" });
      },
      onError: (err) => handleError(err),
    },
  });

  const onSubmit: SubmitHandler<NewPasswordForm> = async (data) => {
    mutation.mutateAsync({ data: { new_password: data.new_password, token } });
  };

  return <ResetPasswordForm onSubmit={onSubmit} />;
}
