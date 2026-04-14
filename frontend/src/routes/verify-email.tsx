import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod/v4";
import ErrorComponent from "@/components/Common/Error";
import { VerifyEmailComponent } from "@/components/Common/VerifyEmail";
import { usersVerifyEmail } from "@/api/endpoints/users/users";

const verifyEmailSearchSchema = z.object({
  token: z.string().min(1).optional(),
});

type VerifyEmailSearch = z.infer<typeof verifyEmailSearchSchema>;

export const Route = createFileRoute("/verify-email")({
  validateSearch: (search): VerifyEmailSearch =>
    verifyEmailSearchSchema.parse(search),

  loaderDeps: ({ search }) => ({
    token: search.token,
  }),

  loader: async ({ deps }) => {
    const token = deps.token;

    if (!token) {
      return {
        status: "error",
        error: new Error("Missing verification token."),
      };
    }

    try {
      const res = await usersVerifyEmail({
        token,
      });

      return {
        status: "success",
        message: res.message ?? "Email verified successfully.",
      };
    } catch (err) {
      return {
        status: "error",
        error: err,
      };
    }
  },
  component: VerifyEmail,
});

function VerifyEmail() {
  const data = Route.useLoaderData();

  if (data.status === "error") {
    return <ErrorComponent error={data.error} />;
  }

  if (data.status === "success") {
    return (
      <VerifyEmailComponent
        icon="success"
        title="Email verified"
        message={data.message}
        action={{ label: "Continue to sign in", to: "/login" }}
      />
    );
  }

  return (
    <VerifyEmailComponent
      icon="loading"
      title="Verifying your email"
      message="Please wait..."
    />
  );
}
