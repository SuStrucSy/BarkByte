import { createFileRoute } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { useEffect } from "react";
import z from "zod";
import useAuth from "@/hooks/useAuth";

const verifyEmailSchema = z.object({
	token: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/verify-email")({
	validateSearch: zodValidator(verifyEmailSchema),
	component: VerifyEmail,
});

function VerifyEmail() {
	const { verifyEmailMutation } = useAuth();
	const { token } = Route.useSearch();
	useEffect(() => {
		if (token) {
			verifyEmailMutation.mutate({ token });
		}
	}, [token, verifyEmailMutation]);

	if (verifyEmailMutation.isPending) return <div>Loading...</div>;
	if (verifyEmailMutation.isError)
		return <div>Error: {verifyEmailMutation.error.message}</div>;

	return (
		<div>
			<h1>Email Verification</h1>
			{verifyEmailMutation.isSuccess && (
				<p>{verifyEmailMutation.data.message}</p>
			)}
		</div>
	);
}
