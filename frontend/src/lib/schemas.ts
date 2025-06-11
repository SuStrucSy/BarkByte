import { z } from 'zod'


// 👀 define the schema

export const loginSchema = z.object({
  username: z.string().email().max(255, { message: "username is too long max 255 characters"}),
  password: z.string().min(8, {message: "password should be at least 8 characters long"}).max(64, {message: "Password is too long max 64 characters"}),
})

export const accessTokenSchema = z.object({
  access_token: z.string(),
  token_type: z.string().optional()
})
