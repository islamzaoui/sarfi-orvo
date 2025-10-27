import { z } from 'zod/v4-mini';

const email = z.email();
const password = z
	.string()
	.check(
		z.minLength(8, 'Password must be at least 8 character'),
		z.maxLength(71, 'Password cannot exceed 71 characters')
	);

export const registerSchema = z
	.object({
		email,
		password,
		confirmPassword: z.string(),
	})
	.check(
		z.refine((data) => data.password === data.confirmPassword, {
			message: 'Passwords do not match',
			path: ['confirmPassword'],
		})
	);

export type RegisterBody = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
	email,
	password,
});

export type LoginBody = z.infer<typeof loginSchema>;
