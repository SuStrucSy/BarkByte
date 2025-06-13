import {z} from 'zod';
import { schemas } from '@/lib/api';
import type { loginSchema } from './schemas';

export type AccessToken = z.infer<typeof loginSchema>
export type UserPublic = z.infer<typeof schemas.UserPublic>
export type UserRegister = z.infer<typeof schemas.UserRegister>
