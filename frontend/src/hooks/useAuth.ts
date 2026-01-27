import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { handleError } from "@/utils";
import {
  getUsersReadUserMeQueryKey,
  useUsersReadUserMe,
  useUsersRegisterUser,
  useUsersVerifyEmail,
} from "@/api/endpoints/users/users.gen";
import { useLoginLoginAccessToken } from "@/api/endpoints/login/login.gen";
import type { HTTPValidationError } from "@/api/model";
import { useIsLoggedIn } from "./useIsLoggedIn";

const useAuth = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // const { data: user } = useQuery<UserPublic | null, Error>({
  // 	queryKey: ["currentUser"],
  // 	queryFn: async () => {
  // 		const data = await api.get("/api/v1/users/me");
  // 		return data;
  // 	},
  // 	enabled: isLoggedIn(),
  // });

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

  // const signUpMutation = useMutation({
  //   mutationFn: (data: UserRegister) =>
  //     api.post("/api/v1/users/signup", { ...data }),

  //   onSuccess: () => {
  //     navigate({ to: "/login" });
  //   },
  //   onError: (err) => {
  //     handleError(err);
  //   },
  //   onSettled: () => {
  //     queryClient.invalidateQueries({ queryKey: ["users"] });
  //   },
  // });

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

  // const verifyEmailMutation = useMutation({
  // 	mutationFn: (data: NewAccount) =>
  // 		api.post("/api/v1/users/verify-email/", { ...data }),

  // 	onSuccess: () => {
  // 		toast.success("Email verified successfully.");
  // 		navigate({ to: "/login" });
  // 	},
  // 	onError: (err) => {
  // 		handleError(err);
  // 	},
  // });

  const loginMutation = useLoginLoginAccessToken({
    mutation: {
      onSuccess: (data) => {
        if (data.access_token) {
          localStorage.setItem("access_token", data.access_token);
          queryClient.invalidateQueries({
            queryKey: getUsersReadUserMeQueryKey(), // ✅ Use generated key
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

  // const login = async (data: AccessToken) => {
  // 	const response = await api.post("/api/v1/login/access-token", data);
  // 	localStorage.setItem("access_token", response.access_token);
  // };

  // const loginMutation = useMutation({
  // 	mutationFn: login,
  // 	onSuccess: () => {
  // 		navigate({ to: "/" });
  // 	},
  // 	onError: (err) => {
  // 		handleError(err);
  // 	},
  // });

  const logout = () => {
    localStorage.removeItem("access_token");
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
