import {z} from 'zod';

export const verifySchema = z.object({
  code: z.string().min(6, {message: 'Token must be at least 6 characters'}),   
}); 