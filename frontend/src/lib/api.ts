import { z } from "zod/v4";

import {initContract} from "@ts-rest/core"


const c = initContract();

const Body_login_login_access_token = z
  .looseObject({
    grant_type: z
      .union([
        z
          .string()
          .regex(/^password$/)
          .nullable(),
        z.null(),
        z.string().regex(/^password$/),
      ])
      .optional(),
    username: z.string(),
    password: z.string(),
    scope: z.string().optional().default(""),
    client_id: z
      .union([z.string().nullable(), z.null(), z.string()])
      .optional(),
    client_secret: z
      .union([z.string().nullable(), z.null(), z.string()])
      .optional(),
  });
const ValidationError = z
  .looseObject({
    loc: z.array(
      z.union([
        z.number().int(),
        z.string(),
      ]),
    ),
    msg: z.string(),
    type: z.string(),
  });
const HTTPValidationError = z
  .looseObject({ detail: z.array(ValidationError).optional() });
const Message = z.looseObject({ message: z.string() });
const NewAccount = z.looseObject({ token: z.string() });
const NewPassword = z
  .looseObject({ token: z.string(), new_password: z.string().min(8).max(64) });
const PrivateUserCreate = z
  .looseObject({
    email: z.string(),
    password: z.string(),
    full_name: z.string(),
    is_verified: z.boolean().optional().default(false),
  });
const Token = z
  .looseObject({
    access_token: z.string(),
    token_type: z.string().optional().default("bearer"),
  });
const UpdatePassword = z
  .looseObject({
    current_password: z.string().min(8).max(64),
    new_password: z.string().min(8).max(64),
  });
const UserCreate = z
  .looseObject({
    email: z.string().max(255).email(),
    is_active: z.boolean().optional().default(false),
    is_superuser: z.boolean().optional().default(false),
    full_name: z
      .union([
        z.string().max(255).nullable(),
        z.null(),
        z.string().max(255),
      ])
      .optional(),
    password: z.string().min(8).max(64),
  });
const UserPublic = z
  .looseObject({
    email: z.email().max(255),
    is_active: z.boolean().optional().default(false),
    is_superuser: z.boolean().optional().default(false),
    full_name: z
      .union([
        z.string().max(255).nullable(),
        z.null(),
        z.string().max(255),
      ])
      .optional(),
    id: z.string().uuid(),
  });
const UserRegister = z
  .looseObject({
    email: z.email().max(255),
    password: z.string().min(8).max(64),
    full_name: z
      .union([
        z.string().max(255).nullable(),
        z.null(),
        z.string().max(255),
      ])
      .optional(),
  });
const UserUpdate = z
  .looseObject({
    email: z
      .union([
        z.email().max(255).nullable(),
        z.null(),
        z.email().max(255),
      ])
      .optional(),
    is_active: z.boolean().optional().default(false),
    is_superuser: z.boolean().optional().default(false),
    full_name: z
      .union([
        z.string().max(255).nullable(),
        z.null(),
        z.string().max(255),
      ])
      .optional(),
    password: z
      .union([
        z.string().min(8).max(64).nullable(),
        z.null(),
        z.string().min(8).max(64),
      ])
      .optional(),
  });
const UserUpdateMe = z
  .looseObject({
    full_name: z
      .union([
        z.string().max(255).nullable(),
        z.null(),
        z.string().max(255),
      ])
      .optional(),
    email: z
      .union([
        z.email().max(255).nullable(),
        z.null(),
        z.email().max(255),
      ])
      .optional(),
  });
const UsersPublic = z
  .looseObject({ data: z.array(UserPublic), count: z.number().int() });

export const schemas = {
  Body_login_login_access_token,
  ValidationError,
  HTTPValidationError,
  Message,
  NewAccount,
  NewPassword,
  PrivateUserCreate,
  Token,
  UpdatePassword,
  UserCreate,
  UserPublic,
  UserRegister,
  UserUpdate,
  UserUpdateMe,
  UsersPublic,
};

