import { form, query } from '$app/server';

import { loginSchema, registerSchema } from '@/schemas/auth.schema';
import { useService } from '@/server/container';

export const registerForm = form(
	registerSchema,
	async (data, invalid) => await useService('AuthService').register(data, invalid)
);

export const loginForm = form(
	loginSchema,
	async (data, invalid) => await useService('AuthService').login(data, invalid)
);

export const getSessionQuery = query(async () => useService('AuthService').getClientSession());

export const logoutForm = form(async () => await useService('AuthService').logout());
