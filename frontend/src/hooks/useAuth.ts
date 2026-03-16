import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { handleError } from "@/utils";
import {
  getUsersReadUserMeQueryKey,
  useUsersRegisterUser,
  useUsersVerifyEmail,
} from "@/api/endpoints/users/users.gen";
import { useLoginLoginAccessToken } from "@/api/endpoints/login/login.gen";
import type { HTTPValidationError } from "@/api/model";
import { dispatchAuthChange } from "./useIsLoggedIn";

const useAuth = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const signUpMutation = useUsersRegisterUser({
    mutation: {
      onSuccess: () => {
        navigate({ to: "/login" });
      },
      onError: (err) => {
        handleError(err);
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ["users"] });
      },
    },
  });

  const verifyEmailMutation = useUsersVerifyEmail({
    mutation: {
      onSuccess: () => {
        toast.success("Email verified successfully.");
        navigate({ to: "/login" });
      },
      onError: (err) => {
        handleError(err);
      },
    },
  });

  const loginMutation = useLoginLoginAccessToken({
    mutation: {
      onSuccess: (data) => {
        if (data.access_token) {
          localStorage.setItem("access_token", data.access_token);
          dispatchAuthChange(true);
          queryClient.invalidateQueries({
            queryKey: getUsersReadUserMeQueryKey(),
          });
          navigate({ to: "/" });
        }
      },
      onError: (err: void | HTTPValidationError) => {
        console.error(err);
        handleError(err);
      },
    },
  });

  const logout = () => {
    localStorage.removeItem("access_token");
    queryClient.clear();
    dispatchAuthChange(false);
    navigate({ to: "/" });
  };

  return {
    signUpMutation,
    verifyEmailMutation,
    loginMutation,
    logout,
    error,
    resetError: () => setError(null),
  };
};

export default useAuth;
