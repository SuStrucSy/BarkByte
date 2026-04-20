import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { type SubmitHandler } from "react-hook-form";
import type { UserRegister } from "@/api/model";
import { SignUpSuccessComponent } from "@/components/Auth/SignUpSuccess";
import useAuth from "@/hooks/useAuth";

import { SignUpForm } from "@/components/Auth/SignUpForm";

export const Route = createFileRoute("/_auth/signup")({
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

  const onSubmit: SubmitHandler<UserRegisterForm> = (data) => {
    signUpMutation.mutate(
      { data },
      {
        onSuccess: () => setIsSuccess(true),
      },
    );
  };

  if (isSuccess) {
    return (
      <SignUpSuccessComponent
        title="Account created"
        message="We've sent a verification email to your inbox. Please check your email to activate your account."
        action={{ label: "Go to Login", to: "/login" }}
      />
    );
  }

  return <SignUpForm onSubmit={onSubmit} />;
}
