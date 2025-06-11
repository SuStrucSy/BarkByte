import {z} from 'zod';
import { schemas } from '@/lib/api';
import type { loginSchema, UserPublicSchema } from './schemas';

export type AccessToken = z.infer<typeof loginSchema>
export type UserPublic = z.infer<typeof UserPublicSchema>
