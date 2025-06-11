import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

const Body_login_login_access_token = z
  .object({
    grant_type: z.union([z.string(), z.null()]).optional(),
    username: z.string(),
    password: z.string(),
    scope: z.string().optional(),
    client_id: z.union([z.string(), z.null()]).optional(),
    client_secret: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const Token = z.object({ access_token: z.string(), token_type: z.string().optional().default("bearer") }).passthrough();
const ValidationError = z
  .object({ loc: z.array(z.union([z.string(), z.number()])), msg: z.string(), type: z.string() })
  .passthrough();
const HTTPValidationError = z
  .object({ detail: z.array(ValidationError) })
  .partial()
  .passthrough();
const UserPublic = z
  .object({
    email: z.string().max(255).email(),
    is_active: z.boolean().optional().default(true),
    is_superuser: z.boolean().optional().default(false),
    full_name: z.union([z.string(), z.null()]).optional(),
    id: z.string().uuid(),
  })
  .passthrough();
const Message = z.object({ message: z.string() }).passthrough();
const NewPassword = z.object({ token: z.string(), new_password: z.string().min(8).max(64) }).passthrough();
const PrivateUserCreate = z
  .object({
    email: z.string(),
    password: z.string(),
    full_name: z.string(),
    is_verified: z.boolean().optional().default(false),
  })
  .passthrough();

export const schemas = {
  Body_login_login_access_token,
  Token,
  ValidationError,
  HTTPValidationError,
  UserPublic,
  Message,
  NewPassword,
  PrivateUserCreate,
};

const endpoints = makeApi([
  {
    method: "post",
    path: "/api/v1/login/access-token",
    description: `OAuth2 compatible token login, get an access token for future requests`,
    requestFormat: "form-url",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: Body_login_login_access_token,
      },
    ],
    response: Token,
    errors: [
      {
        status: 400,
        description: `Incorrect email or password`,
        schema: z.void(),
      },
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/api/v1/login/test-token",
    description: `Test access token`,
    requestFormat: "json",
    response: UserPublic,
  },
  {
    method: "post",
    path: "/api/v1/password-recovery/:email",
    description: `Password Recovery`,
    requestFormat: "json",
    parameters: [
      {
        name: "email",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.object({ message: z.string() }).passthrough(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/api/v1/private/users/",
    description: `Get all users.`,
    requestFormat: "json",
    response: z.array(UserPublic),
  },
  {
    method: "post",
    path: "/api/v1/private/users/",
    description: `Create a new user.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PrivateUserCreate,
      },
    ],
    response: UserPublic,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/api/v1/reset-password/",
    description: `Reset password`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: NewPassword,
      },
    ],
    response: z.object({ message: z.string() }).passthrough(),
    errors: [
      {
        status: 400,
        description: `Invalid token or inactive user`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `The user with this email does not exist in the system.`,
        schema: z.void(),
      },
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/api/v1/utils/health-check/",
    requestFormat: "json",
    response: z.boolean(),
  },
]);

export const api = new Zodios(import.meta.env.VITE_API_URL, endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
