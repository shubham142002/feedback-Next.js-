import { z } from "zod";

export const usernamevalidation = z
.string()
.min(3, 'Username must be at least 2 characters')
.max(20, 'Username must be at most 20 characters')
.regex(/^[a-zA-Z0-9_]+$/, 'Username must not contain special characters');

export const signUpSchema = z.object({
  email: z
  .string()
  .email({ message: 'Invalid email address' }),
  password: z
  .string()
  .min(6 ,{ message: 'Password must be at least 6 characters' }),
});
