import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import z from "zod/v4";
import useAuth from "@/hooks/useAuth";
import ErrorComponent from "@/components/Common/Error";

const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

export const Route = createFileRoute("/verify-email")({
  validateSearch: verifyEmailSchema,
  component: VerifyEmail,
});

function VerifyEmail() {
  const { verifyEmailMutation } = useAuth();
  const { token } = Route.useSearch();
  useEffect(() => {
    if (token) {
      verifyEmailMutation.mutate({ data: { token } });
    }
  }, [token]);

  if (verifyEmailMutation.isPending) return <div>Verifying your email...</div>;
  if (verifyEmailMutation.isError)
    return <ErrorComponent error={verifyEmailMutation.error} />;
  if (verifyEmailMutation.isSuccess)
    return <div>{verifyEmailMutation.data.message}</div>;

  return null;
}
