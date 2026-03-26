import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { z } from "zod/v4";
import ErrorComponent from "@/components/Common/Error";
import { VerifyEmailComponent } from "@/components/Common/VerifyEmail";
import useAuth from "@/hooks/useAuth";

const verifyEmailSearchSchema = z.object({
  token: z.string().min(1).optional(),
});

type VerifyEmailSearch = z.infer<typeof verifyEmailSearchSchema>;

export const Route = createFileRoute("/verify-email")({
  validateSearch: (search): VerifyEmailSearch =>
    verifyEmailSearchSchema.parse(search),
  component: VerifyEmail,
});

function VerifyEmail() {
  const { verifyEmailMutation } = useAuth();
  const { token } = Route.useSearch();

  useEffect(() => {
    if (
      token &&
      !verifyEmailMutation.isPending &&
      !verifyEmailMutation.isSuccess &&
      !verifyEmailMutation.isError
    ) {
      verifyEmailMutation.mutate({ data: { token } });
    }
  }, [token, verifyEmailMutation]);

  if (!token) {
    return <ErrorComponent error={new Error("Missing verification token.")} />;
  }

  if (verifyEmailMutation.isPending) {
    return (
      <VerifyEmailComponent
        icon="loading"
        title="Verifying your email"
        message="This should only take a moment."
      />
    );
  }

  if (verifyEmailMutation.isError) {
    return <ErrorComponent error={verifyEmailMutation.error} />;
  }

  if (verifyEmailMutation.isSuccess) {
    return (
      <VerifyEmailComponent
        icon="success"
        title="Email verified"
        message={verifyEmailMutation.data.message}
        action={{ label: "Continue to sign in", to: "/login" }}
      />
    );
  }

  return null;
}
