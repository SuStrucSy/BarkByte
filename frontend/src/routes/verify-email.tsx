import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod/v4";
import ErrorComponent from "@/components/Common/Error";
import { VerifyEmailComponent } from "@/components/Common/VerifyEmail";
import { usersVerifyEmail } from "@/api/endpoints/users/users";
import { useState } from "react";

const verifyEmailSearchSchema = z.object({
  token: z.string().min(1).optional(),
});

type VerifyEmailSearch = z.infer<typeof verifyEmailSearchSchema>;

type VerifyState =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "success"; message: string }
  | { phase: "error"; error: unknown };

export const Route = createFileRoute("/verify-email")({
  validateSearch: (search): VerifyEmailSearch =>
    verifyEmailSearchSchema.parse(search),

  loaderDeps: ({ search }) => ({
    token: search.token,
  }),

  loader: ({ deps }) => {
    const token = deps.token;

    if (!token) {
      return { status: "missing" as const };
    }
    return { status: "pending" as const, token: deps.token };
  },
  component: VerifyEmail,
});

function VerifyEmail() {
  const data = Route.useLoaderData();
  const [state, setState] = useState<VerifyState>({ phase: "idle" });

  if (data.status === "missing") {
    return <ErrorComponent error={new Error("Missing verification token.")} />;
  }

  async function handleVerify() {
    if (data.status !== "pending") return;
    setState({ phase: "loading" });
    try {
      const res = await usersVerifyEmail({ token: data.token });
      setState({
        phase: "success",
        message: res.message ?? "Email verified successfully.",
      });
    } catch (err) {
      setState({ phase: "error", error: err });
    }
  }

  if (state.phase === "error") {
    const error =
      state.error instanceof Error
        ? state.error
        : new Error(String(state.error));
    return <ErrorComponent error={error} />;
  }

  if (state.phase === "success") {
    return (
      <VerifyEmailComponent
        icon="success"
        title="Email verified"
        message={state.message}
        action={{ label: "Continue to sign in", to: "/login" }}
      />
    );
  }

  if (state.phase === "loading") {
    return (
      <VerifyEmailComponent
        icon="loading"
        title="Verifying your email"
        message="Please wait..."
      />
    );
  }

  // idle — user must click to trigger the actual API call
  return (
    <VerifyEmailComponent
      icon="email"
      title="Confirm your email address"
      message="Click the button below to verify your email."
      action={{ label: "Verify my email", onClick: handleVerify }}
    />
  );
}
