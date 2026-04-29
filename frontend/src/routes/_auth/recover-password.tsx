import { createFileRoute, redirect } from "@tanstack/react-router";
import type { SubmitHandler } from "react-hook-form";
import { toast } from "sonner";
import { useLoginRecoverPassword } from "@/api/endpoints/login/login";
import { RecoverPasswordForm } from "@/components/Auth/RecoverPasswordForm";
import { handleError } from "@/lib/utils";

interface FormData {
	email: string;
}

export const Route = createFileRoute("/_auth/recover-password")({
	component: RecoverPasswordPage,
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

function RecoverPasswordPage() {
	const mutation = useLoginRecoverPassword({
		mutation: {
			onSuccess: () => {
				toast.success("Password recovery email sent successfully.");
			},
			onError: (err) => handleError(err),
		},
	});

	const onSubmit: SubmitHandler<FormData> = async (data) => {
		mutation.mutateAsync({ email: data.email });
	};

	return <RecoverPasswordForm onSubmit={onSubmit} />;
}
