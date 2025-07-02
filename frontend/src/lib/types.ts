import type { z } from "zod";
import type { schemas } from "@/lib/api";
import type { loginSchema } from "./schemas";

export type AccessToken = z.infer<typeof loginSchema>;
export type UserPublic = z.infer<typeof schemas.UserPublic>;
export type UserRegister = z.infer<typeof schemas.UserRegister>;
export type NewAccount = z.infer<typeof schemas.NewAccount>;
export type NewPassword = z.infer<typeof schemas.NewPassword>;

export type UserCreate = z.infer<typeof schemas.UserCreate>;
export type UserUpdate = z.infer<typeof schemas.UserUpdate>;
export type UserUpdateMe = z.infer<typeof schemas.UserUpdateMe>;

export type UpdatePassword = z.infer<typeof schemas.UpdatePassword>;
