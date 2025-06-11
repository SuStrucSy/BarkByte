import { api } from '@/lib/api'
import type { AccessToken, UserPublic } from '@/lib/types'
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"

import { handleError } from "@/utils"


const isLoggedIn = () => {
  return localStorage.getItem("access_token") !== null
}

const useAuth = () => {
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: user } = useQuery<UserPublic | null, Error>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const data = await api.get("/api/v1/users/me")
      return data
    },
    enabled: isLoggedIn(),
  })


  // const signUpMutation = useMutation({
  //   mutationFn: (data: UserRegister) =>
  //     UsersService.registerUser({ requestBody: data }),

  //   onSuccess: () => {
  //     navigate({ to: "/login" })
  //   },
  //   onError: (err) => {
  //    console.error(err)
  //   },
  //   onSettled: () => {
  //     queryClient.invalidateQueries({ queryKey: ["users"] })
  //   },
  // })

  const login = async (data: AccessToken) => {
    const response = await api.post("/api/v1/login/access-token", data)
    localStorage.setItem("access_token", response.access_token)
  }

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      navigate({ to: "/" })
    },
    onError: (err) => {
      handleError(err)
    },
  })

  const logout = () => {
    localStorage.removeItem("access_token")
    navigate({ to: "/login" })
  }

  return {
    //signUpMutation,
    loginMutation,
    logout,
    user,
    error,
    resetError: () => setError(null),
  }
}

export { isLoggedIn }
export default useAuth
