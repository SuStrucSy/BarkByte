import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { type SubmitHandler } from "react-hook-form";
import { toast } from "sonner";
import z from "zod/v4";
import { useLoginSetPassword } from "@/api/endpoints/login/login";

import { handleError } from "@/lib/utils";
import { SetPasswordForm } from "@/components/Auth/SetPasswordForm";

interface SetPasswordForm {
  new_password: string;
  confirm_password: string;
}

const searchSchema = z.object({
  token: z.string().min(1),
  email: z.email(),
});

export const Route = createFileRoute("/_auth/set-password")({
  validateSearch: searchSchema,
  component: SetPasswordPage,
  beforeLoad: async ({ search }) => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;
    if (token) throw redirect({ to: "/" });
    if (!search.token) throw redirect({ to: "/login" });
  },
});

function SetPasswordPage() {
  const { token, email } = Route.useSearch();
  const navigate = useNavigate();

  const mutation = useLoginSetPassword({
    mutation: {
      onSuccess: (data) => {
        toast.success("Password set successfully.");
        localStorage.setItem("access_token", data.access_token);
        navigate({ to: "/" });
      },
      onError: (err) => handleError(err),
    },
  });

  const onSubmit: SubmitHandler<SetPasswordForm> = async (data) => {
    mutation.mutateAsync({ data: { new_password: data.new_password, token } });
  };

  return <SetPasswordForm onSubmit={onSubmit} email={email} />;
}