export const contract = c.router({
  loginLoginAccessToken: {
    method: "POST",
    path: "/api/v1/login/access-token",
    summary: "Login Access Token",
    body: Body_login_login_access_token,
    contentType: "application/x-www-form-urlencoded",
    responses: { 200: Token, 400: c.noBody(), 422: HTTPValidationError },
  },
  loginTestToken: {
    method: "POST",
    path: "/api/v1/login/test-token",
    summary: "Test Token",
    body: c.noBody(),
    responses: { 200: UserPublic },
  },
  loginRecoverPassword: {
    method: "POST",
    path: "/api/v1/password-recovery/:email",
    summary: "Recover Password",
    pathParams: z.object({ email: z.string() }),
    body: c.noBody(),
    responses: { 200: Message, 422: HTTPValidationError },
  },
  loginResetPassword: {
    method: "POST",
    path: "/api/v1/reset-password/",
    summary: "Reset Password",
    body: NewPassword,
    contentType: "application/json",
    responses: {
      200: Message,
      400: c.noBody(),
      404: c.noBody(),
      422: HTTPValidationError,
    },
  },
  usersReadUsers: {
    method: "GET",
    path: "/api/v1/users/",
    summary: "Read Users",
    query: z.object({
      skip: z.number().int().optional().default(0),
      limit: z.number().int().optional().default(100),
    }),
    responses: { 200: UsersPublic, 422: HTTPValidationError },
  },
  usersCreateUser: {
    method: "POST",
    path: "/api/v1/users/",
    summary: "Create User",
    body: UserCreate,
    contentType: "application/json",
    responses: { 200: UserPublic, 422: HTTPValidationError },
  },
  usersReadUserMe: {
    method: "GET",
    path: "/api/v1/users/me",
    summary: "Read User Me",
    responses: { 200: UserPublic },
  },
  usersDeleteUserMe: {
    method: "DELETE",
    path: "/api/v1/users/me",
    summary: "Delete User Me",
    body: c.noBody(),
    responses: { 200: Message },
  },
  usersUpdateUserMe: {
    method: "PATCH",
    path: "/api/v1/users/me",
    summary: "Update User Me",
    body: UserUpdateMe,
    contentType: "application/json",
    responses: { 200: UserPublic, 422: HTTPValidationError },
  },
  usersUpdatePasswordMe: {
    method: "PATCH",
    path: "/api/v1/users/me/password",
    summary: "Update Password Me",
    body: UpdatePassword,
    contentType: "application/json",
    responses: { 200: Message, 422: HTTPValidationError },
  },
  usersRegisterUser: {
    method: "POST",
    path: "/api/v1/users/signup",
    summary: "Register User",
    body: UserRegister,
    contentType: "application/json",
    responses: { 200: Message, 422: HTTPValidationError },
  },
  usersVerifyEmail: {
    method: "POST",
    path: "/api/v1/users/verify-email/",
    summary: "Verify Email",
    body: NewAccount,
    contentType: "application/json",
    responses: {
      200: Message,
      400: c.noBody(),
      404: c.noBody(),
      422: HTTPValidationError,
    },
  },
  usersReadUserById: {
    method: "GET",
    path: "/api/v1/users/:user_id",
    summary: "Read User By Id",
    pathParams: z.object({ user_id: z.string().uuid() }),
    responses: { 200: UserPublic, 422: HTTPValidationError },
  },
  usersUpdateUser: {
    method: "PATCH",
    path: "/api/v1/users/:user_id",
    summary: "Update User",
    pathParams: z.object({ user_id: z.string().uuid() }),
    body: UserUpdate,
    contentType: "application/json",
    responses: { 200: UserPublic, 422: HTTPValidationError },
  },
  usersDeleteUser: {
    method: "DELETE",
    path: "/api/v1/users/:user_id",
    summary: "Delete User",
    pathParams: z.object({ user_id: z.string().uuid() }),
    body: c.noBody(),
    responses: { 200: Message, 422: HTTPValidationError },
  },
  utilsHealthCheck: {
    method: "GET",
    path: "/api/v1/utils/health-check/",
    summary: "Health Check",
    responses: { 200: z.boolean() },
  },
  privateGetAllUsers: {
    method: "GET",
    path: "/api/v1/private/users/",
    summary: "Get All Users",
    responses: { 200: z.array(UserPublic) },
  },
  privateCreateUser: {
    method: "POST",
    path: "/api/v1/private/users/",
    summary: "Create User",
    body: PrivateUserCreate,
    contentType: "application/json",
    responses: { 200: UserPublic, 422: HTTPValidationError },
  },
});

