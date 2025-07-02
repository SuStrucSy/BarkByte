import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

const Body_login_login_access_token = z
	.object({
		grant_type: z.union([z.string(), z.null()]).optional(),
		username: z.string(),
		password: z.string(),
		scope: z.string().optional().default(""),
		client_id: z.union([z.string(), z.null()]).optional(),
		client_secret: z.union([z.string(), z.null()]).optional(),
	})
	.passthrough();
const Token = z
	.object({
		access_token: z.string(),
		token_type: z.string().optional().default("bearer"),
	})
	.passthrough();
const ValidationError = z
	.object({
		loc: z.array(z.union([z.string(), z.number()])),
		msg: z.string(),
		type: z.string(),
	})
	.passthrough();
const HTTPValidationError = z
	.object({ detail: z.array(ValidationError) })
	.partial()
	.passthrough();
const UserPublic = z
	.object({
		email: z.string().max(255).email(),
		is_active: z.boolean().optional().default(false),
		is_superuser: z.boolean().optional().default(false),
		full_name: z.union([z.string(), z.null()]).optional(),
		id: z.string().uuid(),
	})
	.passthrough();
const Message = z.object({ message: z.string() }).passthrough();
const NewPassword = z
	.object({ token: z.string(), new_password: z.string().min(8).max(64) })
	.passthrough();
const UsersPublic = z
	.object({ data: z.array(UserPublic), count: z.number().int() })
	.passthrough();
const UserCreate = z
	.object({
		email: z.string().max(255).email(),
		is_active: z.boolean().optional().default(false),
		is_superuser: z.boolean().optional().default(false),
		full_name: z.union([z.string(), z.null()]).optional(),
		password: z.string().min(8).max(64),
	})
	.passthrough();
const UserUpdateMe = z
	.object({
		full_name: z.union([z.string(), z.null()]),
		email: z.union([z.string(), z.null()]),
	})
	.partial()
	.passthrough();
const UpdatePassword = z
	.object({
		current_password: z.string().min(8).max(64),
		new_password: z.string().min(8).max(64),
	})
	.passthrough();
const UserRegister = z
	.object({
		email: z.string().max(255).email(),
		password: z.string().min(8).max(64),
		full_name: z.union([z.string(), z.null()]).optional(),
	})
	.passthrough();
const NewAccount = z.object({ token: z.string() }).passthrough();
const UserUpdate = z
	.object({
		email: z.union([z.string(), z.null()]),
		is_active: z.boolean().default(false),
		is_superuser: z.boolean().default(false),
		full_name: z.union([z.string(), z.null()]),
		password: z.union([z.string(), z.null()]),
	})
	.partial()
	.passthrough();
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
	UsersPublic,
	UserCreate,
	UserUpdateMe,
	UpdatePassword,
	UserRegister,
	NewAccount,
	UserUpdate,
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
		path: "/api/v1/users/",
		description: `Retrieve users.`,
		requestFormat: "json",
		parameters: [
			{
				name: "skip",
				type: "Query",
				schema: z.number().int().optional().default(0),
			},
			{
				name: "limit",
				type: "Query",
				schema: z.number().int().optional().default(100),
			},
		],
		response: UsersPublic,
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
		path: "/api/v1/users/",
		description: `Create new user.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: UserCreate,
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
		method: "get",
		path: "/api/v1/users/:user_id",
		description: `Get a specific user by id.`,
		requestFormat: "json",
		parameters: [
			{
				name: "user_id",
				type: "Path",
				schema: z.string().uuid(),
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
		method: "patch",
		path: "/api/v1/users/:user_id",
		description: `Update a user.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: UserUpdate,
			},
			{
				name: "user_id",
				type: "Path",
				schema: z.string().uuid(),
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
		method: "delete",
		path: "/api/v1/users/:user_id",
		description: `Delete a user.`,
		requestFormat: "json",
		parameters: [
			{
				name: "user_id",
				type: "Path",
				schema: z.string().uuid(),
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
		path: "/api/v1/users/me",
		description: `Get current user.`,
		requestFormat: "json",
		response: UserPublic,
	},
	{
		method: "delete",
		path: "/api/v1/users/me",
		description: `Delete own user.`,
		requestFormat: "json",
		response: z.object({ message: z.string() }).passthrough(),
	},
	{
		method: "patch",
		path: "/api/v1/users/me",
		description: `Update own user.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: UserUpdateMe,
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
		method: "patch",
		path: "/api/v1/users/me/password",
		description: `Update own password.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: UpdatePassword,
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
		method: "post",
		path: "/api/v1/users/signup",
		description: `Create new user without the need to be logged in.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: UserRegister,
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
		method: "post",
		path: "/api/v1/users/verify-email/",
		description: `verify email and reset password.`,
		requestFormat: "json",
		parameters: [
			{
				name: "body",
				type: "Body",
				schema: NewAccount,
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
