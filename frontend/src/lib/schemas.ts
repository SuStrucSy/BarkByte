import { z } from "zod";

// 👀 define the schema

export const loginSchema = z.object({
	username: z
		.string()
		.email()
		.max(255, { message: "username is too long max 255 characters" }),
	password: z
		.string()
		.min(8, { message: "password should be at least 8 characters long" })
		.max(64, { message: "Password is too long max 64 characters" }),
});

export const accessTokenSchema = z.object({
	access_token: z.string(),
	token_type: z.string().optional(),
});

export const signupSchema = z
	.object({
		email: z
			.string()
			.email()
			.max(255, { message: "email is too long max 255 characters" }),
		password: z
			.string()
			.min(8, { message: "password should be at least 8 characters long" })
			.max(64, { message: "Password is too long max 64 characters" }),
		confirm_password: z
			.string()
			.min(8, { message: "password should be at least 8 characters long" })
			.max(64, { message: "Password is too long max 64 characters" }),
		full_name: z.union([z.string(), z.null()]).optional(),
	})
	.superRefine(({ confirm_password, password }, ctx) => {
		if (confirm_password !== password) {
			ctx.addIssue({
				code: "custom",
				message: "The passwords did not match",
				path: ["confirm_password"],
			});
		}
	});

export const resetPasswordSchema = z
	.object({
		new_password: z
			.string()
			.min(8, { message: "password should be at least 8 characters long" })
			.max(64, { message: "Password is too long max 64 characters" }),
		confirm_password: z
			.string()
			.min(8, { message: "password should be at least 8 characters long" })
			.max(64, { message: "Password is too long max 64 characters" }),
	})
	.superRefine(({ confirm_password, new_password }, ctx) => {
		if (confirm_password !== new_password) {
			ctx.addIssue({
				code: "custom",
				message: "The passwords did not match",
				path: ["confirm_password"],
			});
		}
	});

export const recoverPasswordSchema = z.object({
	email: z
		.string()
		.email()
		.max(255, { message: "email is too long max 255 characters" }),
});

export const addUserSchema = z
	.object({
		email: z
			.string()
			.email()
			.max(255, { message: "email is too long max 255 characters" }),
		password: z
			.string()
			.min(8, { message: "password should be at least 8 characters long" })
			.max(64, { message: "Password is too long max 64 characters" }),
		confirm_password: z
			.string()
			.min(8, { message: "password should be at least 8 characters long" })
			.max(64, { message: "Password is too long max 64 characters" }),
		full_name: z.union([z.string(), z.null()]).optional(),
		is_active: z.boolean().optional().default(false),
		is_superuser: z.boolean().optional().default(false),
	})
	.superRefine(({ confirm_password, password }, ctx) => {
		if (confirm_password !== password) {
			ctx.addIssue({
				code: "custom",
				message: "The passwords did not match",
				path: ["confirm_password"],
			});
		}
	});


export const updatePasswordSchema = z
  .object({
    current_password: z
      .string()
      .min(8, { message: "password should be at least 8 characters long" })
      .max(64, { message: "Password is too long max 64 characters" }),
    new_password: z
      .string()
      .min(8, { message: "password should be at least 8 characters long" })
      .max(64, { message: "Password is too long max 64 characters" }),
    confirm_password: z
      .string()
      .min(8, { message: "password should be at least 8 characters long" })
      .max(64, { message: "Password is too long max 64 characters" }),
  })
  .superRefine(({ confirm_password, new_password }, ctx) => {
    if (confirm_password !== new_password) {
      ctx.addIssue({
        code: "custom",
        message: "The passwords did not match",
        path: ["confirm_password"],
      });
    }
  });
